from typing import Any, Dict
import requests

class JiraAnalyzer:
    def __init__(self, jira_base_url: str, api_token: str, email: str):
        self.jira_base_url = jira_base_url
        self.api_token = api_token
        self.email = email

    def analyze_project(self, project_key: str) -> Dict[str, Any]:
        url = f"{self.jira_base_url}/rest/api/3/search"
        headers = {
            "Authorization": f"Basic {self._get_auth_token()}",
            "Content-Type": "application/json"
        }
        query = {
            "jql": f"project = {project_key}",
            "fields": ["summary", "description", "issuetype", "assignee", "status"]
        }
        response = requests.get(url, headers=headers, params=query)

        if response.status_code != 200:
            raise Exception(f"Failed to fetch data from Jira: {response.text}")

        issues = response.json().get("issues", [])
        return self._extract_project_data(issues)

    def _get_auth_token(self) -> str:
        import base64
        token = f"{self.email}:{self.api_token}"
        return base64.b64encode(token.encode()).decode()

    def _extract_project_data(self, issues: list) -> Dict[str, Any]:
        required_skills = set()
        technologies = set()
        complexity_level = "Low"

        for issue in issues:
            # Example extraction logic
            summary = issue.get("fields", {}).get("summary", "")
            description = issue.get("fields", {}).get("description", "")
            required_skills.update(self._analyze_description(summary))
            required_skills.update(self._analyze_description(description))

            # Determine complexity level based on issue type
            issue_type = issue.get("fields", {}).get("issuetype", {}).get("name", "")
            if issue_type in ["Bug", "Epic"]:
                complexity_level = "High"
            elif issue_type == "Task":
                complexity_level = "Medium"

        return {
            "required_skills": list(required_skills),
            "technologies": list(technologies),
            "complexity_level": complexity_level
        }

    def _analyze_description(self, text: str) -> set:
        # Placeholder for skill extraction logic
        skills = set()
        if "Python" in text:
            skills.add("Python")
        if "FastAPI" in text:
            skills.add("FastAPI")
        if "PostgreSQL" in text:
            skills.add("PostgreSQL")
        return skills
