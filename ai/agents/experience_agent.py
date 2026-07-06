from typing import Any, Dict, List, Optional

from .prompts import EXPERIENCE_ASSESSMENT_PROMPT, EXPERIENCE_PROMOTION_READINESS_PROMPT
from .tools import call_gemini, parse_json_response, compute_skill_gap, classify_experience_level


class ExperienceAgent:
    """
    Handles mid-level and senior engineers (designation contains 'senior',
    'staff', 'principal', 'lead', 'architect', or years_experience >= ~1.5 —
    see `tools.classify_experience_level`).

    Responsibilities:
      - Assess seniority tier, specialization areas, and remaining skill
        gaps against project requirements.
      - Estimate mentorship capacity and suggest which junior team members
        they should mentor (feeds into FresherAgent's mentor matching).
      - Suggest stretch assignments to keep experienced engineers growing.
      - Assess promotion readiness based on a performance summary.
    """

    def analyze_experience(
        self,
        member: Dict[str, Any],
        required_skills: List[str],
        junior_team_members: Optional[List[Dict[str, Any]]] = None,
        years_experience: float = 0,
    ) -> Dict[str, Any]:
        junior_team_members = junior_team_members or []
        skill_profile = member.get("skill_profile") or {}
        current_skills = list(skill_profile.keys()) or member.get("skills", [])

        prompt = EXPERIENCE_ASSESSMENT_PROMPT.format(
            name=member.get("name", "Team Member"),
            designation=member.get("designation", "Engineer"),
            years_experience=years_experience or "Unknown",
            skill_profile=skill_profile or current_skills,
            required_skills=required_skills,
            junior_team_members=[j.get("name") for j in junior_team_members] or "None available",
        )

        raw = call_gemini(prompt)
        fallback = {
            "seniority_tier": classify_experience_level(
                member.get("designation", ""), years_experience
            ),
            "specialization_areas": current_skills[:3],
            "skill_gaps": compute_skill_gap(required_skills, current_skills),
            "mentorship_capacity": "medium",
            "suggested_mentees": [j.get("name") for j in junior_team_members[:1]],
            "stretch_assignments": ["Lead design review for the next milestone"],
            "summary": f"{member.get('name', 'This engineer')} appears well-suited "
                       f"for the project based on current skills.",
        }
        assessment = parse_json_response(raw, fallback=fallback)

        return {
            "employee_id": member.get("id"),
            "employee_name": member.get("name"),
            "assessment": assessment,
        }

    def assess_promotion_readiness(
        self,
        member: Dict[str, Any],
        performance_summary: str,
        months_in_role: int,
    ) -> Dict[str, Any]:
        prompt = EXPERIENCE_PROMOTION_READINESS_PROMPT.format(
            name=member.get("name", "Team Member"),
            designation=member.get("designation", "Engineer"),
            performance_summary=performance_summary,
            months_in_role=months_in_role,
        )
        raw = call_gemini(prompt)
        fallback = {
            "promotion_ready": False,
            "confidence": "low",
            "supporting_factors": [],
            "gaps_to_address": ["Insufficient data to assess"],
        }
        return parse_json_response(raw, fallback=fallback)


# Example usage
if __name__ == "__main__":
    agent = ExperienceAgent()
    member = {
        "id": 2,
        "name": "Priya",
        "designation": "Senior Engineer",
        "skill_profile": {"PostgreSQL": 5, "Docker": 3, "AWS": 4},
    }
    juniors = [{"name": "Ravi", "skills": ["Python"]}]
    result = agent.analyze_experience(
        member=member,
        required_skills=["PostgreSQL", "Docker", "Kubernetes"],
        junior_team_members=juniors,
        years_experience=6,
    )
    print(result)
