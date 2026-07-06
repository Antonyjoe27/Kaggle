"""
Seed script — populates the database with realistic sample data.
Run once after starting the backend:

    cd backend
    python seed.py

Safe to re-run: skips records that already exist.
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# ── DB setup (reuse the same engine/session as the app) ──────────────────────
from app.deps import engine, SessionLocal
from app.core.models import Base, Project, TeamMember, Report, Course, CourseAssignment, EmployeePerformance

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def exists(model, **kwargs):
    return db.query(model).filter_by(**kwargs).first() is not None

# ── 1. PROJECTS ───────────────────────────────────────────────────────────────
projects_data = [
    dict(id=1, name="AI Engineering Manager Platform",
         description="Internal tool to track project skills, team readiness, and learning paths.",
         deadline=datetime(2026, 12, 31).date(),
         jira_url="https://example.atlassian.net/browse/PROJ-1",
         required_skills=["Python", "FastAPI", "Docker", "PostgreSQL", "React"],
         technologies=["FastAPI", "PostgreSQL", "Next.js", "Docker"],
         complexity="Medium"),
    dict(id=2, name="Customer Analytics Dashboard",
         description="Real-time analytics platform for customer behaviour tracking using ML.",
         deadline=datetime(2026, 9, 30).date(),
         jira_url="https://example.atlassian.net/browse/PROJ-2",
         required_skills=["Python", "Machine Learning", "SQL", "React", "AWS"],
         technologies=["Python", "Pandas", "Scikit-learn", "AWS Lambda", "React"],
         complexity="High"),
    dict(id=3, name="Mobile Onboarding App",
         description="Cross-platform mobile app to streamline new employee onboarding.",
         deadline=datetime(2026, 8, 15).date(),
         jira_url="https://example.atlassian.net/browse/PROJ-3",
         required_skills=["React Native", "TypeScript", "Node.js", "Firebase"],
         technologies=["React Native", "TypeScript", "Firebase", "Expo"],
         complexity="Low"),
]
for p in projects_data:
    if not exists(Project, id=p["id"]):
        db.add(Project(**p))
        print(f"  + Project: {p['name']}")
    else:
        print(f"  ~ Project already exists: {p['name']}")
db.commit()

# ── 2. TEAM MEMBERS ───────────────────────────────────────────────────────────
members_data = [
    dict(id=1, name="Priya Sharma",       designation="Senior Backend Engineer",
         github_url="https://github.com/torvalds",
         skill_profile={"Python": 5, "FastAPI": 4, "PostgreSQL": 4, "Docker": 3, "AWS": 2}),
    dict(id=2, name="Antony George",      designation="DevOps Engineer",
         github_url="https://github.com/octocat",
         skill_profile={"Docker": 5, "Kubernetes": 4, "AWS": 4, "CI/CD": 3, "Python": 2}),
    dict(id=3, name="Maya Chen",          designation="Frontend Engineer",
         github_url="https://github.com/gaearon",
         skill_profile={"React": 5, "TypeScript": 4, "Next.js": 4, "CSS": 3, "Node.js": 2}),
    dict(id=4, name="Rahul Verma",        designation="Junior Backend Engineer",
         github_url="https://github.com/defunkt",
         skill_profile={"Python": 3, "SQL": 3, "FastAPI": 2, "Docker": 1}),
    dict(id=5, name="Sara Al-Mansoori",   designation="Machine Learning Engineer",
         github_url="https://github.com/mojombo",
         skill_profile={"Python": 5, "Machine Learning": 5, "Pandas": 4, "Scikit-learn": 4, "SQL": 3}),
    dict(id=6, name="James Okafor",       designation="Fresher — Software Engineer",
         github_url="https://github.com/wycats",
         skill_profile={"Python": 2, "JavaScript": 2, "HTML": 3}),
]
for m in members_data:
    if not exists(TeamMember, id=m["id"]):
        db.add(TeamMember(**m))
        print(f"  + Member: {m['name']} ({m['designation']})")
    else:
        print(f"  ~ Member already exists: {m['name']}")
db.commit()

# ── 3. COURSES ────────────────────────────────────────────────────────────────
courses_data = [
    # Beginner
    dict(id="course-101", title="Python Fundamentals", category="Backend",
         difficulty="Beginner", duration_hours=8.0, points=100,
         description="Core Python programming — syntax, data structures, OOP.",
         provider="Internal", course_type="mandatory",
         banner_gradient="linear-gradient(135deg, #3b82f6, #06b6d4)",
         syllabus={"chapters": [
             {"title": "Getting Started", "lessons": [
                 {"id": "l1", "title": "Variables & Types", "type": "video", "duration": 15, "content": "Introduction to Python variables and types."},
                 {"id": "l2", "title": "Control Flow",    "type": "video", "duration": 20, "content": "If/else, loops, and comprehensions."},
                 {"id": "l3", "title": "Quiz",            "type": "quiz",  "duration": 10, "content": "Chapter 1 quiz."},
             ]},
             {"title": "OOP in Python", "lessons": [
                 {"id": "l4", "title": "Classes & Objects",   "type": "video", "duration": 25, "content": "Defining classes, inheritance, and polymorphism."},
                 {"id": "l5", "title": "Practical Exercise",  "type": "exercise", "duration": 30, "content": "Build a simple inventory system."},
             ]},
         ]}),
    dict(id="course-102", title="Git & Version Control", category="DevOps",
         difficulty="Beginner", duration_hours=4.0, points=100,
         description="Git basics: branching, merging, pull requests.",
         provider="Internal", course_type="mandatory",
         banner_gradient="linear-gradient(135deg, #f59e0b, #ef4444)",
         syllabus={"chapters": [
             {"title": "Git Basics", "lessons": [
                 {"id": "l1", "title": "Init & Commit",  "type": "video", "duration": 15, "content": "git init, add, commit workflow."},
                 {"id": "l2", "title": "Branching",      "type": "video", "duration": 20, "content": "Creating and merging branches."},
                 {"id": "l3", "title": "Pull Requests",  "type": "video", "duration": 15, "content": "GitHub PR workflow and code reviews."},
             ]},
         ]}),
    dict(id="course-103", title="Docker for Beginners", category="DevOps",
         difficulty="Beginner", duration_hours=6.0, points=100,
         description="Containers, images, Docker Compose from scratch.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #0ea5e9, #2563eb)",
         syllabus={"chapters": [
             {"title": "Containers 101", "lessons": [
                 {"id": "l1", "title": "What is Docker?",    "type": "video",    "duration": 10, "content": "Docker overview and architecture."},
                 {"id": "l2", "title": "Your First Container","type": "video",    "duration": 20, "content": "docker run, ps, stop, rm."},
                 {"id": "l3", "title": "Hands-on Lab",       "type": "exercise", "duration": 30, "content": "Run a Python app in a container."},
             ]},
             {"title": "Dockerfile & Compose", "lessons": [
                 {"id": "l4", "title": "Writing Dockerfiles",   "type": "video",    "duration": 25, "content": "FROM, RUN, COPY, CMD instructions."},
                 {"id": "l5", "title": "Docker Compose",        "type": "video",    "duration": 20, "content": "Multi-service apps with docker-compose.yml."},
                 {"id": "l6", "title": "Final Quiz",            "type": "quiz",     "duration": 10, "content": "Docker quiz."},
             ]},
         ]}),
    # Intermediate
    dict(id="course-201", title="FastAPI in Depth", category="Backend",
         difficulty="Intermediate", duration_hours=10.0, points=100,
         description="Build production-ready REST APIs with FastAPI, Pydantic, and SQLAlchemy.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #10b981, #059669)",
         syllabus={"chapters": [
             {"title": "FastAPI Basics", "lessons": [
                 {"id": "l1", "title": "Routing & Path Params",   "type": "video",    "duration": 20, "content": "Define routes, path and query parameters."},
                 {"id": "l2", "title": "Pydantic Models",         "type": "video",    "duration": 25, "content": "Request/response schemas with Pydantic v2."},
             ]},
             {"title": "Database Integration", "lessons": [
                 {"id": "l3", "title": "SQLAlchemy ORM",          "type": "video",    "duration": 30, "content": "Models, sessions, and CRUD operations."},
                 {"id": "l4", "title": "Project: Task API",       "type": "exercise", "duration": 60, "content": "Build a full CRUD task management API."},
             ]},
         ]}),
    dict(id="course-202", title="React & Next.js for Engineers", category="Frontend",
         difficulty="Intermediate", duration_hours=12.0, points=100,
         description="Modern React with hooks, Next.js 15 App Router, and Tailwind CSS.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #8b5cf6, #6366f1)",
         syllabus={"chapters": [
             {"title": "React Core", "lessons": [
                 {"id": "l1", "title": "useState & useEffect",   "type": "video", "duration": 25, "content": "Core React hooks in depth."},
                 {"id": "l2", "title": "Component Patterns",     "type": "video", "duration": 20, "content": "Composition, lifting state, custom hooks."},
             ]},
             {"title": "Next.js App Router", "lessons": [
                 {"id": "l3", "title": "File-based Routing",     "type": "video",    "duration": 20, "content": "Pages, layouts, and nested routes."},
                 {"id": "l4", "title": "Server vs Client Components","type": "video", "duration": 25, "content": "When to use 'use client' and when not to."},
                 {"id": "l5", "title": "Capstone Project",       "type": "exercise", "duration": 90, "content": "Build a full-stack dashboard with Next.js + FastAPI."},
             ]},
         ]}),
    dict(id="course-203", title="PostgreSQL & SQLAlchemy", category="Database",
         difficulty="Intermediate", duration_hours=8.0, points=100,
         description="Relational database design, advanced SQL, and ORM patterns.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #f97316, #ea580c)"),
    dict(id="course-204", title="AWS Cloud Practitioner", category="Cloud",
         difficulty="Intermediate", duration_hours=15.0, points=100,
         description="Core AWS services: EC2, S3, RDS, Lambda, IAM.",
         provider="AWS Training", course_type="skill",
         banner_gradient="linear-gradient(135deg, #f59e0b, #d97706)"),
    # Advanced
    dict(id="course-301", title="Advanced Backend Architecture", category="Backend",
         difficulty="Advanced", duration_hours=12.0, points=100,
         description="Microservices, event-driven architecture, CQRS, and API gateways.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #dc2626, #9f1239)"),
    dict(id="course-302", title="Kubernetes & Container Orchestration", category="DevOps",
         difficulty="Advanced", duration_hours=14.0, points=100,
         description="K8s deployments, services, ingress, Helm charts, and CI/CD pipelines.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #1d4ed8, #1e40af)"),
    dict(id="course-303", title="Machine Learning Engineering", category="ML",
         difficulty="Advanced", duration_hours=20.0, points=100,
         description="End-to-end ML pipelines: feature engineering, model training, serving, and monitoring.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #7c3aed, #4c1d95)"),
    dict(id="course-304", title="System Design for Senior Engineers", category="System Design",
         difficulty="Advanced", duration_hours=10.0, points=100,
         description="Design scalable distributed systems: CAP theorem, databases, caching, message queues.",
         provider="Internal", course_type="skill",
         banner_gradient="linear-gradient(135deg, #0f766e, #134e4a)"),
]
for c in courses_data:
    if not exists(Course, id=c["id"]):
        db.add(Course(**c))
        print(f"  + Course: {c['title']} ({c['difficulty']})")
    else:
        print(f"  ~ Course already exists: {c['title']}")
db.commit()

# ── 4. COURSE ASSIGNMENTS ─────────────────────────────────────────────────────
# Map: (employee_id, course_id, progress, status, completed_lessons)
assignments_data = [
    # Priya — senior, doing advanced courses
    (1, "course-201", 100, "completed", ["l1","l2","l3","l4"]),
    (1, "course-301", 60,  "ongoing",   ["l1","l2"]),
    (1, "course-304", 20,  "ongoing",   ["l1"]),
    # Antony — DevOps, doing K8s
    (2, "course-103", 100, "completed", ["l1","l2","l3","l4","l5","l6"]),
    (2, "course-302", 40,  "ongoing",   ["l1","l2"]),
    (2, "course-204", 10,  "new",       []),
    # Maya — frontend
    (3, "course-202", 80,  "ongoing",   ["l1","l2","l3","l4"]),
    (3, "course-101", 100, "completed", ["l1","l2","l3","l4","l5"]),
    # Rahul — junior, foundational
    (4, "course-101", 60,  "ongoing",   ["l1","l2","l3"]),
    (4, "course-102", 100, "completed", ["l1","l2","l3"]),
    (4, "course-103", 20,  "ongoing",   ["l1"]),
    # Sara — ML
    (5, "course-303", 50,  "ongoing",   ["l1","l2"]),
    (5, "course-203", 100, "completed", []),
    # James — fresher, mandatory
    (6, "course-101", 30,  "ongoing",   ["l1","l2"]),
    (6, "course-102", 0,   "new",       []),
]
for emp_id, course_id, progress, status, completed in assignments_data:
    if not db.query(CourseAssignment).filter_by(employee_id=emp_id, course_id=course_id).first():
        db.add(CourseAssignment(
            employee_id=emp_id, course_id=course_id,
            progress=progress, status=status,
            completed_lessons=completed,
            deadline=datetime.utcnow() + timedelta(days=7),
        ))
        print(f"  + Assignment: Member {emp_id} → {course_id} ({status})")
    else:
        print(f"  ~ Assignment already exists: Member {emp_id} → {course_id}")
db.commit()

# ── 5. REPORTS ────────────────────────────────────────────────────────────────
reports_data = [
    dict(project_id=1, readiness_score=78.5,
         missing_skills=["Kubernetes", "AWS"],
         risks=["No Kubernetes expertise", "Limited cloud experience"],
         recommendations=["Assign Antony K8s course", "Schedule AWS training for team"]),
    dict(project_id=2, readiness_score=62.0,
         missing_skills=["Machine Learning", "AWS Lambda"],
         risks=["ML pipeline experience limited to Sara only", "Single point of failure"],
         recommendations=["Cross-train Priya on ML basics", "Hire ML contractor for ramp-up"]),
    dict(project_id=1, readiness_score=84.0,
         missing_skills=["System Design"],
         risks=["Architecture decisions need senior oversight"],
         recommendations=["Enrol Priya in System Design Advanced", "Schedule architecture review sessions"]),
    dict(project_id=3, readiness_score=91.0,
         missing_skills=[],
         risks=["Tight deadline"],
         recommendations=["Start Sprint 1 immediately", "Daily standups to track mobile progress"]),
]
if db.query(Report).count() == 0:
    for r in reports_data:
        db.add(Report(**r))
        print(f"  + Report: Project {r['project_id']} — score {r['readiness_score']}")
    db.commit()
else:
    print("  ~ Reports already exist, skipping.")

# ── 6. EMPLOYEE PERFORMANCE ───────────────────────────────────────────────────
performance_data = [
    dict(employee_id=1, readiness_score=84.5, competency_level="advanced", points_earned=1325,
         strengths=["Strong Python and FastAPI expertise", "Consistent high quiz scores"],
         weaknesses=["Cloud/Kubernetes exposure needs broadening"],
         summary="Priya demonstrates advanced backend proficiency with a readiness score of 84.5%. Focused upskilling in cloud technologies will complete her full-stack capability.",
         metrics={"learning_completion_rate": 80.0, "average_quiz_score": 91.0,
                  "validation_success_rate": 88.0, "ticket_completion_rate": 90.0,
                  "readiness_score": 84.5, "points_earned": 1325},
         points_breakdown={"Course Completions": 200, "Validation Tasks": 600, "Project Tickets": 450, "Bonuses": 75}),
    dict(employee_id=2, readiness_score=76.0, competency_level="advanced", points_earned=1050,
         strengths=["Excellent Docker and container skills", "Strong delivery rate on tickets"],
         weaknesses=["Learning completion rate could be higher"],
         summary="Antony shows solid DevOps foundations with a 76% readiness score. Completing the Kubernetes and AWS courses will position him for senior responsibilities.",
         metrics={"learning_completion_rate": 66.0, "average_quiz_score": 88.0,
                  "validation_success_rate": 85.0, "ticket_completion_rate": 92.0,
                  "readiness_score": 76.0, "points_earned": 1050},
         points_breakdown={"Course Completions": 100, "Validation Tasks": 525, "Project Tickets": 375, "Bonuses": 50}),
    dict(employee_id=4, readiness_score=48.0, competency_level="beginner", points_earned=425,
         strengths=["Fast learner, completed Git course quickly"],
         weaknesses=["Needs more hands-on project exposure", "Python fundamentals still in progress"],
         summary="Rahul is progressing steadily at a beginner level with a 48% readiness score. Completing the foundational courses will unlock intermediate assignments.",
         metrics={"learning_completion_rate": 55.0, "average_quiz_score": 78.0,
                  "validation_success_rate": 65.0, "ticket_completion_rate": 70.0,
                  "readiness_score": 48.0, "points_earned": 425},
         points_breakdown={"Course Completions": 100, "Validation Tasks": 225, "Project Tickets": 75, "Bonuses": 25}),
    dict(employee_id=6, readiness_score=22.0, competency_level="novice", points_earned=100,
         strengths=["Eager to learn, high engagement"],
         weaknesses=["Very early stage — needs all foundational courses", "No project ticket history yet"],
         summary="James is at the novice stage with a 22% readiness score. Mandatory onboarding courses should be the immediate priority before any project assignment.",
         metrics={"learning_completion_rate": 30.0, "average_quiz_score": 72.0,
                  "validation_success_rate": 50.0, "ticket_completion_rate": 0.0,
                  "readiness_score": 22.0, "points_earned": 100},
         points_breakdown={"Course Completions": 0, "Validation Tasks": 75, "Project Tickets": 0, "Bonuses": 25}),
]
if db.query(EmployeePerformance).count() == 0:
    for p in performance_data:
        db.add(EmployeePerformance(**p))
        print(f"  + Performance: Member {p['employee_id']} — {p['competency_level']} ({p['readiness_score']}%)")
    db.commit()
else:
    print("  ~ Performance records already exist, skipping.")

db.close()
print("\n✅ Seed complete!")
