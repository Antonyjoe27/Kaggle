"""
Employee Portal API — replaces the static data/*.json files the Employee Portal
app.js was previously fetching locally.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from app.deps import get_db
from app.core.models import TeamMember, Course, CourseAssignment, EmployeePerformance
from app.core.schemas import UpdateProgressRequest

router = APIRouter()


@router.get("/users")
def get_portal_users(db: Session = Depends(get_db)):
    members = db.query(TeamMember).all()
    return {f"employee_{m.id}": {"id": m.id, "name": m.name,
            "role": m.designation or "Engineer", "avatar": (m.name[0].upper() if m.name else "?"),
            "department": "Engineering"} for m in members}


@router.get("/courses")
def get_portal_courses(db: Session = Depends(get_db)):
    return [{"id": c.id, "title": c.title, "description": c.description or "",
             "category": c.category or "General", "difficulty": c.difficulty or "Intermediate",
             "duration": f"{c.duration_hours}h" if c.duration_hours else "Self-paced",
             "type": c.course_type or "skill",
             "bannerGradient": c.banner_gradient or "linear-gradient(135deg,#6366f1,#8b5cf6)",
             "chapters": (c.syllabus or {}).get("chapters", [])}
            for c in db.query(Course).all()]


@router.get("/assignments")
def get_portal_assignments(db: Session = Depends(get_db)):
    result: Dict[str, List[Dict[str, Any]]] = {}
    for a in db.query(CourseAssignment).all():
        key = f"employee_{a.employee_id}"
        result.setdefault(key, []).append({
            "courseId": a.course_id, "progress": a.progress,
            "deadline": a.deadline.strftime("%Y-%m-%d") if a.deadline else None,
            "status": a.status, "completedLessons": a.completed_lessons or [],
            "dateAssigned": a.assigned_at.strftime("%Y-%m-%d") if a.assigned_at else "",
            "assignmentId": a.id,
        })
    return result


@router.get("/assignments/{employee_id}")
def get_assignments_for_employee(employee_id: int, db: Session = Depends(get_db)):
    if not db.query(TeamMember).filter(TeamMember.id == employee_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")
    return [{"courseId": a.course_id, "progress": a.progress,
             "deadline": a.deadline.strftime("%Y-%m-%d") if a.deadline else None,
             "status": a.status, "completedLessons": a.completed_lessons or [],
             "assignmentId": a.id}
            for a in db.query(CourseAssignment).filter(CourseAssignment.employee_id == employee_id).all()]


@router.post("/progress/{assignment_id}")
def update_progress(assignment_id: int, request: UpdateProgressRequest, db: Session = Depends(get_db)):
    a = db.query(CourseAssignment).filter(CourseAssignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")

    completed = list(a.completed_lessons or [])
    if request.completed and request.lesson_id not in completed:
        completed.append(request.lesson_id)
    elif not request.completed and request.lesson_id in completed:
        completed.remove(request.lesson_id)
    a.completed_lessons = completed

    course = db.query(Course).filter(Course.id == a.course_id).first()
    total  = sum(len(ch.get("lessons", [])) for ch in (course.syllabus or {}).get("chapters", [])) if course and course.syllabus else 0
    a.progress = round((len(completed) / total) * 100) if total > 0 else (100 if request.completed else 0)
    a.status   = "completed" if a.progress == 100 else ("ongoing" if a.progress > 0 else "new")

    db.commit()
    db.refresh(a)
    return {"assignment_id": assignment_id, "progress": a.progress,
            "status": a.status, "completed_lessons": a.completed_lessons}


@router.get("/performance/{employee_id}")
def get_employee_performance(employee_id: int, db: Session = Depends(get_db)):
    perf = (db.query(EmployeePerformance)
              .filter(EmployeePerformance.employee_id == employee_id)
              .order_by(EmployeePerformance.evaluated_at.desc()).first())
    if not perf:
        return {"message": "No evaluation yet. Ask your HR manager to run an evaluation."}
    return {"readiness_score": perf.readiness_score, "competency_level": perf.competency_level,
            "points_earned": perf.points_earned, "strengths": perf.strengths,
            "weaknesses": perf.weaknesses, "summary": perf.summary,
            "metrics": perf.metrics, "points_breakdown": perf.points_breakdown,
            "evaluated_at": perf.evaluated_at}
