"""
CareerCompass AI - Interview Coach Feature

Provides the structure required for AI-powered interview
question generation and answer evaluation.

The actual AI/API integration will be handled separately.
"""



def prepare_interview_question(
    role: str,
    topic: str
) -> dict:
    """
    Prepare requirements for generating an interview question.
    """

    if not role.strip():
        raise ValueError("Role cannot be empty.")

    if not topic.strip():
        raise ValueError("Interview topic cannot be empty.")

    return {
        "role": role.strip(),
        "topic": topic.strip(),
        "question_requirements": {
            "challenging": True,
            "expected_keyword_count": "3-5",
            "hint_count": 2,
            "return_question_id": True,
        }
    }


def build_interview_question(
    question_id: str,
    question_text: str,
    expected_keywords: list[str],
    hints: list[str]
) -> dict:
    """
    Build a structured interview question.
    """

    if not question_text.strip():
        raise ValueError("Question text cannot be empty.")

    return {
        "question_id": question_id,
        "question_text": question_text,
        "expected_keywords": expected_keywords,
        "hints": hints
    }


def prepare_answer_evaluation(
    question_text: str,
    transcript: str
) -> dict:
    """
    Prepare a candidate's interview answer for evaluation.
    """

    if not question_text.strip():
        raise ValueError("Question text cannot be empty.")

    if not transcript.strip():
        raise ValueError("Interview answer cannot be empty.")

    return {
        "question": question_text.strip(),
        "candidate_answer": transcript.strip(),
        "evaluation_requirements": {
            "overall_score": True,
            "clarity": True,
            "technical_accuracy": True,
            "confidence_estimate": True,
            "what_went_well": True,
            "what_to_improve": True,
            "better_answer": True,
        }
    }


def build_interview_evaluation(
    overall_score: float,
    clarity: float,
    technical_accuracy: float,
    confidence_estimate: float,
    what_went_well: list[str],
    what_to_improve: list[str],
    better_answer: str
) -> dict:
    """
    Build a structured interview evaluation.
    """

    scores = [
        overall_score,
        clarity,
        technical_accuracy
    ]

    for score in scores:
        if not 0 <= score <= 100:
            raise ValueError("Interview scores must be between 0 and 100.")

    if not 0 <= confidence_estimate <= 1:
        raise ValueError(
            "Confidence estimate must be between 0.0 and 1.0."
        )

    return {
        "overall_score": overall_score,
        "metrics": {
            "clarity": clarity,
            "technical_accuracy": technical_accuracy,
            "confidence_estimate": confidence_estimate,
        },
        "what_went_well": what_went_well,
        "what_to_improve": what_to_improve,
        "better_answer": better_answer,
    }