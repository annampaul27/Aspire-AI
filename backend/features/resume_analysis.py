"""
CareerCompass AI - Resume Analysis Feature

This module contains the resume-analysis feature logic.
API/LLM integration is intentionally kept separate so that
the backend team can connect the required AI provider later.
"""



def prepare_resume_analysis(
    resume_text: str,
    job_description: str | None = None
) -> dict:
    """
    Prepare the information required for AI-based resume analysis.

    Parameters:
        resume_text: Extracted text from the candidate's resume.
        job_description: Optional target job description.

    Returns:
        A structured dictionary containing the information
        required for resume analysis.
    """

    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")

    return {
        "resume_text": resume_text.strip(),
        "job_description": (
            job_description.strip()
            if job_description
            else None
        ),
        "analysis_requirements": {
            "identify_highlights": True,
            "identify_strengths": True,
            "identify_weaknesses": True,
            "provide_actionable_feedback": True,
            "evaluate_role_relevance": bool(job_description),
            "check_date_relevance": True,
        }
    }


def get_resume_analysis_requirements() -> list[str]:
    """
    Return the analysis areas expected from the AI service.
    """

    return [
        "Resume highlights",
        "Strengths",
        "Weaknesses",
        "Actionable improvement feedback",
        "Role relevance",
        "Experience relevance",
        "Skills relevance",
        "Date and timeline consistency",
    ]