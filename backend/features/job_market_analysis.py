"""
CareerCompass AI - Job Market Analysis Feature

Prepares target-role information for job-market and demand analysis.
The actual external API/data-source integration can be added later.
"""



def prepare_job_market_analysis(
    role_title: str,
    location: str | None = None
) -> dict:
    """
    Prepare a target role for job-market analysis.
    """

    if not role_title.strip():
        raise ValueError("Role title cannot be empty.")

    return {
        "role_title": role_title.strip(),
        "location": location.strip() if location else None,
        "analysis_requirements": {
            "job_count": True,
            "demand_level": True,
            "market_source": True,
            "current_market_context": True,
        }
    }


def classify_demand(job_count: int) -> str:
    """
    Classify market demand using the thresholds used by
    the original CareerCompass implementation.
    """

    if job_count < 0:
        raise ValueError("Job count cannot be negative.")

    if job_count > 50000:
        return "High"
    elif job_count > 10000:
        return "Medium"
    else:
        return "Low"


def build_market_result(
    job_count: int | None,
    source: str
) -> dict:
    """
    Create a structured job-market result.
    """

    if job_count is None:
        return {
            "count": "Unknown",
            "demand": "Medium",
            "source": source
        }

    return {
        "count": job_count,
        "demand": classify_demand(job_count),
        "source": source
    }
