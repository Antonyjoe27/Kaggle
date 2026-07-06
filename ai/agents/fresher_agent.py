from typing import Any, Dict, List, Optional

from .prompts import FRESHER_ONBOARDING_PROMPT, FRESHER_CHECKIN_PROMPT
from .tools import call_gemini, parse_json_response, compute_skill_gap, find_best_mentor


class FresherAgent:
    """
    Handles freshers / interns / junior engineers (designation contains
    'fresher', 'intern', 'graduate', 'trainee', or 'junior' — see
    `tools.classify_experience_level`).

    Responsibilities:
      - Build a 30-60-90 day onboarding plan tailored to the fresher's
        current skills and the project they're joining.
      - Recommend a mentor from the available senior/mid-level engineers.
      - Suggest beginner-friendly courses to close skill gaps.
      - Review progress and flag when a plan needs adjusting.
    """

    def create_onboarding_plan(
        self,
        member: Dict[str, Any],
        project_name: str,
        required_skills: List[str],
        available_mentors: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        available_mentors = available_mentors or []
        current_skills = list((member.get("skill_profile") or {}).keys()) or member.get("skills", [])

        # Do a quick local mentor match first so we always have a sane
        # fallback even if the model doesn't pick one.
        local_best_mentor = find_best_mentor(available_mentors, required_skills)

        prompt = FRESHER_ONBOARDING_PROMPT.format(
            name=member.get("name", "New Hire"),
            designation=member.get("designation", "Fresher"),
            current_skills=current_skills or "None listed",
            project_name=project_name,
            required_skills=required_skills,
            available_mentors=[m.get("name") for m in available_mentors] or "None available",
        )

        raw = call_gemini(prompt)
        fallback = {
            "skill_gaps": compute_skill_gap(required_skills, current_skills),
            "recommended_mentor": local_best_mentor.get("name") if local_best_mentor else None,
            "mentor_reason": "Auto-matched based on skill overlap." if local_best_mentor else "",
            "day_30": ["Complete environment setup", "Shadow a senior engineer",
                       "Finish assigned onboarding courses"],
            "day_60": ["Take on a small, well-scoped ticket", "Pair-program with mentor"],
            "day_90": ["Own a feature end-to-end", "Present learnings to the team"],
            "recommended_courses": compute_skill_gap(required_skills, current_skills),
            "risk_notes": "",
        }
        plan = parse_json_response(raw, fallback=fallback)

        return {
            "employee_id": member.get("id"),
            "employee_name": member.get("name"),
            "project_name": project_name,
            "onboarding_plan": plan,
        }

    def review_progress(
        self,
        member: Dict[str, Any],
        plan_summary: str,
        progress_notes: str,
    ) -> Dict[str, Any]:
        prompt = FRESHER_CHECKIN_PROMPT.format(
            name=member.get("name", "New Hire"),
            plan_summary=plan_summary,
            progress_notes=progress_notes,
        )
        raw = call_gemini(prompt)
        fallback = {
            "on_track": True,
            "concerns": [],
            "adjustments": [],
        }
        return parse_json_response(raw, fallback=fallback)


# Example usage
if __name__ == "__main__":
    agent = FresherAgent()
    member = {"id": 1, "name": "Ravi", "designation": "Fresher", "skill_profile": {"Python": 1}}
    mentors = [
        {"name": "Priya", "skills": ["PostgreSQL", "Docker", "AWS"]},
        {"name": "Antony", "skills": ["Python", "FastAPI", "Docker"]},
    ]
    plan = agent.create_onboarding_plan(
        member=member,
        project_name="Customer Analytics Platform",
        required_skills=["Python", "Docker", "CI/CD"],
        available_mentors=mentors,
    )
    print(plan)
