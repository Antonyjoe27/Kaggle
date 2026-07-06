from typing import List, Dict, Any
import os
import requests
from dotenv import load_dotenv
from google import genai

load_dotenv() # Load environment variables

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"

_gemini_client = None
if GOOGLE_API_KEY and GOOGLE_API_KEY != "your-gemini-api-key-here":
    _gemini_client = genai.Client(api_key=GOOGLE_API_KEY)


def _mock_gemini_call(prompt: str) -> str:
    """Fallback mock used when no real Gemini API key is configured, or if
    the live API call fails for any reason (so the app keeps working)."""
    print(f"[Mock Gemini Call] prompt: {prompt[:100]}...")
    if "project requirements" in prompt.lower() or "required skills" in prompt.lower():
        return "Required Skills: Python, FastAPI, Docker; Technologies: PostgreSQL, AWS; Complexity: Medium"
    if "assess team readiness" in prompt.lower() or "readiness score" in prompt.lower():
        return "Readiness Score: 82.0; Missing Skills: Kubernetes, Cloud Knowledge; Risks: No Kubernetes Expert, Weak Cloud Knowledge; Recommendations: Train Antony on AWS, Train Priya on Kubernetes"
    return "Mock AI response."


def gemini_call(prompt: str) -> str:
    """Calls the real Gemini API if GOOGLE_API_KEY is configured; otherwise
    falls back to deterministic mock data so the app still runs end-to-end
    without any API key set up."""
    if _gemini_client is None:
        return _mock_gemini_call(prompt)
    try:
        response = _gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"[Gemini API error, falling back to mock] {e}")
        return _mock_gemini_call(prompt)


# Kept for backwards compatibility with any other callers expecting the old name.
mock_gemini_call = gemini_call

class ProjectAnalyzerAgent:
    def analyze(self, project_description: str) -> Dict[str, Any]:
        prompt = (
            "Analyze the following project description to extract required skills, "
            "technologies, and complexity level.\n\n"
            f"Project description:\n{project_description}\n\n"
            "Respond with EXACTLY one line in this format, and nothing else:\n"
            "Required Skills: [skill1, skill2]; Technologies: [tech1, tech2]; Complexity: Low|Medium|High"
        )
        gemini_response = gemini_call(prompt)

        try:
            skills_str = gemini_response.split('Required Skills: ')[1].split(';')[0].strip()
            technologies_str = gemini_response.split('Technologies: ')[1].split(';')[0].strip()
            complexity = gemini_response.split('Complexity: ')[1].strip()

            required_skills = [s.strip() for s in skills_str.strip('[]').split(',') if s.strip()]
            technologies = [t.strip() for t in technologies_str.strip('[]').split(',') if t.strip()]
        except IndexError:
            # The model didn't follow the requested format exactly; fail soft
            # instead of crashing the whole request.
            print(f"[ProjectAnalyzerAgent] Unexpected response format: {gemini_response!r}")
            required_skills, technologies, complexity = [], [], "Unknown"

        return {
            "required_skills": required_skills,
            "technologies": technologies,
            "complexity": complexity
        }

class GitHubAnalyzerAgent:
    def analyze(self, github_url: str) -> Dict[str, Any]:
        print(f"Mock GitHub API call for: {github_url}")
        # In a real scenario, you'd use the GitHub API (e.g., PyGithub)
        # GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
        # headers = {"Authorization": f"token {GITHUB_TOKEN}"}
        # repo_owner, repo_name = parse_github_url(github_url)
        # response = requests.get(f"https://api.github.com/repos/{repo_owner}/{repo_name}/languages", headers=headers)
        # languages = response.json()
        
        # Mock skill profile
        if "antony" in github_url.lower():
            return {"Python": 5, "FastAPI": 4, "Docker": 2}
        elif "priya" in github_url.lower():
            return {"PostgreSQL": 5, "Docker": 3, "AWS": 1}
        return {"Python": 3, "JavaScript": 3}

class JiraAnalyzerAgent:
    def analyze(self, jira_url: str) -> Dict[str, Any]:
        print(f"Mock Jira API call for: {jira_url}")
        # In a real scenario, you'd use the Jira API client
        return {"project_status": "In Progress", "open_tasks": 15}

class LearningPathAgent:
    def generate_learning_paths(self, project_requirements: List[str], team_skills: Dict[str, Dict[str, int]], rag_documents: List[str]) -> Dict[str, List[str]]:
        learning_paths = {}
        for member_name, skills_profile in team_skills.items():
            member_skills = list(skills_profile.keys()) # Simplified for mock
            learning_path = []
            for requirement in project_requirements:
                if requirement not in member_skills: # Basic check
                    learning_path.append(f"Learn {requirement} (Suggested from RAG: {rag_documents[0] if rag_documents else 'Online Course'})")
            learning_paths[member_name] = learning_path
        return learning_paths

class ReadinessAgent:
    def assess_readiness(self, project_id: int, team_skills: Dict[str, Dict[str, int]], project_requirements: List[str]) -> Dict[str, Any]:
        prompt = (
            f"Assess team readiness for project {project_id} with requirements "
            f"{project_requirements} and team skills {team_skills}.\n\n"
            "Respond with EXACTLY one line in this format, and nothing else:\n"
            "Readiness Score: <number 0-100>; Missing Skills: [skill1, skill2]; "
            "Risks: [risk1, risk2]; Recommendations: [rec1, rec2]"
        )
        gemini_response = gemini_call(prompt)

        try:
            score = float(gemini_response.split('Readiness Score: ')[1].split(';')[0].strip())
            missing_skills = [s.strip() for s in gemini_response.split('Missing Skills: ')[1].split(';')[0].strip('[] ').split(',') if s.strip()]
            risks = [r.strip() for r in gemini_response.split('Risks: ')[1].split(';')[0].strip('[] ').split(',') if r.strip()]
            recommendations = [r.strip() for r in gemini_response.split('Recommendations: ')[1].strip('[] ').split(',') if r.strip()]
        except (IndexError, ValueError):
            print(f"[ReadinessAgent] Unexpected response format: {gemini_response!r}")
            score, missing_skills, risks, recommendations = 0.0, [], [], []

        return {
            "readiness_score": score,
            "missing_skills": missing_skills,
            "risks": risks,
            "recommendations": recommendations
        }

# ── Performance Agent ─────────────────────────────────────────────────────────
import json

POINTS_CONFIG = {
    "course_completion": 100,
    "quiz_perfect_score": 50,
    "quiz_passing_bonus": 25,
    "validation_task_passed": 75,
    "ticket_completed": 150,
    "streak_bonus_per_day": 10,
    "early_completion_bonus": 30,
}
READINESS_WEIGHTS = {"learning": 0.30, "validation": 0.35, "project": 0.35}


class PerformanceAgent:
    def __init__(self, course_catalog: List[Dict] = None):
        self.course_catalog = course_catalog or []

    def calculate_metrics(self, learning_data: dict, validation_data: dict, project_data: dict) -> Dict[str, Any]:
        cc  = learning_data.get("courses_completed", 0)
        tc  = learning_data.get("total_courses_assigned", 1)
        lcr = (cc / max(tc, 1)) * 100
        aqs = learning_data.get("average_quiz_score", 0.0)
        lh  = learning_data.get("learning_hours", 0.0)

        tp  = validation_data.get("tasks_passed", 0)
        tf  = validation_data.get("tasks_failed", 0)
        vsr = (tp / max(tp + tf, 1)) * 100

        tic = project_data.get("tickets_completed", 0)
        tia = project_data.get("tickets_assigned", 1)
        tcr = (tic / max(tia, 1)) * 100

        learning_score  = lcr * 0.6 + aqs * 0.4
        readiness_score = round(min(100, max(0,
            learning_score * READINESS_WEIGHTS["learning"] +
            vsr            * READINESS_WEIGHTS["validation"] +
            tcr            * READINESS_WEIGHTS["project"]
        )), 2)

        points  = cc  * POINTS_CONFIG["course_completion"]
        points += tp  * POINTS_CONFIG["validation_task_passed"]
        points += tic * POINTS_CONFIG["ticket_completed"]
        if aqs >= 100:
            points += cc * POINTS_CONFIG["quiz_perfect_score"]
        elif aqs >= 80:
            points += cc * POINTS_CONFIG["quiz_passing_bonus"]
        points += learning_data.get("current_streak_days", 0) * POINTS_CONFIG["streak_bonus_per_day"]
        points += learning_data.get("early_completions", 0)   * POINTS_CONFIG["early_completion_bonus"]

        return {
            "learning_completion_rate": round(lcr, 2),
            "courses_completed": cc,
            "total_courses_assigned": tc,
            "average_quiz_score": round(aqs, 2),
            "learning_hours": lh,
            "validation_success_rate": round(vsr, 2),
            "tasks_passed": tp,
            "tasks_failed": tf,
            "tickets_completed": tic,
            "tickets_assigned": tia,
            "ticket_completion_rate": round(tcr, 2),
            "readiness_score": readiness_score,
            "points_earned": points,
        }

    def _competency(self, score: float) -> str:
        if score >= 90: return "expert"
        if score >= 75: return "advanced"
        if score >= 55: return "intermediate"
        if score >= 35: return "beginner"
        return "novice"

    def evaluate(self, employee_profile: dict, learning_data: dict,
                 validation_data: dict, project_data: dict,
                 skill_gaps: List[str] = None) -> Dict[str, Any]:

        metrics    = self.calculate_metrics(learning_data, validation_data, project_data)
        competency = self._competency(metrics["readiness_score"])

        eval_prompt = f"""You are a Performance Intelligence Agent for an LMS.

Employee: {employee_profile.get('name')}, Role: {employee_profile.get('designation','Engineer')}
Readiness Score: {metrics['readiness_score']}/100
Learning Completion: {metrics['learning_completion_rate']}%, Quiz Score: {metrics['average_quiz_score']}%
Validation Success: {metrics['validation_success_rate']}%, Ticket Completion: {metrics['ticket_completion_rate']}%
Skill Gaps: {skill_gaps or 'None'}

Respond with valid raw JSON only (no markdown):
{{
  "strengths": ["2-3 specific strengths"],
  "weaknesses": ["1-2 improvement areas"],
  "recommended_focus_areas": ["skill categories to study"],
  "summary": "2 sentence evaluation summary."
}}"""

        try:
            raw   = gemini_call(eval_prompt)
            clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            eval_data = json.loads(clean)
        except Exception as e:
            print(f"[PerformanceAgent] eval fallback: {e}")
            eval_data = {
                "strengths": ["Consistent task execution"],
                "weaknesses": ["Course completion rate could improve"],
                "recommended_focus_areas": ["Backend", "System Design"],
                "summary": f"Readiness score: {metrics['readiness_score']}%. Room for growth in learning engagement.",
            }

        recommendations = []
        if self.course_catalog:
            focus_areas = eval_data.get("recommended_focus_areas", [])
            relevant    = [c for c in self.course_catalog
                           if any(a.lower() in c.get("category","").lower() for a in focus_areas)]
            if not relevant:
                relevant = self.course_catalog[:5]

            rec_prompt = f"""Course Recommendation Agent.
Focus areas: {focus_areas}
Courses: {json.dumps(relevant[:15], indent=2)}

Respond with valid raw JSON array only (no markdown):
[{{"course_id":"exact-id","priority":"high|medium|low","reason":"one sentence"}}]"""
            try:
                raw_rec   = gemini_call(rec_prompt)
                clean_rec = raw_rec.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
                for rec in json.loads(clean_rec):
                    course = next((c for c in self.course_catalog if c["id"] == rec["course_id"]), None)
                    if course:
                        recommendations.append({
                            "course_id":      rec["course_id"],
                            "title":          course.get("title", ""),
                            "skill_category": course.get("category", ""),
                            "priority":       rec.get("priority", "medium"),
                            "reason":         rec.get("reason", ""),
                            "estimated_hours":course.get("duration_hours", 0),
                            "points_value":   course.get("points", 100),
                        })
            except Exception as e:
                print(f"[PerformanceAgent] rec fallback: {e}")

        base = (metrics["courses_completed"] * POINTS_CONFIG["course_completion"] +
                metrics["tasks_passed"]      * POINTS_CONFIG["validation_task_passed"] +
                metrics["tickets_completed"] * POINTS_CONFIG["ticket_completed"])

        return {
            "metrics":          metrics,
            "competency_level": competency,
            "strengths":        eval_data.get("strengths", []),
            "weaknesses":       eval_data.get("weaknesses", []),
            "summary":          eval_data.get("summary", ""),
            "recommendations":  recommendations,
            "points_breakdown": {
                "Course Completions": metrics["courses_completed"] * POINTS_CONFIG["course_completion"],
                "Validation Tasks":   metrics["tasks_passed"]      * POINTS_CONFIG["validation_task_passed"],
                "Project Tickets":    metrics["tickets_completed"]  * POINTS_CONFIG["ticket_completed"],
                "Bonuses":            metrics["points_earned"] - base,
            },
        }


# ── Learning Path Assignment Agent ───────────────────────────────────────────
class LearningPathAssignmentAgent:
    """Routes by experience level (fresher/mid/senior) and assigns courses via Gemini."""

    def assign(self, member: dict, project_requirements: List[str],
               course_catalog: List[Dict], experience_level: str = "mid-level") -> Dict[str, Any]:

        level  = experience_level.lower().strip()
        diff_map = {"fresher": "Beginner", "entry": "Beginner",
                    "mid-level": "Intermediate", "senior": "Advanced"}
        target_diff       = diff_map.get(level, "Intermediate")
        requires_approval = level not in ("fresher", "entry")

        matched = [c for c in course_catalog
                   if c.get("difficulty","").lower() == target_diff.lower()]
        if not matched:
            matched = course_catalog[:3]

        member_skills = list((member.get("skill_profile") or {}).keys())
        gaps          = [r for r in project_requirements if r not in member_skills]

        prompt = f"""Learning Path Assignment Agent.
Employee: {member.get('name')}, Level: {experience_level}, Role: {member.get('designation')}
Project requirements: {project_requirements}
Current skills: {member_skills}
Skill gaps: {gaps}
Available {target_diff} courses: {json.dumps(matched[:15], indent=2)}

Respond with valid raw JSON array only (no markdown):
[{{"course_id":"exact-id","reason":"one sentence"}}]"""

        try:
            raw     = gemini_call(prompt)
            clean   = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            selected = json.loads(clean)
        except Exception as e:
            print(f"[LearningPathAssignmentAgent] fallback: {e}")
            selected = [{"course_id": c["id"], "reason": "Auto-selected for skill gap"} for c in matched[:3]]

        assigned = []
        for sel in selected:
            course = next((c for c in course_catalog if c["id"] == sel["course_id"]), None)
            if course:
                assigned.append({
                    "course_id":  course["id"],
                    "title":      course["title"],
                    "difficulty": course.get("difficulty"),
                    "reason":     sel.get("reason",""),
                })

        return {
            "employee_id":          member.get("id"),
            "employee_name":        member.get("name"),
            "experience_level":     experience_level,
            "requires_hr_approval": requires_approval,
            "assigned_courses":     assigned,
        }
