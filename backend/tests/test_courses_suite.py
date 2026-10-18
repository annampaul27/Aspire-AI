"""
CareerCompass Courses & Mock Tests Test Suite
Authored by Jayasree A B (branch: courses)
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_all_courses():
    response = client.get("/api/v1/courses")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Jayasree A B" in data["author"]
    assert data["total_courses"] == 13
    assert len(data["courses"]) == 13

    # Check root alias /api/courses
    alias_res = client.get("/api/courses")
    assert alias_res.status_code == 200
    assert alias_res.json()["total_courses"] == 13


@pytest.mark.parametrize("course_slug", [
    "python", "sql", "aws", "llm", "trees", "arrays",
    "django", "flask", "pandas", "javascript", "html", "css", "excel"
])
def test_course_overview_and_lessons(course_slug):
    # Test overview
    res_overview = client.get(f"/api/v1/courses/{course_slug}")
    assert res_overview.status_code == 200
    overview = res_overview.json()
    assert "title" in overview
    assert "learning_objectives" in overview
    assert overview["slug"] == course_slug

    # Test lessons
    res_lessons = client.get(f"/api/v1/courses/{course_slug}/lessons")
    assert res_lessons.status_code == 200
    lessons_data = res_lessons.json()
    assert "lessons" in lessons_data
    assert len(lessons_data["lessons"]) >= 5


def test_mock_test_sanitization():
    # Candidates should not see answers by default
    res = client.get("/api/v1/courses/python/mock-test")
    assert res.status_code == 200
    test_data = res.json()
    assert test_data["question_count"] == 20
    assert test_data["passing_score"] == 60
    assert len(test_data["questions"]) == 20

    first_q = test_data["questions"][0]
    assert "correct_answer" not in first_q
    assert "explanation" not in first_q
    assert "options" in first_q

    # Reviewers with include_answers=true can view answer keys
    res_with_answers = client.get("/api/v1/courses/python/mock-test?include_answers=true")
    assert res_with_answers.status_code == 200
    first_q_ans = res_with_answers.json()["questions"][0]
    assert "correct_answer" in first_q_ans
    assert "explanation" in first_q_ans


def test_submit_mock_test_evaluation():
    # Submit mock test answers for Python
    # Q1 correct answer is 1 ("print()")
    # Q2 correct answer is 2 ("x = 10")
    # Q3 correct answer is 2 ("float")
    submission_payload = {
        "user_id": "cand-1",
        "answers": {
            "1": 1,
            "2": 2,
            "3": 2,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            "10": 0,
            "11": 0,
            "12": 0,
            "13": 0,
            "14": 0,
            "15": 0,
            "16": 0,
            "17": 0,
            "18": 0,
            "19": 0,
            "20": 0
        }
    }

    res = client.post("/api/v1/courses/python/mock-test/submit", json=submission_payload)
    assert res.status_code == 200
    result = res.json()
    assert result["status"] == "completed"
    assert result["total_questions"] == 20
    assert "score_percentage" in result
    assert "is_passed" in result
    assert "evaluated_by" in result
    assert "Jayasree A B" in result["evaluated_by"]
    assert len(result["results"]) == 20
    assert result["results"][0]["is_correct"] is True


def test_course_not_found():
    res = client.get("/api/v1/courses/non_existent_course_xyz")
    assert res.status_code == 404
