from app.db.session import SessionLocal, engine
from app.models.entities import (
    Base,
    Cohort,
    CohortStudent,
    BatchDispatch,
    ProctoringAnomalyLog,
)
from app.db.seed import seed_database_defaults

def test_tpo_models_and_relationships():
    # Ensure tables exist and default seed runs
    Base.metadata.create_all(bind=engine)
    seed_database_defaults()

    db = SessionLocal()
    try:
        cohort = db.query(Cohort).filter(Cohort.id == "cohort-cse-2026-a").first()
        assert cohort is not None, "Seeded cohort-cse-2026-a should exist"
        assert "Computer Science" in cohort.name
        assert cohort.department == "Computer Science & Engineering"
        assert cohort.graduation_year == 2026
        assert cohort.student_count >= 10

        # Verify enrolled students
        students = db.query(CohortStudent).filter(CohortStudent.cohort_id == cohort.id).all()
        assert len(students) >= 10
        assert any(s.roll_number == "CS26-001" for s in students)

        # Verify batch dispatch
        dispatch = db.query(BatchDispatch).filter(BatchDispatch.cohort_id == cohort.id).first()
        assert dispatch is not None
        assert dispatch.dispatch_type in ["gap_sprint", "mock_assessment"]
        assert dispatch.total_students >= 10

        # Verify proctoring anomalies
        anomalies = db.query(ProctoringAnomalyLog).all()
        assert len(anomalies) >= 1
    finally:
        db.close()


def test_cohorts_listing_and_creation():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    res = client.get("/api/v1/tpo/cohorts?org_id=org-apex-univ")
    assert res.status_code == 200
    data = res.json()
    assert "cohorts" in data
    assert len(data["cohorts"]) >= 1
    cohort = data["cohorts"][0]
    assert cohort["id"] == "cohort-cse-2026-a"
    assert "tier_distribution" in cohort
    assert cohort["student_count"] >= 10

    # Test creating new cohort
    create_res = client.post("/api/v1/tpo/cohorts", json={
        "name": "B.Tech Information Technology 2026 - Section B",
        "department": "Information Technology",
        "graduation_year": 2026,
        "target_role": "Backend Cloud Engineer",
        "org_id": "org-apex-univ"
    })
    assert create_res.status_code == 201
    created_cohort = create_res.json()["cohort"]
    assert created_cohort["name"] == "B.Tech Information Technology 2026 - Section B"
    assert created_cohort["department"] == "Information Technology"

    # Test cohort detail endpoint
    detail_res = client.get(f"/api/v1/tpo/cohorts/{cohort['id']}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["cohort"]["id"] == cohort["id"]
    assert len(detail_data["students"]) >= 10


def test_batch_dispatch_lifecycle():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    dispatch_res = client.post("/api/v1/tpo/batch-dispatch", json={
        "cohort_id": "cohort-cse-2026-a",
        "dispatch_type": "gap_sprint",
        "title": "System Design & Redis Idempotency 48h Sprint",
        "target_skill": "Distributed Systems",
        "deadline_hours": 48
    })
    assert dispatch_res.status_code == 201
    dispatch_data = dispatch_res.json()
    assert dispatch_data["success"] is True
    assert dispatch_data["dispatch"]["total_students"] >= 10
    assert dispatch_data["dispatch"]["target_skill"] == "Distributed Systems"

    # Verify listing of dispatches
    list_res = client.get("/api/v1/tpo/batch-dispatches?cohort_id=cohort-cse-2026-a")
    assert list_res.status_code == 200
    dispatches = list_res.json()["dispatches"]
    assert len(dispatches) >= 1
    assert any(d["target_skill"] == "Distributed Systems" for d in dispatches)


def test_naac_accreditation_report_and_csv_export():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    # Test JSON NAAC report
    res = client.get("/api/v1/tpo/naac-report?cohort_id=cohort-cse-2026-a")
    assert res.status_code == 200
    report = res.json()
    assert report["criterion"] == "NAAC Criterion 5.1.3 & 5.2.1"
    assert "competency_growth_percentage" in report
    assert report["competency_growth_percentage"] > 0
    assert "deficit_remediation_rate" in report
    assert "tier_distribution" in report
    assert report["tier_distribution"]["job_ready_count"] >= 1
    assert "domain_breakdowns" in report
    assert len(report["domain_breakdowns"]) >= 3

    # Test CSV stream export
    csv_res = client.get("/api/v1/tpo/naac-report/export-csv?cohort_id=cohort-cse-2026-a")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "attachment" in csv_res.headers["content-disposition"]
    assert "Student ID,Roll Number,Name" in csv_res.text
    assert "Aditya Verma" in csv_res.text


def test_proctoring_anomalies_audit_trail():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    # Query anomalies
    res = client.get("/api/v1/tpo/proctoring-anomalies?cohort_id=cohort-cse-2026-a")
    assert res.status_code == 200
    data = res.json()
    assert "anomalies" in data
    assert len(data["anomalies"]) >= 1

    # Create new anomaly log
    create_res = client.post("/api/v1/tpo/proctoring-anomalies", json={
        "student_name": "Kavya Nair",
        "cohort_id": "cohort-cse-2026-a",
        "session_id": "sess-live-test-881",
        "anomaly_type": "audio_chatter_detected",
        "severity": "high",
        "metadata": {"decibel_level": 74, "duration_seconds": 9}
    })
    assert create_res.status_code == 201
    anomaly_id = create_res.json()["anomaly"]["id"]

    # Resolve anomaly
    resolve_res = client.patch(f"/api/v1/tpo/proctoring-anomalies/{anomaly_id}/resolve")
    assert resolve_res.status_code == 200
    assert resolve_res.json()["anomaly"]["resolved"] is True

