from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.orm import Session

from app.core.services import LearningPathService
from app.deps import get_db

router = APIRouter()

class LearningPathRequest(BaseModel):
    project_id: int

class LearningPathResponse(BaseModel):
    member_name: str
    learning_path: List[str]

@router.post("/", response_model=List[LearningPathResponse])
async def generate_learning_paths(request: LearningPathRequest, db: Session = Depends(get_db)):
    """
    Generates personalized learning paths for team members based on project requirements.
    """
    try:
        learning_path_service = LearningPathService(db)
        learning_paths = learning_path_service.generate_learning_paths(request.project_id)
        return learning_paths
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate learning paths: {e}")