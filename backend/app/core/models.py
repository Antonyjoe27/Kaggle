from sqlalchemy import Column, Integer, String, Text, Date, DateTime, func, JSON, Float, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    deadline = Column(Date)
    jira_url = Column(String)
    required_skills = Column(ARRAY(String))
    technologies = Column(ARRAY(String))
    complexity = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    reports = relationship("Report", back_populates="project")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    designation = Column(String)
    github_url = Column(String)
    skill_profile = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    readiness_score = Column(Float)
    missing_skills = Column(ARRAY(String))
    risks = Column(ARRAY(String))
    recommendations = Column(ARRAY(String))
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="reports")


class Course(Base):
    """Course catalog shared by HR portal (assigning) and Employee Portal (viewing)."""
    __tablename__ = "courses"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    category = Column(String)
    difficulty = Column(String)
    duration_hours = Column(Float, default=0)
    description = Column(Text)
    provider = Column(String)
    platform_url = Column(String)
    is_internal = Column(Integer, default=0)
    points = Column(Integer, default=100)
    syllabus = Column(JSON)
    banner_gradient = Column(String, default="linear-gradient(135deg, #6366f1, #8b5cf6)")
    course_type = Column(String, default="skill")


class CourseAssignment(Base):
    """Records which courses are assigned to which team member."""
    __tablename__ = "course_assignments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("team_members.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    deadline = Column(DateTime(timezone=True))
    progress = Column(Integer, default=0)
    status = Column(String, default="new")
    completed_lessons = Column(ARRAY(String), default=[])

    employee = relationship("TeamMember")
    course = relationship("Course")


class EmployeePerformance(Base):
    """Stores PerformanceAgent evaluation results."""
    __tablename__ = "employee_performance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("team_members.id"), nullable=False)
    readiness_score = Column(Float)
    competency_level = Column(String)
    points_earned = Column(Integer, default=0)
    strengths = Column(ARRAY(String))
    weaknesses = Column(ARRAY(String))
    summary = Column(Text)
    metrics = Column(JSON)
    points_breakdown = Column(JSON)
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("TeamMember")
