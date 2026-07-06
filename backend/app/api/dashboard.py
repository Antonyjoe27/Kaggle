from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.services import ReportService
from app.deps import get_db

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retrieves key statistics for the dashboard: total projects, total team members,
    recent reports, and risk alerts.
    """
    try:
        report_service = ReportService(db) # ReportService also handles general stats
        stats = report_service.get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch dashboard stats: {e}")