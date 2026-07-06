"""
Centralized Gemini prompt templates used by the Fresher and Experience agents.

Keeping prompts in one place makes it easy to tune wording without touching
agent logic, and keeps every agent responding in a consistent, parseable
format (mirrors the "one line" / "raw JSON only" convention already used by
`backend/app/core/ai_agents.py`).
"""

# ── Fresher Agent prompts ──────────────────────────────────────────────────

FRESHER_ONBOARDING_PROMPT = """You are an Onboarding Agent for a software engineering team.

New hire: {name}, Designation: {designation}
Current skills: {current_skills}
Project they are joining: {project_name}
Skills required for the project: {required_skills}
Available mentors (senior/mid-level engineers on the team): {available_mentors}

Design a 30-60-90 day onboarding plan for this fresher. Respond with valid raw
JSON only (no markdown fences):
{{
  "skill_gaps": ["skills the fresher still needs to learn"],
  "recommended_mentor": "name of the best-matching mentor from the available list, or null",
  "mentor_reason": "one sentence explaining the mentor match",
  "day_30": ["3-5 concrete tasks/goals for the first 30 days"],
  "day_60": ["3-5 concrete tasks/goals for days 31-60"],
  "day_90": ["3-5 concrete tasks/goals for days 61-90"],
  "recommended_courses": ["beginner-friendly course topics to assign"],
  "risk_notes": "one sentence flagging anything HR should watch out for, or empty string"
}}"""

FRESHER_CHECKIN_PROMPT = """You are an Onboarding Agent reviewing a fresher's progress.

Employee: {name}
Onboarding plan so far: {plan_summary}
Progress notes: {progress_notes}

Respond with valid raw JSON only (no markdown fences):
{{
  "on_track": true or false,
  "concerns": ["specific concerns, empty list if none"],
  "adjustments": ["suggested adjustments to the remaining plan"]
}}"""


# ── Experience Agent prompts ───────────────────────────────────────────────

EXPERIENCE_ASSESSMENT_PROMPT = """You are a Senior Talent Assessment Agent evaluating an experienced engineer.

Employee: {name}, Designation: {designation}
Years of relevant experience (estimated): {years_experience}
Current skill profile: {skill_profile}
Project requirements: {required_skills}
Team members who could benefit from mentorship: {junior_team_members}

Respond with valid raw JSON only (no markdown fences):
{{
  "seniority_tier": "mid-level | senior | staff | principal",
  "specialization_areas": ["1-3 areas of deep expertise"],
  "skill_gaps": ["advanced skills still missing for the project, if any"],
  "mentorship_capacity": "low | medium | high",
  "suggested_mentees": ["names from the junior team member list this person should mentor"],
  "stretch_assignments": ["1-3 challenging tasks that would grow this engineer further"],
  "summary": "2 sentence assessment summary"
}}"""

EXPERIENCE_PROMOTION_READINESS_PROMPT = """You are a Career Growth Agent assessing promotion readiness.

Employee: {name}, Current designation: {designation}
Performance summary: {performance_summary}
Time in current role (months): {months_in_role}

Respond with valid raw JSON only (no markdown fences):
{{
  "promotion_ready": true or false,
  "confidence": "low | medium | high",
  "supporting_factors": ["1-3 factors supporting the assessment"],
  "gaps_to_address": ["1-3 gaps to close before promotion, empty list if none"]
}}"""
