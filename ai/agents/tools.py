"""
Shared tools/utilities for the Fresher and Experience agents.

This mirrors the lightweight `gemini_call` fallback pattern used in
`backend/app/core/ai_agents.py`, but is kept self-contained here so the
`ai/agents` package can be imported and unit-tested independently of the
FastAPI backend.
"""

from typing import Any, Dict, List, Optional
import json
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"

_gemini_client = None
if GOOGLE_API_KEY and GOOGLE_API_KEY != "your-gemini-api-key-here":
    try:
        from google import genai
        _gemini_client = genai.Client(api_key=GOOGLE_API_KEY)
    except ImportError:
        _gemini_client = None


def _mock_response(prompt: str) -> str:
    """Deterministic fallback so agents keep working without an API key."""
    print(f"[Mock Gemini Call] prompt: {prompt[:100]}...")
    if "onboarding" in prompt.lower():
        return json.dumps({
            "skill_gaps": ["Docker", "CI/CD"],
            "recommended_mentor": None,
            "mentor_reason": "No mentor could be auto-matched; assign manually.",
            "day_30": ["Complete environment setup", "Shadow a senior engineer",
                       "Finish onboarding courses"],
            "day_60": ["Take first small ticket", "Pair-program on a feature"],
            "day_90": ["Own a feature end-to-end", "Present learnings to the team"],
            "recommended_courses": ["Git Basics", "Team Coding Standards"],
            "risk_notes": "",
        })
    if "seniority_tier" in prompt.lower() or "assessment" in prompt.lower():
        return json.dumps({
            "seniority_tier": "senior",
            "specialization_areas": ["Backend", "System Design"],
            "skill_gaps": [],
            "mentorship_capacity": "high",
            "suggested_mentees": [],
            "stretch_assignments": ["Lead the next project's architecture review"],
            "summary": "Strong, well-rounded engineer ready for larger scope.",
        })
    if "promotion_ready" in prompt.lower():
        return json.dumps({
            "promotion_ready": False,
            "confidence": "medium",
            "supporting_factors": ["Consistent delivery"],
            "gaps_to_address": ["More cross-team visibility"],
        })
    return json.dumps({"result": "Mock AI response."})


def call_gemini(prompt: str) -> str:
    """Call the real Gemini API if configured, otherwise fall back to a mock."""
    if _gemini_client is None:
        return _mock_response(prompt)
    try:
        response = _gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"[Gemini API error, falling back to mock] {e}")
        return _mock_response(prompt)


def parse_json_response(raw: str, fallback: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Strip markdown fences (if any) and parse a JSON response safely."""
    if fallback is None:
        fallback = {}
    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = clean.lstrip("`")
            if clean.lower().startswith("json"):
                clean = clean[4:]
            clean = clean.rstrip("`").strip()
        return json.loads(clean)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"[parse_json_response] failed to parse response: {e!r} raw={raw!r}")
        return fallback


def compute_skill_gap(required_skills: List[str], current_skills: List[str]) -> List[str]:
    """Return required skills the person doesn't already have (case-insensitive)."""
    current_lower = {s.lower().strip() for s in current_skills}
    return [s for s in required_skills if s.lower().strip() not in current_lower]


def classify_experience_level(designation: str, years_experience: float = 0) -> str:
    """
    Heuristically classify an engineer as 'fresher', 'mid-level', or 'senior'
    based on designation text and/or years of experience. Used to decide
    whether the FresherAgent or ExperienceAgent should handle a team member.
    """
    designation_lower = (designation or "").lower()

    fresher_keywords = ["fresher", "intern", "graduate", "trainee", "junior", "entry"]
    senior_keywords = ["senior", "staff", "principal", "lead", "architect", "manager"]

    if any(k in designation_lower for k in fresher_keywords):
        return "fresher"
    if any(k in designation_lower for k in senior_keywords):
        return "senior"

    if years_experience:
        if years_experience < 1.5:
            return "fresher"
        if years_experience >= 5:
            return "senior"

    return "mid-level"


def find_best_mentor(candidates: List[Dict[str, Any]], required_skills: List[str]) -> Optional[Dict[str, Any]]:
    """
    Pick the candidate (list of {"name": str, "skills": List[str]}) whose
    skills overlap the most with required_skills. Returns None if no
    candidates are provided.
    """
    if not candidates:
        return None

    def overlap_score(candidate: Dict[str, Any]) -> int:
        skills = {s.lower().strip() for s in candidate.get("skills", [])}
        return len([s for s in required_skills if s.lower().strip() in skills])

    return max(candidates, key=overlap_score)
