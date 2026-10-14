"""
CareerCompass - Personalized Roadmap Generator
Authored by Jayasree A B (branch: features)

This module converts skill gaps into a personalized learning roadmap.

It does NOT call Gemini, Groq, or any other API.
The API/LLM layer can be connected later by the backend developer.

Flow:
    Resume + Job Description
            ↓
       Skill Gap Analysis
            ↓
       personalized_roadmap.py
            ↓
    Course + Lesson Mapping
            ↓
       Personalized Roadmap
"""

from typing import Any
import json
from pathlib import Path

# -------------------------------------------------------------------
# Course data location
# -------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
COURSES_DIR = PROJECT_ROOT / "courses"
if not COURSES_DIR.exists():
    COURSES_DIR = Path(__file__).resolve().parents[1] / "courses"
if not COURSES_DIR.exists():
    COURSES_DIR = Path.cwd() / "courses"

# -------------------------------------------------------------------
# CareerCompass course catalogue
# -------------------------------------------------------------------

COURSE_CATALOGUE = {
    "python": {
        "title": "Python",
        "course_path": "courses/python",
        "duration_minutes": 90,
        "prerequisites": []
    },
    "llm": {
        "title": "Large Language Models",
        "course_path": "courses/llm",
        "duration_minutes": 90,
        "prerequisites": ["python"]
    },
    "sql": {
        "title": "SQL",
        "course_path": "courses/sql",
        "duration_minutes": 90,
        "prerequisites": []
    },
    "arrays": {
        "title": "Arrays",
        "course_path": "courses/arrays",
        "duration_minutes": 60,
        "prerequisites": ["python"]
    },
    "trees": {
        "title": "Trees",
        "course_path": "courses/trees",
        "duration_minutes": 60,
        "prerequisites": ["arrays"]
    },
    "html": {
        "title": "HTML",
        "course_path": "courses/html",
        "duration_minutes": 60,
        "prerequisites": []
    },
    "css": {
        "title": "CSS",
        "course_path": "courses/css",
        "duration_minutes": 60,
        "prerequisites": ["html"]
    },
    "javascript": {
        "title": "JavaScript",
        "course_path": "courses/javascript",
        "duration_minutes": 90,
        "prerequisites": ["html", "css"]
    },
    "django": {
        "title": "Django",
        "course_path": "courses/django",
        "duration_minutes": 90,
        "prerequisites": ["python"]
    },
    "flask": {
        "title": "Flask",
        "course_path": "courses/flask",
        "duration_minutes": 90,
        "prerequisites": ["python"]
    },
    "pandas": {
        "title": "Pandas",
        "course_path": "courses/pandas",
        "duration_minutes": 90,
        "prerequisites": ["python"]
    },
    "excel": {
        "title": "Excel",
        "course_path": "courses/excel",
        "duration_minutes": 90,
        "prerequisites": []
    },
    "aws": {
        "title": "AWS",
        "course_path": "courses/aws",
        "duration_minutes": 90,
        "prerequisites": []
    }
}


# -------------------------------------------------------------------
# Skill name normalization
# -------------------------------------------------------------------

SKILL_ALIASES = {
    "py": "python",
    "python programming": "python",
    "python programming language": "python",

    "structured query language": "sql",

    "data manipulation with pandas": "pandas",
    "pandas library": "pandas",

    "ms excel": "excel",
    "microsoft excel": "excel",

    "amazon web services": "aws",
    "amazon aws": "aws",

    "html5": "html",
    "hypertext markup language": "html",

    "css3": "css",
    "cascading style sheets": "css",

    "js": "javascript",
    "javascript programming": "javascript",

    "django framework": "django",
    "flask framework": "flask",

    "large language model": "llm",
    "large language models": "llm",
    "generative ai": "llm"
}


def normalize_skill(skill: str) -> str:
    """
    Convert different names for the same skill into a common
    CareerCompass course identifier.
    """

    if not skill:
        return ""

    normalized = skill.strip().lower()

    if normalized in SKILL_ALIASES:
        return SKILL_ALIASES[normalized]

    return normalized


# -------------------------------------------------------------------
# Extract skills from skill-gap analysis
# -------------------------------------------------------------------

def extract_gap_skills(skill_gaps: list[Any]) -> list[dict[str, str]]:
    """
    Accepts several possible formats from the skill-gap module.

    Examples:

    [
        "SQL",
        "AWS"
    ]

    or:

    [
        {
            "skill": "SQL",
            "current_level": "Beginner",
            "required_level": "Advanced"
        }
    ]
    """

    extracted = []

    for gap in skill_gaps or []:

        if isinstance(gap, str):
            skill_name = gap
            current_level = "Unknown"
            required_level = "Required"

        elif isinstance(gap, dict):
            skill_name = (
                gap.get("skill")
                or gap.get("name")
                or gap.get("skill_name")
                or ""
            )

            current_level = (
                gap.get("current_level")
                or gap.get("current")
                or "Unknown"
            )

            required_level = (
                gap.get("required_level")
                or gap.get("required")
                or "Required"
            )

        else:
            continue

        normalized = normalize_skill(skill_name)

        if normalized:
            extracted.append({
                "skill": normalized,
                "current_level": str(current_level),
                "required_level": str(required_level)
            })

    return extracted


# -------------------------------------------------------------------
# Match skill gaps to CareerCompass courses
# -------------------------------------------------------------------

def match_skills_to_courses(
    skill_gaps: list[dict[str, str]]
) -> list[dict[str, Any]]:
    """
    Match identified skill gaps with available CareerCompass courses.

    Skills for which no internal course exists are returned as
    external_learning=True so the API can handle them separately.
    """

    matches = []

    for gap in skill_gaps:

        skill = gap["skill"]

        if skill in COURSE_CATALOGUE:

            course = COURSE_CATALOGUE[skill]

            matches.append({
                "skill": skill,
                "current_level": gap["current_level"],
                "required_level": gap["required_level"],
                "course_available": True,
                "course_title": course["title"],
                "course_path": course["course_path"],
                "duration_minutes": course["duration_minutes"],
                "prerequisites": course["prerequisites"],
                "external_learning": False
            })

        else:

            matches.append({
                "skill": skill,
                "current_level": gap["current_level"],
                "required_level": gap["required_level"],
                "course_available": False,
                "course_title": None,
                "course_path": None,
                "duration_minutes": 0,
                "prerequisites": [],
                "external_learning": True
            })

    return matches


# -------------------------------------------------------------------
# Resolve prerequisite order
# -------------------------------------------------------------------

def order_courses(
    course_matches: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """
    Arrange available courses so that prerequisites appear first.

    This is a simple dependency ordering suitable for the current
    CareerCompass course catalogue.
    """

    available = {
        item["skill"]: item
        for item in course_matches
        if item["course_available"]
    }

    ordered = []
    visited = set()

    def visit(skill: str):

        if skill in visited:
            return

        if skill not in available:
            return

        visited.add(skill)

        prerequisites = available[skill]["prerequisites"]

        for prerequisite in prerequisites:
            visit(prerequisite)

        ordered.append(available[skill])

    for skill in available:
        visit(skill)

    return ordered


# -------------------------------------------------------------------
# Generate roadmap phases
# -------------------------------------------------------------------

def build_roadmap_phases(
    ordered_courses: list[dict[str, Any]]
) -> list[dict[str, Any]]:

    phases = []

    for index, course in enumerate(ordered_courses, start=1):
        course_data = load_course_data(course["skill"])

        phases.append({
            "phase": index,
            "skill": course["skill"],
            "title": course["course_title"],
            "current_level": course["current_level"],
            "required_level": course["required_level"],

            "course": {
                "path": course["course_path"],
                "duration_minutes": course["duration_minutes"]
            },

            "course_content": course_data["course"],
            "lessons": course_data["lessons"],
            "mock_test_content": course_data["mock_test"],

            "mock_test": {
                "question_count": 20,
                "duration_minutes": 12,
                "passing_score": 60
            },

            "prerequisites": course["prerequisites"],

            "goal": (
                f"Complete the {course['course_title']} course "
                "and pass the associated mock test."
            )
        })
    return phases


def load_course_data(skill: str) -> dict[str, Any]:
    """
    Load the actual course, lessons, and mock-test JSON files
    for a CareerCompass course.
    """

    course_dir = COURSES_DIR / skill

    result = {
        "course": None,
        "lessons": [],
        "mock_test": None
    }

    # course.json
    course_file = course_dir / "course.json"

    if course_file.exists():
        try:
            with open(course_file, encoding="utf-8") as f:
                result["course"] = json.load(f)
        except (json.JSONDecodeError, OSError):
            result["course"] = None

    # lessons.json
    lessons_file = course_dir / "lessons.json"

    if lessons_file.exists():
        try:
            with open(lessons_file, encoding="utf-8") as f:
                result["lessons"] = json.load(f)
        except (json.JSONDecodeError, OSError):
            result["lessons"] = []

    # mock_test.json
    mock_test_file = course_dir / "mock_test.json"

    if mock_test_file.exists():
        try:
            with open(mock_test_file, encoding="utf-8") as f:
                result["mock_test"] = json.load(f)
        except (json.JSONDecodeError, OSError):
            result["mock_test"] = None

    return result


# -------------------------------------------------------------------
# Generate final personalized roadmap
# -------------------------------------------------------------------

def generate_personalized_roadmap(
    skill_gaps: list[Any],
    target_role: str = "Target Role",
    weekly_hours: int = 5
) -> dict[str, Any]:
    """
    Main function used by the backend.

    Parameters
    ----------
    skill_gaps:
        Skills identified by the skill-gap analysis.

    target_role:
        Job role from the job description.

    weekly_hours:
        Approximate learning availability per week.

    Returns
    -------
    dict
        Personalized roadmap ready for an API response.
    """

    normalized_gaps = extract_gap_skills(skill_gaps)

    course_matches = match_skills_to_courses(normalized_gaps)

    ordered_courses = order_courses(course_matches)

    phases = build_roadmap_phases(ordered_courses)

    total_course_minutes = sum(
        phase["course"]["duration_minutes"]
        for phase in phases
    )

    external_skills = [
        item["skill"]
        for item in course_matches
        if item["external_learning"]
    ]

    available_skills = [
        item["skill"]
        for item in course_matches
        if item["course_available"]
    ]

    return {
        "roadmap_title": f"Personalized Roadmap for {target_role}",

        "target_role": target_role,

        "weekly_learning_hours": weekly_hours,

        "skill_gap_count": len(normalized_gaps),

        "available_course_count": len(available_skills),

        "external_learning_count": len(external_skills),

        "total_course_duration_minutes": total_course_minutes,

        "total_course_duration_hours": round(
            total_course_minutes / 60,
            2
        ),

        "phases": phases,

        "external_learning": [
            {
                "skill": skill,
                "message": (
                    "No CareerCompass course currently exists "
                    "for this skill."
                )
            }
            for skill in external_skills
        ],

        "completion_rule": {
            "course_completion": "Complete all assigned lessons",
            "mock_test": "20 questions",
            "mock_test_duration_minutes": 12,
            "passing_score": 60
        }
    }


# -------------------------------------------------------------------
# Convenience function for resume + JD workflow
# -------------------------------------------------------------------

def create_roadmap_from_skill_gap_result(
    skill_gap_result: dict[str, Any],
    target_role: str = "Target Role",
    weekly_hours: int = 5
) -> dict[str, Any]:
    """
    Convenience wrapper for connecting this module to the existing
    skill-gap analysis feature.

    It attempts to find the skill-gap list using common field names.
    """

    gaps = (
        skill_gap_result.get("gap_skills")
        or skill_gap_result.get("skill_gaps")
        or skill_gap_result.get("gaps")
        or []
    )

    return generate_personalized_roadmap(
        skill_gaps=gaps,
        target_role=target_role,
        weekly_hours=weekly_hours
    )


# -------------------------------------------------------------------
# Simple local test
# -------------------------------------------------------------------

if __name__ == "__main__":

    example_skill_gaps = [
        {
            "skill": "Python",
            "current_level": "Intermediate",
            "required_level": "Advanced"
        },
        {
            "skill": "Pandas",
            "current_level": "Beginner",
            "required_level": "Advanced"
        },
        {
            "skill": "AWS",
            "current_level": "None",
            "required_level": "Beginner"
        },
        {
            "skill": "Docker",
            "current_level": "None",
            "required_level": "Intermediate"
        }
    ]

    roadmap = generate_personalized_roadmap(
        skill_gaps=example_skill_gaps,
        target_role="Data Analyst",
        weekly_hours=5
    )

    import json

    print(
        json.dumps(
            roadmap,
            indent=2
        )
    )
