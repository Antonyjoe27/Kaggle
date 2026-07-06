from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import date, datetime

# ── Project Schemas ───────────────────────────────────────────────────────────
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    jira_url: Optional[HttpUrl] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    required_skills: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    complexity: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    required_skills: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    complexity: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ── Team Member Schemas ───────────────────────────────────────────────────────
class TeamMemberBase(BaseModel):
    name: str
    designation: Optional[str] = None
    github_url: Optional[HttpUrl] = None

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberResponse(TeamMemberBase):
    id: int
    skill_profile: Optional[Dict[str, int]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ── Report Schemas ────────────────────────────────────────────────────────────
class ReportResponse(BaseModel):
    readiness_score: float
    missing_skills: List[str]
    risks: List[str]
    recommendations: List[str]
    generated_at: datetime

    class Config:
        from_attributes = True

# ── Course Schemas ────────────────────────────────────────────────────────────
class CourseCreate(BaseModel):
    id: str
    title: str
    category: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"
    duration_hours: Optional[float] = 0
    description: Optional[str] = None
    provider: Optional[str] = None
    platform_url: Optional[str] = None
    is_internal: Optional[bool] = False
    points: Optional[int] = 100
    syllabus: Optional[Dict[str, Any]] = None
    banner_gradient: Optional[str] = "linear-gradient(135deg, #6366f1, #8b5cf6)"
    course_type: Optional[str] = "skill"

class CourseResponse(CourseCreate):
    class Config:
        from_attributes = True

# ── Course Assignment Schemas ─────────────────────────────────────────────────
class AssignCoursesRequest(BaseModel):
    course_ids: List[str]
    experience_level: Optional[str] = "mid-level"

class CourseAssignmentResponse(BaseModel):
    id: int
    employee_id: int
    course_id: str
    assigned_at: datetime
    deadline: Optional[datetime] = None
    progress: int
    status: str
    completed_lessons: Optional[List[str]] = None

    class Config:
        from_attributes = True

class UpdateProgressRequest(BaseModel):
    lesson_id: str
    completed: bool

# ── Performance Evaluation Schemas ───────────────────────────────────────────
class LearningData(BaseModel):
    courses_completed: int = 0
    total_courses_assigned: int = 1
    average_quiz_score: float = 0.0
    learning_hours: float = 0.0
    current_streak_days: int = 0
    early_completions: int = 0

class ValidationData(BaseModel):
    tasks_passed: int = 0
    tasks_failed: int = 0

class ProjectActivityData(BaseModel):
    tickets_completed: int = 0
    tickets_assigned: int = 1

class EvaluateEmployeeRequest(BaseModel):
    learning_data: LearningData
    validation_data: ValidationData
    project_data: ProjectActivityData
    skill_gaps: Optional[List[str]] = None

class CourseRecommendationResponse(BaseModel):
    course_id: str
    title: str
    skill_category: str
    priority: str
    reason: str
    estimated_hours: float
    points_value: int

class PerformanceEvaluationResponse(BaseModel):
    employee_id: int
    readiness_score: float
    competency_level: str
    points_earned: int
    strengths: List[str]
    weaknesses: List[str]
    summary: str
    recommendations: List[CourseRecommendationResponse]
    points_breakdown: Dict[str, Any]
    metrics: Dict[str, Any]