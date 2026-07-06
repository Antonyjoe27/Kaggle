from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict
from sqlalchemy.orm import Session

from app.core.schemas import ReportResponse
from app.core.services import ReportService
from app.deps import get_db

router = APIRouter()

class ReportRequest(BaseModel):
    project_id: int

@router.get("/recent", response_model=List[Dict])
async def get_recent_reports(db: Session = Depends(get_db)):
    """
    Fetches a list of recent reports.
    """
    report_service = ReportService(db)
    recent_reports = report_service.get_recent_reports()
    return [
        {
            "id": r.id,
            "project_id": r.project_id,
            "readiness_score": r.readiness_score,
            "generated_at": r.generated_at
        } for r in recent_reports
    ]

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(report_request: ReportRequest, db: Session = Depends(get_db)):
    """
    Generates a new readiness report for a given project.
    """
    try:
        report_service = ReportService(db)
        report = report_service.generate_readiness_report(report_request.project_id)
        return ReportResponse(
            readiness_score=report.readiness_score,
            missing_skills=report.missing_skills or [],
            risks=report.risks or [],
            recommendations=report.recommendations or [],
            generated_at=report.generated_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate report: {e}")