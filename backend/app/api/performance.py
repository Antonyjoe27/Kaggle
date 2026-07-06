from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.deps import get_db
from app.core.models import TeamMember, Course, CourseAssignment, EmployeePerformance, Project
from app.core.schemas import (
    EvaluateEmployeeRequest, PerformanceEvaluationResponse,
    AssignCoursesRequest, CourseAssignmentResponse,
)
from app.core.ai_agents import PerformanceAgent, LearningPathAssignmentAgent

router = APIRouter()


@router.post("/{employee_id}/evaluate", response_model=PerformanceEvaluationResponse)
def evaluate_employee(employee_id: int, request: EvaluateEmployeeRequest, db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.id == employee_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Employee not found")

    catalog = [
        {"id": c.id, "title": c.title, "category": c.category,
         "difficulty": c.difficulty, "duration_hours": c.duration_hours, "points": c.points}
        for c in db.query(Course).all()
    ]

    result = PerformanceAgent(course_catalog=catalog).evaluate(
        employee_profile={"id": str(member.id), "name": member.name, "designation": member.designation,
                          "skills": list((member.skill_profile or {}).keys())},
        learning_data=request.learning_data.model_dump(),
        validation_data=request.validation_data.model_dump(),
        project_data=request.project_data.model_dump(),
        skill_gaps=request.skill_gaps,
    )

    perf = EmployeePerformance(
        employee_id=employee_id,
        readiness_score=result["metrics"]["readiness_score"],
        competency_level=result["competency_level"],
        points_earned=result["metrics"]["points_earned"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        summary=result["summary"],
        metrics=result["metrics"],
        points_breakdown=result["points_breakdown"],
    )
    db.add(perf)
    db.commit()
    db.refresh(perf)

    return PerformanceEvaluationResponse(
        employee_id=employee_id,
        readiness_score=result["metrics"]["readiness_score"],
        competency_level=result["competency_level"],
        points_earned=result["metrics"]["points_earned"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        summary=result["summary"],
        recommendations=result["recommendations"],
        points_breakdown=result["points_breakdown"],
        metrics=result["metrics"],
    )


@router.get("/{employee_id}/history")
def get_evaluation_history(employee_id: int, db: Session = Depends(get_db)):
    member = db.query(TeamMember).filter(TeamMember.id == employee_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Employee not found")
    evals = (db.query(EmployeePerformance)
               .filter(EmployeePerformance.employee_id == employee_id)
               .order_by(EmployeePerformance.evaluated_at.desc()).all())
    return [{"id": e.id, "readiness_score": e.readiness_score, "competency_level": e.competency_level,
             "points_earned": e.points_earned, "summary": e.summary, "evaluated_at": e.evaluated_at}
            for e in evals]


@router.post("/{employee_id}/assign-courses", response_model=List[CourseAssignmentResponse])
def assign_courses(employee_id: int, request: AssignCoursesRequest, db: Session = Depends(get_db)):
    if not db.query(TeamMember).filter(TeamMember.id == employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")
    deadline = datetime.utcnow() + timedelta(days=7)
    created  = []
    for cid in request.course_ids:
        if not db.query(Course).filter(Course.id == cid).first():
            continue
        existing = db.query(CourseAssignment).filter(
            CourseAssignment.employee_id == employee_id,
            CourseAssignment.course_id   == cid).first()
        if existing:
            created.append(existing)
            continue
        a = CourseAssignment(employee_id=employee_id, course_id=cid, deadline=deadline)
        db.add(a)
        db.flush()
        created.append(a)
    db.commit()
    for a in created:
        db.refresh(a)
    return created


@router.post("/{employee_id}/auto-assign")
def auto_assign(employee_id: int, project_id: int, db: Session = Depends(get_db)):
    member  = db.query(TeamMember).filter(TeamMember.id == employee_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Employee not found")
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.required_skills:
        raise HTTPException(status_code=400,
            detail="Project not found or has no required_skills. Run POST /projects/{id}/analyze first.")

    catalog = [{"id": c.id, "title": c.title, "category": c.category,
                "difficulty": c.difficulty, "duration_hours": c.duration_hours, "points": c.points}
               for c in db.query(Course).all()]

    designation = (member.designation or "").lower()
    if any(x in designation for x in ["senior", "lead", "principal"]):
        exp_level = "senior"
    elif any(x in designation for x in ["junior", "fresher", "intern", "entry"]):
        exp_level = "fresher"
    else:
        exp_level = "mid-level"

    plan = LearningPathAssignmentAgent().assign(
        member={"id": member.id, "name": member.name,
                "designation": member.designation, "skill_profile": member.skill_profile},
        project_requirements=project.required_skills,
        course_catalog=catalog,
        experience_level=exp_level,
    )

    deadline = datetime.utcnow() + timedelta(days=7)
    for rec in plan["assigned_courses"]:
        if not db.query(CourseAssignment).filter(
                CourseAssignment.employee_id == employee_id,
                CourseAssignment.course_id   == rec["course_id"]).first():
            db.add(CourseAssignment(employee_id=employee_id, course_id=rec["course_id"], deadline=deadline))
    db.commit()

    return {**plan,
            "message": ("Courses assigned. HR approval required." if plan["requires_hr_approval"]
                        else "Courses auto-assigned. Employee can start immediately.")}
