from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.models.entities import (
    Base, Organization, User, Subscription,
    Cohort, CohortStudent, BatchDispatch, ProctoringAnomalyLog,
)
from app.core.security import get_password_hash

DEFAULT_HASHED_PASSWORD = get_password_hash("AspireAI@2026")

def seed_database_defaults(db: Session = None):
    """
    Seeds initial enterprise multi-tenant organizations, users, and subscriptions
    into the relational database if not already seeded.
    """
    # Ensure all relational tables exist before querying or seeding
    Base.metadata.create_all(bind=engine)

    # Ensure password_hash, org_id, and pipeline_status exist on users table for existing SQLite databases
    with engine.begin() as conn:
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(conn)
            if "users" in inspector.get_table_names():
                cols = [c["name"] for c in inspector.get_columns("users")]
                if "password_hash" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
                if "org_id" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN org_id VARCHAR(64)"))
                if "pipeline_status" not in cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN pipeline_status VARCHAR(32) DEFAULT 'applied'"))

            if "subscriptions" in inspector.get_table_names():
                sub_cols = [c["name"] for c in inspector.get_columns("subscriptions")]
                sub_additions = [
                    ("user_id", "VARCHAR(64)"),
                    ("provider", "VARCHAR(32) DEFAULT 'razorpay'"),
                    ("provider_subscription_id", "VARCHAR(128)"),
                    ("provider_payment_id", "VARCHAR(128)"),
                    ("current_period_start", "DATETIME"),
                    ("current_period_end", "DATETIME"),
                    ("evaluations_used", "INTEGER DEFAULT 0"),
                    ("evaluations_limit", "INTEGER DEFAULT 25"),
                    ("active_jobs_limit", "INTEGER DEFAULT 3"),
                ]
                for col_name, col_type in sub_additions:
                    if col_name not in sub_cols:
                        conn.execute(text(f"ALTER TABLE subscriptions ADD COLUMN {col_name} {col_type}"))
                conn.execute(text("UPDATE subscriptions SET active_jobs_limit = -1, evaluations_limit = -1 WHERE plan_id = 'enterprise'"))
                conn.execute(text("UPDATE subscriptions SET active_jobs_limit = 10, evaluations_limit = 250 WHERE plan_id = 'growth'"))

            if "organizations" in inspector.get_table_names():
                org_cols = [c["name"] for c in inspector.get_columns("organizations")]
                org_additions = [
                    ("sso_enabled", "BOOLEAN DEFAULT 0"),
                    ("sso_provider", "VARCHAR(64) DEFAULT 'okta'"),
                    ("sso_domain", "VARCHAR(128)"),
                    ("idp_entity_id", "VARCHAR(255)"),
                    ("idp_sso_url", "VARCHAR(500)"),
                    ("idp_metadata_url", "VARCHAR(500)"),
                    ("idp_certificate", "TEXT"),
                ]
                for col_name, col_type in org_additions:
                    if col_name not in org_cols:
                        conn.execute(text(f"ALTER TABLE organizations ADD COLUMN {col_name} {col_type}"))
                conn.execute(text("UPDATE organizations SET sso_enabled = 1, sso_provider = 'okta', sso_domain = 'acme.com', idp_entity_id = 'https://identity.acme.com', idp_sso_url = 'https://acme.okta.com/app/aspire/sso/saml' WHERE id = 'org-acme' AND (sso_domain IS NULL OR sso_domain = '')"))
        except Exception:
            pass

    close_at_end = False
    if db is None:
        db = SessionLocal()
        close_at_end = True

    try:
        # 1. Seed Organizations
        if db.query(Organization).count() == 0:
            orgs = [
                Organization(
                    id="org-acme",
                    name="Acme HyperScale Systems",
                    type="corporate",
                    logo="⚡",
                    plan="Enterprise",
                    seats_used=14,
                    seats_total=25,
                    status="active",
                    sso_enabled=True,
                    sso_provider="okta",
                    sso_domain="acme.com",
                    idp_entity_id="https://identity.acme.com",
                    idp_sso_url="https://acme.okta.com/app/aspire/sso/saml",
                ),
                Organization(
                    id="org-apex-univ",
                    name="Apex National Institute of Technology",
                    type="university",
                    logo="🎓",
                    plan="Academic Pass",
                    seats_used=8,
                    seats_total=10,
                    status="active",
                ),
                Organization(
                    id="org-talentbridge",
                    name="TalentBridge Staffing Partners",
                    type="staffing",
                    logo="🌐",
                    plan="Growth",
                    seats_used=6,
                    seats_total=10,
                    status="active",
                ),
            ]
            db.add_all(orgs)
            db.commit()

        # 2. Seed Subscriptions
        if db.query(Subscription).count() == 0:
            subs = [
                Subscription(
                    id="sub-acme-ent",
                    org_id="org-acme",
                    plan_id="enterprise",
                    status="active",
                    seats_purchased=25,
                    billing_cycle="annual",
                    active_jobs_limit=-1,
                    evaluations_limit=-1,
                    evaluations_used=0,
                ),
                Subscription(
                    id="sub-apex-acad",
                    org_id="org-apex-univ",
                    plan_id="academic",
                    status="active",
                    seats_purchased=10,
                    billing_cycle="annual",
                    active_jobs_limit=5,
                    evaluations_limit=100,
                    evaluations_used=0,
                ),
                Subscription(
                    id="sub-talentbridge-growth",
                    org_id="org-talentbridge",
                    plan_id="growth",
                    status="active",
                    seats_purchased=10,
                    billing_cycle="monthly",
                    active_jobs_limit=10,
                    evaluations_limit=250,
                    evaluations_used=0,
                ),
            ]
            db.add_all(subs)
            db.commit()

        # 3. Seed Users with password hashes and roles
        users_to_seed = [
            {
                "id": "usr-recruiter-01",
                "email": "priya.sharma@acme.com",
                "full_name": "Priya Sharma",
                "role": "employer",
                "org_id": "org-acme",
                "user_class": "Lead Recruiter",
                "password_hash": DEFAULT_HASHED_PASSWORD,
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            },
            {
                "id": "usr-recruiter-02",
                "email": "rohit.mehta@acme.com",
                "full_name": "Rohit Mehta",
                "role": "employer",
                "org_id": "org-acme",
                "user_class": "Technical Hiring Manager",
                "password_hash": DEFAULT_HASHED_PASSWORD,
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            },
            {
                "id": "usr-recruiter-tb",
                "email": "sarah.connor@talentbridge.com",
                "full_name": "Sarah Connor",
                "role": "employer",
                "org_id": "org-talentbridge",
                "user_class": "Staffing Partner",
                "password_hash": DEFAULT_HASHED_PASSWORD,
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            },
            {
                "id": "cand-1",
                "email": "aditya.verma@example.com",
                "full_name": "Aditya Verma",
                "role": "student",
                "org_id": None,
                "user_class": "Experienced",
                "college": "Indian Institute of Information Technology (IIIT)",
                "experience_years": 2.5,
                "readiness_score": 78,
                "current_tier": "bridgeable",
                "password_hash": DEFAULT_HASHED_PASSWORD,
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "verified_skills_json": '["Python", "SQL", "AWS", "Docker"]',
            },
            {
                "id": "cand-2",
                "email": "pooja.s@example.com",
                "full_name": "Pooja Sundaram",
                "role": "student",
                "org_id": None,
                "user_class": "Fresher",
                "college": "National Institute of Technology (NIT) Trichy",
                "experience_years": 0.0,
                "readiness_score": 91,
                "current_tier": "job_ready",
                "password_hash": DEFAULT_HASHED_PASSWORD,
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "verified_skills_json": '["React", "TypeScript", "Next.js"]',
            },
            {
                "id": "usr-superuser-root",
                "email": "root@aspire.ai",
                "full_name": "Platform Superuser",
                "role": "admin",
                "org_id": None,
                "user_class": "Administrator",
                "password_hash": DEFAULT_HASHED_PASSWORD,
                "avatar_url": None,
            },
        ]

        for u_data in users_to_seed:
            existing = db.query(User).filter((User.email == u_data["email"]) | (User.id == u_data["id"])).first()
            if not existing:
                db.add(User(**u_data))
            else:
                existing.email = u_data["email"]
                existing.password_hash = u_data["password_hash"]
                if u_data.get("org_id"):
                    existing.org_id = u_data["org_id"]
        db.commit()

        # 3. Seed University Cohorts (Sprint 13)
        cohort_id = "cohort-cse-2026-a"
        existing_cohort = db.query(Cohort).filter(Cohort.id == cohort_id).first()
        if not existing_cohort:
            cohort = Cohort(
                id=cohort_id,
                org_id="org-apex-univ",
                name="B.Tech Computer Science 2026 - Section A",
                department="Computer Science & Engineering",
                graduation_year=2026,
                target_role="Full Stack Software Engineer",
                student_count=20,
                mean_readiness_score=75.6,
            )
            db.add(cohort)
            db.commit()

            # Seed 20 Cohort Students
            sample_roster = [
                ("cand-1", "CS26-001", "Aditya Verma", "aditya.verma@example.com", 74, 52, "bridgeable", '["Redis Caching", "Docker Containerization"]'),
                ("cand-2", "CS26-002", "Pooja Sharma", "pooja.s@example.com", 91, 72, "job_ready", "[]"),
                (None, "CS26-003", "Rohit Mehta", "rohit.m@example.com", 82, 60, "bridgeable", '["System Design"]'),
                (None, "CS26-004", "Kavya Nair", "kavya.nair@example.com", 88, 65, "job_ready", "[]"),
                (None, "CS26-005", "Rahul Deshmukh", "rahul.d@example.com", 68, 50, "developing", '["FastAPI", "SQL Indexing"]'),
                (None, "CS26-006", "Sneha Patel", "sneha.p@example.com", 85, 68, "job_ready", "[]"),
                (None, "CS26-007", "Rohan Iyer", "rohan.i@example.com", 76, 55, "bridgeable", '["AWS Cloud"]'),
                (None, "CS26-008", "Divya Menon", "divya.m@example.com", 92, 70, "job_ready", "[]"),
                (None, "CS26-009", "Aravind Swaminathan", "aravind.s@example.com", 64, 48, "developing", '["Data Structures", "Algorithms"]'),
                (None, "CS26-010", "Meera Krishnan", "meera.k@example.com", 80, 58, "bridgeable", '["Async Python"]'),
                (None, "CS26-011", "Gaurav Joshi", "gaurav.j@example.com", 71, 52, "bridgeable", '["PostgreSQL"]'),
                (None, "CS26-012", "Ananya Rao", "ananya.r@example.com", 86, 64, "job_ready", "[]"),
                (None, "CS26-013", "Vikram Malhotra", "vikram.m@example.com", 67, 45, "developing", '["TypeScript", "React"]'),
                (None, "CS26-014", "Ishaan Kapoor", "ishaan.k@example.com", 78, 56, "bridgeable", '["Kafka Queues"]'),
                (None, "CS26-015", "Tanvi Sengupta", "tanvi.s@example.com", 89, 69, "job_ready", "[]"),
                (None, "CS26-016", "Karan Singhania", "karan.s@example.com", 62, 42, "developing", '["REST API Design"]'),
                (None, "CS26-017", "Riya Chakraborty", "riya.c@example.com", 84, 63, "bridgeable", '["Microservices"]'),
                (None, "CS26-018", "Aman Gupta", "aman.g@example.com", 75, 54, "bridgeable", '["Docker Compose"]'),
                (None, "CS26-019", "Shreya Bhat", "shreya.b@example.com", 90, 71, "job_ready", "[]"),
                (None, "CS26-020", "Manish Pandey", "manish.p@example.com", 69, 51, "developing", '["Testing & CI/CD"]'),
            ]
            for uid, rnum, sname, semail, curr_r, base_r, tier, defs in sample_roster:
                db.add(CohortStudent(
                    id=f"cs-{cohort_id}-{rnum}",
                    cohort_id=cohort_id,
                    user_id=uid,
                    roll_number=rnum,
                    student_name=sname,
                    student_email=semail,
                    current_readiness=curr_r,
                    baseline_readiness=base_r,
                    current_tier=tier,
                    deficit_skills_json=defs,
                ))
            db.commit()

        # Seed sample Batch Dispatch
        dispatch_id = "dispatch-sprint-01"
        existing_dispatch = db.query(BatchDispatch).filter(BatchDispatch.id == dispatch_id).first()
        if not existing_dispatch:
            db.add(BatchDispatch(
                id=dispatch_id,
                cohort_id=cohort_id,
                dispatched_by="usr-superuser-root",
                dispatch_type="gap_sprint",
                title="Distributed Caching & Redis Idempotency 48h Sprint",
                target_skill="Distributed Systems",
                deadline_hours=48,
                total_students=20,
                completed_students=16,
                completion_rate=80.0,
                mean_score=82.5,
                status="active",
            ))
            db.commit()

        # Seed sample Proctoring Anomalies
        if db.query(ProctoringAnomalyLog).count() == 0:
            anomalies = [
                ProctoringAnomalyLog(
                    id="anom-01",
                    student_id="cand-1",
                    student_name="Aditya Verma",
                    cohort_id=cohort_id,
                    session_id="sess-sprint-982",
                    anomaly_type="tab_switch",
                    severity="medium",
                    metadata_json='{"blur_duration_seconds": 14, "switched_to": "external_browser"}',
                    resolved=False,
                ),
                ProctoringAnomalyLog(
                    id="anom-02",
                    student_id="cand-2",
                    student_name="Pooja Sharma",
                    cohort_id=cohort_id,
                    session_id="sess-exam-419",
                    anomaly_type="rapid_submission",
                    severity="low",
                    metadata_json='{"time_taken_seconds": 38, "expected_min_seconds": 120}',
                    resolved=True,
                ),
                ProctoringAnomalyLog(
                    id="anom-03",
                    student_id=None,
                    student_name="Rahul Deshmukh",
                    cohort_id=cohort_id,
                    session_id="sess-sandbox-102",
                    anomaly_type="multiple_faces_detected",
                    severity="critical",
                    metadata_json='{"face_count": 2, "confidence": 0.94}',
                    resolved=False,
                ),
            ]
            for a in anomalies:
                db.add(a)
            db.commit()

    finally:
        if close_at_end:
            db.close()

if __name__ == "__main__":
    seed_database_defaults()
    print("Database seeding completed.")
