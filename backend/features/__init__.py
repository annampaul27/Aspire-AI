"""
CareerCompass AI Feature Package
Authored by Jayasree A B (branch: features)
"""

from .career_roadmap import prepare_career_roadmap, create_roadmap_phase, get_career_roadmap_requirements
from .github_analysis import prepare_github_analysis, get_github_analysis_requirements
from .interview_coach import (
    prepare_interview_question,
    build_interview_question,
    prepare_answer_evaluation,
    build_interview_evaluation,
)
from .job_market_analysis import prepare_job_market_analysis, classify_demand, build_market_result
from .portfolio_builder import prepare_portfolio
from .resume_analysis import prepare_resume_analysis, get_resume_analysis_requirements
from .skill_gap_analysis import (
    prepare_skill_gap_analysis,
    build_competency_area,
    VALID_SKILL_LEVELS,
)
from .personalized_roadmap import (
    generate_personalized_roadmap,
    create_roadmap_from_skill_gap_result,
    normalize_skill,
    extract_gap_skills,
    match_skills_to_courses,
    order_courses,
    COURSE_CATALOGUE,
)

__author__ = "Jayasree A B <jayasreeab2004@gmail.com>"
__all__ = [
    "COURSE_CATALOGUE",
    "VALID_SKILL_LEVELS",
    "build_competency_area",
    "build_interview_evaluation",
    "build_interview_question",
    "build_market_result",
    "classify_demand",
    "create_roadmap_from_skill_gap_result",
    "create_roadmap_phase",
    "extract_gap_skills",
    "generate_personalized_roadmap",
    "get_career_roadmap_requirements",
    "get_github_analysis_requirements",
    "get_resume_analysis_requirements",
    "match_skills_to_courses",
    "normalize_skill",
    "order_courses",
    "prepare_answer_evaluation",
    "prepare_career_roadmap",
    "prepare_github_analysis",
    "prepare_interview_question",
    "prepare_job_market_analysis",
    "prepare_portfolio",
    "prepare_resume_analysis",
    "prepare_skill_gap_analysis",
]
