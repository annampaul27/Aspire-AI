# Institutional TPO Admin Suite, Batch Cohorts & NAAC Accreditation Reporting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the university Training & Placement Officer (TPO) administration suite, supporting student cohort management, 1-click batch sprint/assessment dispatches, automated NAAC Criterion 5 accreditation intelligence with CSV export, and client-side proctoring anomaly audits.

**Architecture:** Extend SQLAlchemy 2.0 relational schema with `Cohort`, `CohortStudent`, `BatchDispatch`, and `ProctoringAnomalyLog` models. Implement FastAPI REST endpoints (`/api/v1/tpo/*`) computing cohort statistics, dispatching gap remediation in batch, and compiling NAAC Criterion 5.1 & 5.2 metrics. Build typed TypeScript client (`tpo.ts`) and React UI components in the Academic Admin portal (`/admin`) with interactive cohort rosters, 1-click batch dispatch modals, NAAC metric cards, and real-time proctoring anomaly radar.

**Tech Stack:** Python 3.11, FastAPI 0.115, SQLAlchemy 2.0, Next.js 16 (Turbopack), TypeScript 5.6, Tailwind CSS, Lucide React, Pytest.

---

### Task 1: Relational Schema & Seeder for Academic Cohorts, Batch Dispatches & Anomalies

**Files:**
- Modify: `backend/app/models/entities.py:380-435`
- Modify: `backend/app/db/seed.py:200-249`
- Test: `backend/test_sprint13_tpo_cohorts_and_naac.py`

**Step 1: Write the failing integration test**
Create `backend/test_sprint13_tpo_cohorts_and_naac.py` verifying model definitions and seed records:
```python
import pytest
from app.db.session import SessionLocal
from app.models.entities import Cohort, CohortStudent, BatchDispatch, ProctoringAnomalyLog

def test_tpo_models_and_relationships():
    db = SessionLocal()
    try:
        cohort = db.query(Cohort).filter(Cohort.id == "cohort-cse-2026-a").first()
        assert cohort is not None
        assert cohort.name == "B.Tech Computer Science 2026 - Section A"
        assert cohort.department == "Computer Science & Engineering"
        assert cohort.graduation_year == 2026
        assert cohort.student_count >= 20
        
        # Test CohortStudents
        students = db.query(CohortStudent).filter(CohortStudent.cohort_id == cohort.id).all()
        assert len(students) > 0
        assert any(s.roll_number == "CS26-001" for s in students)
        
        # Test BatchDispatch
        dispatch = db.query(BatchDispatch).filter(BatchDispatch.cohort_id == cohort.id).first()
        assert dispatch is not None
        assert dispatch.dispatch_type in ["gap_sprint", "mock_assessment"]
        assert dispatch.completion_rate >= 0.0
    finally:
        db.close()
```

**Step 2: Run test to verify it fails**
Run: `python -m pytest backend/test_sprint13_tpo_cohorts_and_naac.py -v`
Expected: FAIL with `ImportError: cannot import name 'Cohort'`

**Step 3: Write minimal implementation in `entities.py` and `seed.py`**
- Add `Cohort`, `CohortStudent`, `BatchDispatch`, `ProctoringAnomalyLog` to `backend/app/models/entities.py`.
- Seed university cohort `"cohort-cse-2026-a"`, 25 enrolled students with roll numbers and readiness scores, a sample batch dispatch, and 3 proctoring anomalies in `backend/app/db/seed.py`.

**Step 4: Run test to verify it passes**
Run: `python -m pytest backend/test_sprint13_tpo_cohorts_and_naac.py -v`
Expected: PASS

**Step 5: Commit**
`git add backend/app/models/entities.py backend/app/db/seed.py backend/test_sprint13_tpo_cohorts_and_naac.py`
`git commit -m "feat(tpo): add relational models and seed data for cohorts, dispatches and anomalies"`

---

### Task 2: Backend TPO Cohort Management & Batch Dispatch Engine

**Files:**
- Create: `backend/app/api/v1/tpo.py`
- Modify: `backend/app/main.py:100-140`
- Test: `backend/test_sprint13_tpo_cohorts_and_naac.py`

**Step 1: Write the failing test**
In `backend/test_sprint13_tpo_cohorts_and_naac.py`:
```python
def test_cohorts_listing_and_creation(client):
    res = client.get("/api/v1/tpo/cohorts?org_id=org-apex-univ")
    assert res.status_code == 200
    data = res.json()
    assert "cohorts" in data
    assert len(data["cohorts"]) >= 1
    
    # Test batch dispatch
    dispatch_res = client.post("/api/v1/tpo/batch-dispatch", json={
        "cohort_id": "cohort-cse-2026-a",
        "dispatch_type": "gap_sprint",
        "title": "Distributed Caching & Redis Idempotency 48h Sprint",
        "target_skill": "Distributed Systems",
        "deadline_hours": 48
    })
    assert dispatch_res.status_code == 201
    dispatch_data = dispatch_res.json()
    assert dispatch_data["success"] is True
    assert dispatch_data["dispatch"]["total_students"] >= 20
```

**Step 2: Run test to verify it fails**
Run: `python -m pytest backend/test_sprint13_tpo_cohorts_and_naac.py::test_cohorts_listing_and_creation -v`
Expected: FAIL with `404 Not Found`

**Step 3: Write minimal implementation in `backend/app/api/v1/tpo.py`**
- Implement `GET /api/v1/tpo/cohorts` (returns list with average readiness, total students, and deficit breakdown).
- Implement `POST /api/v1/tpo/cohorts` (creates new cohort).
- Implement `GET /api/v1/tpo/cohorts/{cohort_id}` (returns cohort detail with roster).
- Implement `POST /api/v1/tpo/batch-dispatch` (creates `BatchDispatch` and triggers candidate notifications for each enrolled student).
- Implement `GET /api/v1/tpo/batch-dispatches` (lists active and historical batch dispatches).
- Mount router in `backend/app/main.py`.

**Step 4: Run test to verify it passes**
Run: `python -m pytest backend/test_sprint13_tpo_cohorts_and_naac.py -v`
Expected: PASS

**Step 5: Commit**
`git add backend/app/api/v1/tpo.py backend/app/main.py backend/test_sprint13_tpo_cohorts_and_naac.py`
`git commit -m "feat(tpo): implement cohort management and 1-click batch dispatch endpoints"`

---

### Task 3: NAAC Criterion 5 Accreditation Intelligence Engine & CSV Stream Export

**Files:**
- Modify: `backend/app/api/v1/tpo.py`
- Test: `backend/test_sprint13_tpo_cohorts_and_naac.py`

**Step 1: Write the failing test**
In `backend/test_sprint13_tpo_cohorts_and_naac.py`:
```python
def test_naac_accreditation_report_and_csv_export(client):
    # Test JSON NAAC report
    res = client.get("/api/v1/tpo/naac-report?cohort_id=cohort-cse-2026-a")
    assert res.status_code == 200
    report = res.json()
    assert report["criterion"] == "NAAC Criterion 5.1.3 & 5.2.1"
    assert "competency_growth_percentage" in report
    assert report["competency_growth_percentage"] > 0
    assert "deficit_remediation_rate" in report
    assert "tier_distribution" in report
    assert "job_ready_count" in report["tier_distribution"]
    
    # Test CSV stream export
    csv_res = client.get("/api/v1/tpo/naac-report/export-csv?cohort_id=cohort-cse-2026-a")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Student ID,Roll Number,Name" in csv_res.text
```

**Step 2: Run test to verify it fails**
Run: `python -m pytest backend/test_sprint13_tpo_cohorts_and_naac.py::test_naac_accreditation_report_and_csv_export -v`
Expected: FAIL with `404 Not Found`

**Step 3: Implement NAAC intelligence calculation and CSV streamer**
- Compute baseline vs current readiness to yield authentic `competency_growth_percentage` (e.g., +28.4%).
- Calculate deficit remediation closure rate (% of students who improved readiness from <70 to >=70).
- Categorize students into Job-Ready (>=85%), Bridgeable (70-84%), Developing (<70%).
- Break down competency areas: Algorithms, Distributed Systems, Database, Communication.
- Implement `GET /api/v1/tpo/naac-report/export-csv` returning standard CSV stream attachment formatted for academic auditors.
- Add proctoring anomaly endpoints: `GET /api/v1/tpo/proctoring-anomalies` and `POST /api/v1/tpo/proctoring-anomalies`.

**Step 4: Run test to verify it passes**
Run: `python -m pytest backend/test_sprint13_tpo_cohorts_and_naac.py -v`
Expected: PASS

**Step 5: Commit**
`git add backend/app/api/v1/tpo.py backend/test_sprint13_tpo_cohorts_and_naac.py`
`git commit -m "feat(tpo): implement naac criterion 5 accreditation metrics and csv export"`

---

### Task 4: Frontend TPO API Client and TypeScript Types

**Files:**
- Modify: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/api/tpo.ts`
- Modify: `frontend/src/lib/api/index.ts`

**Step 1: Declare TypeScript contracts in `frontend/src/types/index.ts`**
- `Cohort`, `CohortStudent`, `BatchDispatch`, `NaacAccreditationReport`, `ProctoringAnomalyRecord`.

**Step 2: Implement `frontend/src/lib/api/tpo.ts`**
- `listCohorts`, `getCohortDetails`, `createCohort`, `batchDispatch`, `listBatchDispatches`, `getNaacReport`, `downloadNaacCsv`, `listProctoringAnomalies`, `reportAnomaly`.
- Export from `frontend/src/lib/api/index.ts`.

**Step 3: Verify TypeScript typing**
Run: `npx tsc --noEmit` in `frontend/`.
Expected: 0 errors.

**Step 4: Commit**
`git add frontend/src/types/index.ts frontend/src/lib/api/tpo.ts frontend/src/lib/api/index.ts`
`git commit -m "feat(frontend): add tpo academic client and typescript type definitions"`

---

### Task 5: Academic Admin Portal TPO UI Components & Tab Navigation

**Files:**
- Create: `frontend/src/components/admin/CohortBatchManager.tsx`
- Create: `frontend/src/components/admin/NaacAccreditationCard.tsx`
- Modify: `frontend/src/app/admin/page.tsx`

**Step 1: Build `CohortBatchManager.tsx`**
- Cohort list cards with average readiness score, student count, and target role.
- Roster drawer/modal showing students, roll numbers, status, and deficits.
- "1-Click Batch Dispatch" modal to dispatch gap sprints or assessments with title, skill target, and deadline.
- Active batch dispatch progress indicators with completion percentages.

**Step 2: Build `NaacAccreditationCard.tsx`**
- NAAC Criterion 5.1 & 5.2 Header with university accreditation badges.
- Metric cards: Competency Growth Uplift (+%), Deficit Remediation Closure Rate (%), Job-Ready Rate.
- Tier Distribution breakdown bar (Job-Ready vs Bridgeable vs Developing).
- Programmatic Competency radars/bars (Algorithms, Systems, DB, Soft Skills).
- "Export Official NAAC CSV Report" download button triggering direct CSV download.

**Step 3: Mount tabs in `frontend/src/app/admin/page.tsx`**
- Add tabs: "Cohorts & Batch Dispatch" (Users icon) and "NAAC Accreditation" (GraduationCap icon).
- Render `CohortBatchManager` and `NaacAccreditationCard`.

**Step 4: Run validation tools**
Run: `npx tsc --noEmit` and `npm run lint` in `frontend/`.
Expected: 0 errors, 0 warnings.

**Step 5: Commit**
`git add frontend/src/components/admin/CohortBatchManager.tsx frontend/src/components/admin/NaacAccreditationCard.tsx frontend/src/app/admin/page.tsx`
`git commit -m "feat(admin): add cohort batch manager and naac accreditation components"`

---

### Task 6: Full Regression Verification, Documentation & Remote Push

**Files:**
- Modify: `README.md`
- Modify: `MANUAL_TESTING_GUIDE.txt`

**Step 1: Run full Pytest regression suite**
Run: `python -m pytest backend/ services/ -v`
Expected: 165+ tests passing (100% pass rate).

**Step 2: Run Ruff lint**
Run: `ruff check backend/ services/`
Expected: All checks passed!

**Step 3: Run Next.js production build**
Run: `npm run build` in `frontend/`
Expected: 18+ routes compiled cleanly.

**Step 4: Update Documentation**
- Add Sprint 13 deliverables and architecture breakdown in `README.md`.
- Add Section 13/14 manual QA test scenarios in `MANUAL_TESTING_GUIDE.txt`.
- Update badges and contributor table.

**Step 5: Commit and Push**
`git add README.md MANUAL_TESTING_GUIDE.txt docs/plans/`
`git commit -m "docs(sprint13): document institutional tpo suite, batch cohorts and naac accreditation"`
`git push -u origin feat/sprint-13-institutional-tpo-admin-batch-cohorts-and-naac-reporting`
