from pydantic import BaseModel, Field

class WorkExperience(BaseModel):
    company: str = Field(description="Name of the company or employer")
    title: str = Field(description="Job title or role")
    start_date: str = Field(description="Start date of employment (e.g., Jan 2023)")
    end_date: str | None = Field(default=None, description="End date of employment or 'Present'")
    bullet_points: list[str] = Field(default_factory=list, description="List of responsibilities, achievements, or bullet points")

class ResumeSchema(BaseModel):
    name: str = Field(default="Candidate", description="Full candidate name")
    email: str | None = None
    phone: str | None = None
    location: str | None = "Bengaluru, India"
    college: str | None = None
    work_experience: list[WorkExperience] = Field(default_factory=list)
    education: list[dict] = Field(default_factory=list, description="Education history")
    projects: list[dict] = Field(default_factory=list, description="Personal or academic projects")
    skills: list[str] = Field(default_factory=list, description="Normalized list of extracted skills.")
    summary: str = Field(default="", description="A brief professional summary.")
    github_url: str | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    experience_years: float | None = 0.0
    user_class: str | None = Field(default="Experienced", description="Fresher or Experienced")

class JDSchema(BaseModel):
    job_title: str = Field(default="Software Engineer", description="Title of the job role")
    mandatory_skills: list[str] = Field(default_factory=list, description="Must-have critical skills (weight=3.0)")
    nice_to_have_skills: list[str] = Field(default_factory=list, description="Optional skills (weight=1.0)")
    years_of_experience_required: int | None = Field(default=0, description="Years of experience required")
    description_summary: str = Field(default="", description="A brief summary of the job role.")

class ComparisonResultSchema(BaseModel):
    match_score: float = Field(description="Weighted percentage match score (0-100%)")
    matched_skills: list[str] = Field(default_factory=list, description="Intersection of resume skills and JD mandatory skills")
    missing_skills: list[str] = Field(default_factory=list, description="JD mandatory skills minus resume skills")
    bonus_skills: list[str] = Field(default_factory=list, description="Resume skills not found in the JD")
    tier: str = Field(default="mismatch", description="Job-Ready (>=85%), Bridgeable (60-84%), Mismatch (<60%)")

class JDRequest(BaseModel):
    raw_text: str

class QueryRequest(BaseModel):
    query_text: str
    n_results: int = 5
