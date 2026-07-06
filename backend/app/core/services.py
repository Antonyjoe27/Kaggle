from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.core.models import Project, TeamMember, Report
from app.core.schemas import ProjectCreate, ProjectUpdate, TeamMemberCreate, ReportResponse
from app.core.ai_agents import ProjectAnalyzerAgent, GitHubAnalyzerAgent, LearningPathAgent, ReadinessAgent

class Database:
    def __init__(self, db: Session):
        self.db = db

    def get_project(self, project_id: int) -> Project:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_team_member(self, member_id: int) -> TeamMember:
        return self.db.query(TeamMember).filter(TeamMember.id == member_id).first()

    def get_all_team_members(self) -> List[TeamMember]:
        return self.db.query(TeamMember).all()

    def get_recent_reports(self, limit: int = 5) -> List[Report]:
        return self.db.query(Report).order_by(Report.generated_at.desc()).limit(limit).all()

    def get_total_projects(self) -> int:
        return self.db.query(Project).count()

    def get_total_team_members(self) -> int:
        return self.db.query(TeamMember).count()

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_analyzer = ProjectAnalyzerAgent()

    def create_project(self, project_data: ProjectCreate) -> Project: # type: ignore
        project = Project(**project_data.model_dump(mode="json"))
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_project(self, project_id: int) -> Project:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise ValueError("Project not found")
        return project

    def analyze_project(self, project_id: int) -> Dict[str, Any]:
        project = self.get_project(project_id)
        
        analysis_results = self.project_analyzer.analyze(project.description or project.name)
        
        # Update project with analysis results
        project.required_skills = analysis_results.get("required_skills")
        project.technologies = analysis_results.get("technologies")
        project.complexity = analysis_results.get("complexity")
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)

        return analysis_results

class TeamService:
    def __init__(self, db: Session):
        self.db = db
        self.github_analyzer = GitHubAnalyzerAgent()
        self.db_accessor = Database(db)

    def add_team_member(self, member_data: TeamMemberCreate) -> TeamMember: # type: ignore
      print(">>> DEBUG MARKER: add_team_member CALLED <<<")
      team_member = TeamMember(**member_data.model_dump(mode="json"))
      self.db.add(team_member)
      self.db.commit()
      self.db.refresh(team_member)
      return team_member

    def get_team_member(self, member_id: int) -> TeamMember:
        return self.db_accessor.get_team_member(member_id)

    def analyze_team_member_skills(self, member_id: int) -> Dict[str, Any]:
        team_member = self.get_team_member(member_id)
        if not team_member or not team_member.github_url:
            raise ValueError("Team member or GitHub URL not found")
        
        skill_profile = self.github_analyzer.analyze(team_member.github_url)
        team_member.skill_profile = skill_profile
        self.db.add(team_member)
        self.db.commit()
        self.db.refresh(team_member)
        return skill_profile

    def get_all_team_members_with_skills(self) -> List[TeamMember]:
        return self.db_accessor.get_all_team_members()

class LearningPathService:
    def __init__(self, db: Session):
        self.db = db
        self.learning_path_agent = LearningPathAgent()
        self.db_accessor = Database(db)

    def generate_learning_paths(self, project_id: int) -> Dict[str, List[str]]:
        project = self.db_accessor.get_project(project_id)
        if not project or not project.required_skills:
            raise ValueError("Project or its required skills not found")
        
        team_members = self.db_accessor.get_all_team_members()
        team_skills_map = {
            member.name: member.skill_profile or {}
            for member in team_members
        }
        
        # Placeholder for RAG documents - in a real app, this would query pgvector
        rag_documents = ["Online course on Docker basics", "AWS Certified Developer Associate guide"]
        
        return self.learning_path_agent.generate_learning_paths(
            project_requirements=project.required_skills,
            team_skills=team_skills_map,
            rag_documents=rag_documents
        )

class ReportService:
    def __init__(self, db: Session):
        self.db = db
        self.readiness_agent = ReadinessAgent()
        self.db_accessor = Database(db)

    def generate_readiness_report(self, project_id: int) -> Report:
        project = self.db_accessor.get_project(project_id)
        if not project or not project.required_skills:
            raise ValueError("Project or its required skills not found")
        
        team_members = self.db_accessor.get_all_team_members()
        team_skills_map = {
            member.name: member.skill_profile or {}
            for member in team_members
        }

        readiness_data = self.readiness_agent.assess_readiness(
            project_id=project_id,
            team_skills=team_skills_map,
            project_requirements=project.required_skills
        )

        report = Report(
            project_id=project_id,
            readiness_score=readiness_data["readiness_score"],
            missing_skills=readiness_data["missing_skills"],
            risks=readiness_data["risks"],
            recommendations=readiness_data["recommendations"]
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_recent_reports(self) -> List[Report]:
        return self.db_accessor.get_recent_reports()

    def get_dashboard_stats(self) -> Dict[str, Any]:
        total_projects = self.db_accessor.get_total_projects()
        total_team_members = self.db_accessor.get_total_team_members()
        recent_reports = self.db_accessor.get_recent_reports(limit=3) # Example limit
        
        # Simple mock for risk alerts based on recent reports
        risk_alerts = []
        for report in recent_reports:
            if report.readiness_score < 80:
                risk_alerts.append(f"Project {report.project_id} has a low readiness score ({report.readiness_score}%) with risks: {', '.join(report.risks or [])}")
        
        return {
            "total_projects": total_projects,
            "total_team_members": total_team_members,
            "recent_reports": [
                {"project_id": r.project_id, "readiness_score": r.readiness_score, "generated_at": r.generated_at}
                for r in recent_reports
            ],
            "risk_alerts": risk_alerts
        }