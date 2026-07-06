from typing import Dict, Any
import requests

class ProjectAnalyzerAgent:
    def __init__(self, project_name: str, description: str, deadline: str, jira_url: str):
        self.project_name = project_name
        self.description = description
        self.deadline = deadline
        self.jira_url = jira_url

    def analyze_project(self) -> Dict[str, Any]:
        # Call to Gemini API for project analysis
        response = self.call_gemini_api()
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception("Failed to analyze project")

    def call_gemini_api(self) -> requests.Response:
        # Placeholder for the actual Gemini API endpoint
        gemini_api_url = "https://api.gemini.com/analyze_project"
        payload = {
            "project_name": self.project_name,
            "description": self.description,
            "deadline": self.deadline,
            "jira_url": self.jira_url
        }
        headers = {
            "Content-Type": "application/json"
        }
        return requests.post(gemini_api_url, json=payload, headers=headers)

    def extract_analysis_results(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        # Extract required skills, technologies, and complexity level from analysis data
        return {
            "required_skills": analysis_data.get("required_skills", []),
            "technologies": analysis_data.get("technologies", []),
            "complexity_level": analysis_data.get("complexity_level", "Unknown")
        }