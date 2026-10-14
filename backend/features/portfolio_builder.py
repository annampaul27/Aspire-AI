"""
CareerCompass AI - Portfolio Builder Feature

Prepares candidate information and design preferences for
AI-generated personal portfolio websites.

The actual HTML generation/API integration will be handled later.
"""



VALID_LAYOUTS = [
    "Classic",
    "Split",
    "Centered"
]

VALID_MODES = [
    "Light",
    "Dark"
]


def prepare_portfolio(
    candidate_data: dict,
    color_theme: str = "blue",
    mode: str = "Light",
    layout_style: str = "Classic",
    font_vibe: str = "modern",
    corners: str = "rounded",
    animation_level: str = "medium",
    nav_style: str = "standard",
    section_order: list[str] | None = None,
    contact_email: str = "",
    contact_phone: str = "",
    custom_links: dict | None = None
) -> dict:
    """
    Prepare candidate information and preferences for portfolio generation.
    """

    if not candidate_data:
        raise ValueError("Candidate data cannot be empty.")

    if layout_style not in VALID_LAYOUTS:
        raise ValueError(
            f"Layout must be one of: {', '.join(VALID_LAYOUTS)}"
        )

    if mode not in VALID_MODES:
        raise ValueError(
            f"Mode must be one of: {', '.join(VALID_MODES)}"
        )

    return {
        "candidate_data": candidate_data,
        "preferences": {
            "color_theme": color_theme,
            "mode": mode,
            "layout_style": layout_style,
            "font_vibe": font_vibe,
            "corners": corners,
            "animation_level": animation_level,
            "nav_style": nav_style,
            "section_order": section_order or [
                "About",
                "Skills",
                "Projects",
                "Experience",
                "Education",
                "Contact"
            ],
            "contact_email": contact_email,
            "contact_phone": contact_phone,
            "custom_links": custom_links or {},
        },
        "generation_requirements": {
            "single_page": True,
            "responsive": True,
            "tailwind_css": True,
            "include_candidate_information": True,
            "return_html": True,
        }
    }


def get_portfolio_requirements() -> list[str]:
    """
    Return the main requirements for generated portfolios.
    """

    return [
        "Single-page HTML",
        "Responsive design",
        "Tailwind CSS",
        "Candidate information",
        "Skills section",
        "Projects section",
        "Experience section",
        "Education section",
        "Contact section",
        "Configurable theme",
        "Configurable layout",
        "Configurable light/dark mode",
    ]