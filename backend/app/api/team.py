from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class TeamMember(BaseModel):
    name: str
    designation: str
    github_url: str

class SkillProfile(BaseModel):
    member_name: str
    skills: List[str]

class TeamAnalysisResponse(BaseModel):
    team_members: List[TeamMember]
    skill_profiles: List[SkillProfile]

team_members_db = []  # This will act as an in-memory database for demonstration

@router.post("/team", response_model=TeamAnalysisResponse)
async def add_team_member(member: TeamMember):
    team_members_db.append(member)
    return TeamAnalysisResponse(team_members=team_members_db, skill_profiles=[])

@router.get("/team/skills", response_model=List[SkillProfile])
async def analyze_team_skills():
    # Placeholder for actual analysis logic
    skill_profiles = []
    for member in team_members_db:
        # Simulate skill extraction
        skill_profiles.append(SkillProfile(member_name=member.name, skills=["Python", "FastAPI"]))
    return skill_profiles

@router.delete("/team/{member_name}", response_model=TeamMember)
async def remove_team_member(member_name: str):
    global team_members_db
    for member in team_members_db:
        if member.name == member_name:
            team_members_db.remove(member)
            return member
    raise HTTPException(status_code=404, detail="Team member not found")