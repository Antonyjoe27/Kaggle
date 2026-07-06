from typing import List, Dict
import requests

class GitHubAnalyzer:
    def __init__(self, github_token: str):
        self.github_token = github_token
        self.headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }

    def analyze_repository(self, repo_url: str) -> Dict:
        repo_name = self.extract_repo_name(repo_url)
        if not repo_name:
            raise ValueError("Invalid GitHub repository URL")

        languages = self.get_languages(repo_name)
        readme_content = self.get_readme(repo_name)
        requirements = self.get_requirements(repo_name)
        package_json = self.get_package_json(repo_name)
        dockerfile = self.get_dockerfile(repo_name)

        skill_profile = self.generate_skill_profile(languages, readme_content, requirements, package_json, dockerfile)
        return skill_profile

    def extract_repo_name(self, repo_url: str) -> str:
        # Extract the repository name from the URL
        try:
            parts = repo_url.split('/')
            return f"{parts[-2]}/{parts[-1].replace('.git', '')}"
        except IndexError:
            return None

    def get_languages(self, repo_name: str) -> List[str]:
        url = f"https://api.github.com/repos/{repo_name}/languages"
        response = requests.get(url, headers=self.headers)
        return list(response.json().keys())

    def get_readme(self, repo_name: str) -> str:
        url = f"https://api.github.com/repos/{repo_name}/readme"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json().get('content', '')
        return ''

    def get_requirements(self, repo_name: str) -> List[str]:
        # Assuming requirements.txt is in the root of the repository
        url = f"https://raw.githubusercontent.com/{repo_name}/main/requirements.txt"
        response = requests.get(url)
        if response.status_code == 200:
            return response.text.splitlines()
        return []

    def get_package_json(self, repo_name: str) -> Dict:
        url = f"https://raw.githubusercontent.com/{repo_name}/main/package.json"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return {}

    def get_dockerfile(self, repo_name: str) -> str:
        url = f"https://raw.githubusercontent.com/{repo_name}/main/Dockerfile"
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        return ''

    def generate_skill_profile(self, languages: List[str], readme: str, requirements: List[str], package_json: Dict, dockerfile: str) -> Dict:
        skill_profile = {
            "languages": languages,
            "readme": readme,
            "requirements": requirements,
            "package_json": package_json,
            "dockerfile": dockerfile
        }
        return skill_profile
