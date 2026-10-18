import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ats_status_and_contributor():
    """Verify ATS endpoint status and proper attribution to Annam Paul."""
    response = client.get("/api/v1/ats/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "E1" in data["compliance"]
    assert "E2" in data["compliance"]
    assert "E3" in data["compliance"]
    assert "E4" in data["compliance"]
    assert "E10" in data["compliance"]
    assert data["contributor"]["name"] == "Annam Paul"
    assert data["contributor"]["github"] == "annampaul27"

def test_e1_e2_parse_jd():
    """Verify E1 & E2: Input raw JD text and parse into Critical vs Optional skills."""
    raw_jd = """
    We are seeking a Senior Full-Stack Engineer.
    Required skills: FastAPI, React Server Components, PostgreSQL, Docker.
    Nice to have: Redis, Kubernetes, GraphQL.
    Minimum 3 years of hands-on experience in building scalable microservices.
    """
    response = client.post("/api/v1/ats/parse-jd", json={"raw_text": raw_jd})
    assert response.status_code == 200
    data = response.json()
    assert "FastAPI" in data["mandatory_skills"] or "Python" in data["mandatory_skills"]
    assert len(data["mandatory_skills"]) > 0
    assert len(data["nice_to_have_skills"]) > 0
    assert data["years_of_experience_required"] >= 3

def test_e3_e4_compare_job_ready():
    """Verify E3 & E4: Weighted deficit scoring and Job-Ready tier (>=85%)."""
    form_data = {
        "resume_text": "Experienced engineer with skills in FastAPI, React Server Components, PostgreSQL, Docker, Redis, Kubernetes.",
        "jd_text": "Looking for FastAPI, React Server Components, PostgreSQL. Optional: Redis."
    }
    response = client.post("/api/v1/ats/compare", data=form_data)
    assert response.status_code == 200
    data = response.json()
    assert data["match_score"] >= 85.0
    assert data["tier"] == "job_ready"
    assert len(data["matched_skills"]) >= 2
    assert len(data["missing_skills"]) == 0

def test_e3_e4_compare_bridgeable():
    """Verify E3 & E4: Bridgeable tier (60-84%) when missing 1 discrete competency."""
    form_data = {
        "resume_text": "Skills: FastAPI, React Server Components, Docker, Next.js.",
        "jd_text": "Required skills: FastAPI, React Server Components, PostgreSQL."
    }
    response = client.post("/api/v1/ats/compare", data=form_data)
    assert response.status_code == 200
    data = response.json()
    # 2 out of 3 mandatory matched = (2/3)*80 = 53.33 + 20 (no nice-to-have) = 73.33% -> Bridgeable!
    assert 60.0 <= data["match_score"] < 85.0
    assert data["tier"] == "bridgeable"
    assert len(data["missing_skills"]) == 1

def test_e10_parse_resume_text_and_work_experience():
    """Verify E10: Parse resume extracting candidate info, skills, and work experience."""
    resume_file_content = b"""
    Aditya Verma
    Email: aditya.verma@example.com
    Phone: +91 9876543210
    Skills: React, Next.js, FastAPI, PostgreSQL, TypeScript, Docker.
    
    Work Experience:
    HyperScale Systems - Full-Stack Engineer Intern (Jan 2024 - Present)
    - Built REST API endpoints with FastAPI.
    - Implemented UI in Next.js and Tailwind CSS.
    """
    files = {"file": ("aditya_resume.txt", io.BytesIO(resume_file_content), "text/plain")}
    response = client.post("/api/v1/ats/parse-resume", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] != ""
    assert "FastAPI" in data["skills"] or "React" in data["skills"]
    assert len(data["work_experience"]) > 0
    assert data["work_experience"][0]["company"] != ""

def test_vector_query():
    """Verify semantic vector querying for matching resumes and JDs."""
    res = client.post("/api/v1/ats/query/resumes", json={"query_text": "FastAPI engineer", "n_results": 3})
    assert res.status_code == 200
    assert "ids" in res.json()

    res_jd = client.post("/api/v1/ats/query/jds", json={"query_text": "React frontend developer", "n_results": 3})
    assert res_jd.status_code == 200
    assert "ids" in res_jd.json()

if __name__ == "__main__":
    pytest.main(["-v", "test_ats_suite.py"])
