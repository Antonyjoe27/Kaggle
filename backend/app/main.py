from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import projects, team_members, learning_paths, reports, dashboard, integrations, courses, performance, employee_portal
from app.core.models import Base
from app.deps import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Engineering Manager Backend",
    description="Backend API for HR Portal and Employee Portal.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router,         prefix="/projects",         tags=["Projects"])
app.include_router(team_members.router,     prefix="/team-members",     tags=["Team Members"])
app.include_router(learning_paths.router,   prefix="/learning-paths",   tags=["Learning Paths"])
app.include_router(reports.router,          prefix="/reports",           tags=["Reports"])
app.include_router(dashboard.router,        prefix="/dashboard",         tags=["Dashboard"])
app.include_router(integrations.router,     prefix="/integrations",      tags=["Integrations"])
app.include_router(courses.router,          prefix="/courses",           tags=["Courses"])
app.include_router(performance.router,      prefix="/performance",       tags=["Performance"])
app.include_router(employee_portal.router,  prefix="/portal",            tags=["Employee Portal"])

@app.get("/")
async def root():
    return {"message": "AI Engineering Manager API v0.2"}
