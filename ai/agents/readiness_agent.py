from typing import List, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random

router = APIRouter()

class TeamMember(BaseModel):
    name: str
    skills: List[str]

class ReadinessReport(BaseModel):
    readiness_score: int
    missing_skills: List[str]
    risks: List[str]
    recommendations: List[str]

@router.post("/readiness", response_model=ReadinessReport)
async def analyze_readiness(team_members: List[TeamMember], project_requirements: List[str]) -> ReadinessReport:
    if not team_members or not project_requirements:
        raise HTTPException(status_code=400, detail="Team members and project requirements must be provided.")

    # Simulate analysis logic
    all_skills = {skill for member in team_members for skill in member.skills}
    required_skills = set(project_requirements)
    missing_skills = list(required_skills - all_skills)
    
    # Simulate readiness score calculation
    readiness_score = max(0, 100 - len(missing_skills) * 10)

    # Simulate risk analysis
    risks = []
    if len(missing_skills) > 0:
        risks.append("Missing skills identified.")
    
    # Simulate recommendations
    recommendations = [f"Train {member.name} on {skill}" for member in team_members for skill in missing_skills]

    return ReadinessReport(
        readiness_score=readiness_score,
        missing_skills=missing_skills,
        risks=risks,
        recommendations=recommendations
    )