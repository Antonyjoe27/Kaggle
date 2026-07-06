import os
from fastapi import APIRouter, HTTPException
from typing import List, Dict
import httpx
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # optional; raises GitHub's rate limit if set

JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")  # e.g. https://your-domain.atlassian.net
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")


@router.get("/github/user/{username}", response_model=Dict)
async def get_github_user(username: str):
    headers = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{GITHUB_API_URL}/users/{username}", headers=headers)
        response.raise_for_status()
        return response.json()


@router.get("/jira/project/{project_key}", response_model=Dict)
async def get_jira_project(project_key: str):
    if not (JIRA_BASE_URL and JIRA_EMAIL and JIRA_API_TOKEN):
        raise HTTPException(
            status_code=503,
            detail="Jira integration is not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env.",
        )
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{JIRA_BASE_URL}/rest/api/2/project/{project_key}",
            auth=(JIRA_EMAIL, JIRA_API_TOKEN),
        )
        response.raise_for_status()
        return response.json()