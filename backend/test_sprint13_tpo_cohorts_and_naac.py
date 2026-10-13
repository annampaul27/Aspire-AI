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
