import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel

# Automatically discover and load unified monorepo .env or local .env
_current_dir = Path(__file__).resolve().parent
_candidates = [
    Path.cwd() / ".env",
    _current_dir.parents[2] / ".env",
    _current_dir.parents[1] / ".env",
]
for _env_path in _candidates:
    if _env_path.is_file():
        load_dotenv(dotenv_path=_env_path, override=False)
        break

class InterviewCoachSettings(BaseModel):
    """
    Autonomous Configuration for AI Interview Coach.
    Operates independently without requiring parent monorepo configuration.
    """
    APP_NAME: str = "Aspire Multimodal AI Interview Coach"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("INTERVIEW_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("INTERVIEW_PORT", "8005"))
    
    # LLM & Whisper Speech Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "whisper-large-v3-turbo")

    # Speech Acoustics Thresholds
    OPTIMAL_WPM_MIN: float = 120.0
    OPTIMAL_WPM_MAX: float = 165.0
    
    # Common Verbal Filler Words & Tics
    FILLER_WORDS: list[str] = [
        "um", "uh", "like", "you know", "actually",
        "basically", "sort of", "kind of", "literally",
        "right", "i mean", "so yeah", "honestly"
    ]

    # Academic Scoring Weights
    WEIGHT_TECHNICAL: float = 0.50
    WEIGHT_VOCAL: float = 0.25
    WEIGHT_NONVERBAL: float = 0.25

settings = InterviewCoachSettings()
