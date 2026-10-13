import datetime
from typing import Optional, List
from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="corporate")
    logo: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    plan: Mapped[str] = mapped_column(String(64), default="Enterprise")
    seats_used: Mapped[int] = mapped_column(Integer, default=0)
    seats_total: Mapped[int] = mapped_column(Integer, default=25)
    status: Mapped[str] = mapped_column(String(32), default="active")
    
    # Enterprise SSO / SAML 2.0 / OIDC Configuration
    sso_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    sso_provider: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # okta, azure_ad, google
    sso_domain: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    idp_entity_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    idp_sso_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    idp_metadata_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    idp_certificate: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="organization")
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription", back_populates="organization"
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="student", nullable=False)
    org_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True
    )
    user_class: Mapped[str] = mapped_column(String(64), default="Fresher")
    college: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    experience_years: Mapped[float] = mapped_column(Float, default=0.0)
    readiness_score: Mapped[int] = mapped_column(Integer, default=70)
    current_tier: Mapped[str] = mapped_column(String(32), default="bridgeable")
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_skills_json: Mapped[str] = mapped_column(Text, default="[]")
    pipeline_status: Mapped[str] = mapped_column(String(32), default="applied", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="user")
    dispatched_sprints: Mapped[List["DispatchedSprint"]] = relationship(
        "DispatchedSprint", back_populates="candidate"
    )
    verified_credentials: Mapped[List["VerifiedCredential"]] = relationship(
        "VerifiedCredential", back_populates="candidate"
    )


class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(32), default="member")
    joined_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("org_id", "user_id", name="uq_org_user"),)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    plan_id: Mapped[str] = mapped_column(String(64), default="enterprise")
    status: Mapped[str] = mapped_column(String(32), default="active")
    seats_purchased: Mapped[int] = mapped_column(Integer, default=25)
    billing_cycle: Mapped[str] = mapped_column(String(32), default="monthly")
    provider: Mapped[str] = mapped_column(String(32), default="razorpay")
    provider_subscription_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    provider_payment_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    current_period_start: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    current_period_end: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    evaluations_used: Mapped[int] = mapped_column(Integer, default=0)
    evaluations_limit: Mapped[int] = mapped_column(Integer, default=25)
    active_jobs_limit: Mapped[int] = mapped_column(Integer, default=3)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="subscriptions")


class DispatchedSprint(Base):
    __tablename__ = "dispatched_sprints"

    dispatch_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_name: Mapped[str] = mapped_column(String(255), nullable=False)
    candidate_email: Mapped[str] = mapped_column(String(255), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    skill_name: Mapped[str] = mapped_column(String(255), nullable=False)
    org_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    job_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="dispatched", nullable=False)
    dispatched_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    credential_hash: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    invite_url: Mapped[str] = mapped_column(Text, nullable=False)

    candidate: Mapped["User"] = relationship("User", back_populates="dispatched_sprints")


class VerifiedCredential(Base):
    __tablename__ = "verified_credentials"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_email: Mapped[str] = mapped_column(String(255), nullable=False)
    skill_id: Mapped[str] = mapped_column(String(64), nullable=False)
    skill_name: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    passed_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    credential_hash: Mapped[str] = mapped_column(
        String(128), unique=True, index=True, nullable=False
    )
    canonical_payload: Mapped[str] = mapped_column(Text, nullable=False)
    issued_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    verification_url: Mapped[str] = mapped_column(Text, nullable=False)

    candidate: Mapped["User"] = relationship("User", back_populates="verified_credentials")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    weight: Mapped[float] = mapped_column(Float, default=3.0)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, default=20)
    correct_count: Mapped[int] = mapped_column(Integer, nullable=False)
    time_taken_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(32), nullable=False)
    badge_tier: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    answers_log_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="assessments")


class AtsResume(Base):
    __tablename__ = "ats_resumes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    parsed_json: Mapped[str] = mapped_column(Text, nullable=False)
    ats_score: Mapped[int] = mapped_column(Integer, default=85)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(255), default="Acme HyperScale Systems")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    type: Mapped[str] = mapped_column(String(64), default="Full-Time")
    experience_min_years: Mapped[float] = mapped_column(Float, default=0.0)
    salary_range: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pass_threshold: Mapped[int] = mapped_column(Integer, default=85)
    opening_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    application_deadline: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    critical_skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    optional_skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active")
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    saved_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("user_id", "job_id", name="uq_user_job"),)


class UserNotification(Base):
    __tablename__ = "user_notifications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(
        String(64), default="deadline_warning", nullable=False
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    trigger_date: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id", "job_id", "notification_type", "trigger_date", name="uq_user_notification"
        ),
    )


class PipelineStageChange(Base):
    __tablename__ = "pipeline_stage_changes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    org_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    from_stage: Mapped[str] = mapped_column(String(32), default="applied", nullable=False)
    to_stage: Mapped[str] = mapped_column(String(32), nullable=False)
    changed_by_user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )


class CandidateScorecard(Base):
    __tablename__ = "candidate_scorecards"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    org_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    reviewer_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    overall_recommendation: Mapped[str] = mapped_column(
        String(32), default="hire", nullable=False
    )  # 'strong_hire', 'hire', 'neutral', 'reject'
    technical_rating: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    communication_rating: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    problem_solving_rating: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    culture_add_rating: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    feedback_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("candidate_id", "org_id", "reviewer_id", name="uq_candidate_scorecard_reviewer"),
    )


class RecruiterNote(Base):
    __tablename__ = "recruiter_notes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    org_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    author_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    note_content: Mapped[str] = mapped_column(Text, nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )


class AtsWebhookSubscription(Base):
    __tablename__ = "ats_webhook_subscriptions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    target_url: Mapped[str] = mapped_column(String(500), nullable=False)
    secret_key: Mapped[str] = mapped_column(String(128), nullable=False)
    event_types: Mapped[str] = mapped_column(
        Text, default="[\"candidate.shortlisted\", \"scorecard.submitted\", \"credential.minted\", \"interview.panel_evaluated\"]", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )


class AtsWebhookDelivery(Base):
    __tablename__ = "ats_webhook_deliveries"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    subscription_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("ats_webhook_subscriptions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    response_status: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    delivered_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Cohort(Base):
    __tablename__ = "cohorts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    org_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(128), default="Computer Science & Engineering", nullable=False)
    graduation_year: Mapped[int] = mapped_column(Integer, default=2026, nullable=False)
    target_role: Mapped[str] = mapped_column(String(128), default="Full Stack Software Engineer", nullable=False)
    student_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mean_readiness_score: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    students: Mapped[List["CohortStudent"]] = relationship("CohortStudent", back_populates="cohort", cascade="all, delete-orphan")
    dispatches: Mapped[List["BatchDispatch"]] = relationship("BatchDispatch", back_populates="cohort", cascade="all, delete-orphan")


class CohortStudent(Base):
    __tablename__ = "cohort_students"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    cohort_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("cohorts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    roll_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    student_email: Mapped[str] = mapped_column(String(255), nullable=False)
    current_readiness: Mapped[int] = mapped_column(Integer, default=70, nullable=False)
    baseline_readiness: Mapped[int] = mapped_column(Integer, default=55, nullable=False)
    current_tier: Mapped[str] = mapped_column(String(32), default="bridgeable", nullable=False)
    deficit_skills_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    enrolled_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )

    # Relationship
    cohort: Mapped["Cohort"] = relationship("Cohort", back_populates="students")


class BatchDispatch(Base):
    __tablename__ = "batch_dispatches"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    cohort_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("cohorts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    dispatched_by: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    dispatch_type: Mapped[str] = mapped_column(String(32), default="gap_sprint", nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    target_skill: Mapped[str] = mapped_column(String(64), nullable=False)
    deadline_hours: Mapped[int] = mapped_column(Integer, default=48, nullable=False)
    total_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_students: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    mean_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationship
    cohort: Mapped["Cohort"] = relationship("Cohort", back_populates="dispatches")


class ProctoringAnomalyLog(Base):
    __tablename__ = "proctoring_anomaly_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    student_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    student_name: Mapped[str] = mapped_column(String(255), nullable=False)
    cohort_id: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    session_id: Mapped[str] = mapped_column(String(64), nullable=False)
    anomaly_type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(32), default="medium", nullable=False)
    metadata_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    recorded_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=func.now(), nullable=False
    )


