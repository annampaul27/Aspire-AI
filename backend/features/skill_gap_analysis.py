"""
CareerCompass AI - Skill Gap Analysis Feature

Handles competency evaluation and identification of skill gaps
between a candidate profile and a target role.

API/LLM integration is intentionally kept separate so that
the AI provider can be connected later.
"""



VALID_SKILL_LEVELS = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert"
]


def prepare_skill_gap_analysis(
    candidate_profile: str,
    target_role: str,
    job_description: str | None = None
) -> dict:
    """
    Prepare candidate information for skill-gap analysis.

    Parameters:
        candidate_profile: Resume/profile information.
        target_role: Target career role.
        job_description: Optional target job description.

    Returns:
        Structured information required for competency and
        skill-gap analysis.
    """

    if not candidate_profile.strip():
        raise ValueError("Candidate profile cannot be empty.")

    if not target_role.strip():
        raise ValueError("Target role cannot be empty.")

    return {
        "candidate_profile": candidate_profile.strip(),
        "target_role": target_role.strip(),
        "job_description": (
            job_description.strip()
            if job_description
            else None
        ),
        "analysis_requirements": {
            "minimum_competency_areas": 5,
            "minimum_skills_per_area": 2,
            "minimum_gap_skills": 5,
            "skill_levels": VALID_SKILL_LEVELS,
            "include_evidence_source": True,
            "include_evidence_comment": True,
            "include_current_level": True,
            "include_required_level": True,
        }
    }


def build_competency_area(
    area_name: str,
    skills: list[dict]
) -> dict:
    """
    Create a structured competency area.

    Each skill should contain:
        name
        level
        evidence_source
        evidence_comment
    """

    if not area_name.strip():
        raise ValueError("Competency area name cannot be empty.")

    if len(skills) < 2:
        raise ValueError(
            "Each competency area must contain at least two skills."
        )

    for skill in skills:
        if skill.get("level") not in VALID_SKILL_LEVELS:
            raise ValueError(
                f"Invalid skill level for {skill.get('name', 'skill')}."
            )

    return {
        "area": area_name.strip(),
        "skills": skills
    }


def build_skill_gap(
    skill_name: str,
    current_level: str,
    required_level: str
) -> dict:
    """
    Create a structured skill-gap entry.
    """

    if not skill_name.strip():
        raise ValueError("Skill name cannot be empty.")

    if current_level not in VALID_SKILL_LEVELS:
        raise ValueError("Invalid current skill level.")

    if required_level not in VALID_SKILL_LEVELS:
        raise ValueError("Invalid required skill level.")

    return {
        "skill": skill_name.strip(),
        "current_level": current_level,
        "required_level": required_level
    }


def get_skill_gap_analysis_requirements() -> dict:
    """
    Return the required output structure for the AI layer.
    """

    return {
        "competency_areas": {
            "minimum": 5,
            "skills_per_area": 2
        },
        "skill_evaluation": [
            "skill name",
            "level",
            "evidence source",
            "evidence comment"
        ],
        "skill_gaps": {
            "minimum": 5,
            "fields": [
                "skill",
                "current_level",
                "required_level"
            ]
        }
    }