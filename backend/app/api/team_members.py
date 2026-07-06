from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.schemas import TeamMemberCreate, TeamMemberResponse
from app.core.services import TeamService
from app.deps import get_db

router = APIRouter()

@router.post("/", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(member: TeamMemberCreate, db: Session = Depends(get_db)):
    """
    Allows HR to add a new team member.
    """
    return TeamService(db).add_team_member(member)

@router.get("/", response_model=List[TeamMemberResponse])
async def get_all_team_members(db: Session = Depends(get_db)):
    """
    Retrieve all team members.
    """
    return TeamService(db).get_all_team_members_with_skills()

@router.get("/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(member_id: int, db: Session = Depends(get_db)):
    """
    Retrieve details of a specific team member.
    """
    try:
        return TeamService(db).get_team_member(member_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{member_id}/analyze-skills", response_model=TeamMemberResponse)
async def analyze_team_member_skills(member_id: int, db: Session = Depends(get_db)):
    """
    Runs the GitHub Analyzer Agent to generate a skill profile for a team member.
    """
    try:
        team_service = TeamService(db)
        skill_profile = team_service.analyze_team_member_skills(member_id)
        updated_member = team_service.get_team_member(member_id)
        return updated_member
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))