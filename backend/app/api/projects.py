from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.core.services import ProjectService
from app.deps import get_db

router = APIRouter()

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """
    Allows HR to create a new project.
    """
    return ProjectService(db).create_project(project)

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieve details of a specific project.
    """
    try:
        return ProjectService(db).get_project(project_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/{project_id}/analyze", response_model=ProjectResponse)
async def analyze_project(project_id: int, db: Session = Depends(get_db)):
    """
    Runs the Project Analyzer Agent to extract skills, technologies, and complexity.
    """
    try:
        project_service = ProjectService(db)
        analysis_results = project_service.analyze_project(project_id)
        
        # Fetch the updated project to return the full details including analysis
        updated_project = project_service.get_project(project_id)
        return updated_project
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analysis failed: {e}")