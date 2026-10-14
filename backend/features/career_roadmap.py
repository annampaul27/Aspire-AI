"""
CareerCompass AI - Career Roadmap Feature

Creates the structured requirements for generating a personalized
career development roadmap based on a candidate's current skills,
skill gaps, and target role.

API/LLM integration is intentionally kept separate.
"""



def prepare_career_roadmap(
    target_role: str,
    current_skills: list[str],
    skill_gaps: list[dict],
    candidate_profile: str | None = None
) -> dict:
    """
    Prepare information for generating a personalized career roadmap.

    Parameters:
        target_role: The role the candidate wants to pursue.
        current_skills: Skills the candidate currently has.
        skill_gaps: Skills that need improvement for the target role.
        candidate_profile: Optional additional candidate information.

    Returns:
        Structured roadmap-generation requirements.
    """

    if not target_role.strip():
        raise ValueError("Target role cannot be empty.")

    if not current_skills:
        raise ValueError("At least one current skill is required.")

    if not skill_gaps:
        raise ValueError("At least one skill gap is required.")

    return {
        "target_role": target_role.strip(),
        "current_skills": current_skills,
        "skill_gaps": skill_gaps,
        "candidate_profile": (
            candidate_profile.strip()
            if candidate_profile
            else None
        ),
        "roadmap_requirements": {
            "duration_days": 90,
            "include_learning_goals": True,
            "include_skill_priorities": True,
            "include_practical_projects": True,
            "include_resources": True,
            "include_milestones": True,
            "include_progress_checkpoints": True,
            "personalize_to_target_role": True,
        }
    }


def create_roadmap_phase(
    phase_name: str,
    duration: str,
    goals: list[str],
    skills: list[str],
    activities: list[str]
) -> dict:
    """
    Create a structured phase of the career roadmap.
    """

    if not phase_name.strip():
        raise ValueError("Phase name cannot be empty.")

    if not goals:
        raise ValueError("At least one goal is required.")

    return {
        "phase": phase_name.strip(),
        "duration": duration,
        "goals": goals,
        "skills": skills,
        "activities": activities,
    }


def get_career_roadmap_requirements() -> dict:
    """
    Return the required structure for the generated roadmap.
    """

    return {
        "duration": "90 days",
        "required_sections": [
            "Current skill assessment",
            "Priority skill gaps",
            "Learning goals",
            "Practical projects",
            "Learning resources",
            "Milestones",
            "Progress checkpoints",
            "Target-role preparation",
        ],
        "suggested_phases": [
            "Foundation",
            "Skill Development",
            "Practical Application",
            "Career Preparation",
        ]
    }