export type ReadinessTier = "job_ready" | "bridgeable" | "mismatch";

export type RoleType = "employer" | "student" | "admin";

export type OrgType = "corporate" | "staffing" | "university";

export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  logo: string;
  plan: "Starter" | "Growth" | "Enterprise" | "Academic Pass";
  seatsUsed: number;
  seatsTotal: number;
  status: "active" | "trial" | "suspended";
  createdDate: string;
  metrics: {
    candidatesScreened: number;
    hoursSaved: number;
    bridgeableHired: number;
    gapSprintsCompleted: number;
  };
}

export interface SkillNode {
  id: string;
  name: string;
  category: "frontend" | "backend" | "devops" | "data_ai" | "core";
  weight: number; // 3.0 for Critical / Must-have, 1.0 for Optional
  isCritical: boolean;
  synonyms?: string[];
  description?: string;
}

export interface CandidateSkill {
  skillId: string;
  skillName: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isVerified: boolean; // Assessment passed S10
  credentialHash?: string;
  verifiedAt?: string;
  score?: number;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  bulletPoints: string[];
}

export interface Candidate {
  id: string;
  fullName: string;
  anonymizedId: string; // e.g. "Candidate #8492" (E17)
  email: string;
  college: string;
  anonymizedCollege: string; // "Tier-1 Technical Institute"
  gradYear: number;
  avatarUrl: string;
  targetRole: string;
  currentTier: ReadinessTier;
  readinessScore: number; // 0 - 100%
  skills: CandidateSkill[];
  missingCompetencies: string[]; // Discrete missing competencies
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  experienceYears: number;
  workExperience?: WorkExperience[];
  projects: {
    title: string;
    description: string;
    tech: string[];
    link?: string;
  }[];
  pipelineStatus: "applied" | "screened" | "shortlisted" | "interview" | "offer";
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string;
  }[];
  credentials: ProofOfWorkCredential[];
  sprintAssigned?: {
    skillId: string;
    skillName: string;
    dispatchedAt: string;
    status: "pending" | "in_progress" | "passed";
  };
}

export interface JobOpening {
  id: string;
  orgId: string;
  title: string;
  department: string;
  location: string;
  type: "Full-Time" | "Remote" | "Contract";
  experienceMinYears: number;
  salaryRange: string;
  criticalSkills: SkillNode[]; // weight = 3.0
  optionalSkills: SkillNode[]; // weight = 1.0
  description: string;
  applicantsCount: number;
  status: "active" | "paused" | "under_review";
  passThreshold: number; // e.g. 85%
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanations: string[]; // Explanation for each option
  difficulty: "intermediate" | "advanced";
  conceptTag: string;
}

export interface MicroSprintData {
  skillId: string;
  skillName: string;
  estimatedMinutes: number;
  sponsorOrgName?: string;
  part1Concept: {
    title: string;
    summary: string;
    mentalModel: string[];
    keyTakeaway: string;
  };
  part2Scenario: {
    title: string;
    incidentDescription: string;
    brokenCodeSnippet: string;
    rootCause: string;
    remediationCodeSnippet: string;
    keyTakeaways: string[];
  };
  part3Questions: QuizQuestion[];
}

export interface ProofOfWorkCredential {
  hash: string; // SHA-256
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  skillId: string;
  skillName: string;
  score: number; // >= 80%
  passedQuestions: number;
  totalQuestions: number;
  issuedAt: string;
  issuerOrg: string;
  isSponsored: boolean;
  sponsorOrg?: string;
  canonicalPayload: string; // Raw canonicalized JSON string that hashes to `hash`
  answersLog: {
    questionId: string;
    question: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }[];
  antiCheatAudit: {
    tabBlurEvents: number;
    flagged: boolean;
  };
}

export interface AnomalyLog {
  id: string;
  type: "Rapid-fire Assessment" | "Tab-blur Threshold Exceeded" | "Volume Spike" | "Sponsor Conflict";
  description: string;
  candidateName?: string;
  orgName?: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
}

export interface UserNotification {
  id: string;
  user_id: string;
  job_id: string;
  job_title?: string;
  company?: string;
  message: string;
  notification_type: "deadline_warning" | "opening_warning" | "job_match" | string;
  is_read: boolean;
  trigger_date: string;
  application_deadline?: string;
  opening_date?: string;
  location?: string;
  created_at: string;
}

export interface CandidateScorecard {
  id: string;
  candidate_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  overall_recommendation: "strong_hire" | "hire" | "neutral" | "reject";
  technical_rating: number; // 1-5
  communication_rating: number; // 1-5
  problem_solving_rating: number; // 1-5
  culture_add_rating: number; // 1-5
  feedback_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ScorecardSummary {
  total_reviews: number;
  avg_technical: number;
  avg_communication: number;
  avg_problem_solving: number;
  avg_culture_add: number;
  composite_score: number;
  recommendation_breakdown: {
    strong_hire: number;
    hire: number;
    neutral: number;
    reject: number;
  };
  consensus: "consensus_hire" | "consensus_reject" | "mixed_reviews" | "pending_evaluations";
}

export interface RecruiterNote {
  id: string;
  candidate_id: string;
  author_id: string;
  author_name: string;
  note_content: string;
  is_private: boolean;
  created_at: string;
}

export interface CollaboratorPresence {
  user_id: string;
  full_name: string;
  role: string;
  email?: string;
  connected_at: string;
}

export interface PipelineStageEvent {
  stage_change_id: string;
  candidate_id: string;
  candidate_name: string;
  from_stage: Candidate["pipelineStatus"];
  to_stage: Candidate["pipelineStatus"];
  changed_by: {
    id: string;
    name: string;
  };
  reason?: string;
  timestamp: string;
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface ConversionRates {
  applied_to_screened: number;
  screened_to_shortlisted: number;
  shortlisted_to_interview: number;
  interview_to_offer: number;
  overall_pass_through: number;
}

export interface DwellTimesHours {
  applied: number;
  screened: number;
  shortlisted: number;
  interview: number;
  offer: number;
}

export interface InterviewerConsensusMetric {
  agreement_score: number;
  consensus_status: string;
  scorecard_count: number;
  technical_rating_avg: number;
  communication_rating_avg: number;
  problem_solving_avg: number;
  culture_add_avg: number;
}

export interface SkillDeficit {
  skill: string;
  deficit_rate: number;
  candidates_affected: number;
}

export interface HiringFunnelData {
  org_id: string;
  total_candidates: number;
  stages: FunnelStage[];
  conversion_rates: ConversionRates;
  dwell_times_hours: DwellTimesHours;
  interviewer_consensus: InterviewerConsensusMetric;
  top_deficit_skills: SkillDeficit[];
}

export interface SystemTelemetryData {
  status: string;
  uptime_seconds: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  http_requests_total: number;
  active_websocket_connections: number;
  sandbox_executions_count: number;
  billing_webhooks_count: number;
  memory_rss_mb: number;
  sla_target_ms: number;
}

export interface QuotaBurnRateData {
  org_id: string;
  plan: string;
  active_jobs_used: number;
  active_jobs_limit: number;
  active_jobs_quota_pct: number;
  evaluations_used: number;
  evaluations_limit: number;
  evaluations_quota_pct: number;
  projected_runway_days: number;
  renewal_cycle: string;
  status: string;
}

export interface PanelAgentScorecard {
  agent_id: string;
  agent_name: string;
  avatar_role: string;
  role_focus: string;
  initial_score: number;
  final_score: number;
  recommendation: string;
  strengths: string[];
  concerns: string[];
  critique_quote: string;
}

export interface DebateExchange {
  round_number: number;
  speaker_agent: string;
  speaker_title: string;
  argument: string;
  concession_or_rebuttal: string;
  score_adjustment: number;
}

export interface MultiAgentPanelEvaluationResponse {
  session_id: string;
  role: string;
  question_scenario: string;
  candidate_answer: string;
  panel_agents: PanelAgentScorecard[];
  debate_occurred: boolean;
  debate_transcripts: DebateExchange[];
  composite_score: number;
  committee_recommendation: string;
  consensus_status: string;
  consensus_confidence: number;
  executive_summary: string;
}

export interface SSODiscoveryResponse {
  sso_enabled: boolean;
  org_id?: string;
  org_name?: string;
  provider?: string;
  domain: string;
  idp_entity_id?: string;
  idp_sso_url?: string;
  redirect_url?: string;
  message?: string;
}

export interface SSOConfig {
  org_id: string;
  org_name?: string;
  sso_enabled: boolean;
  sso_provider: string;
  sso_domain: string;
  idp_entity_id: string;
  idp_sso_url: string;
  idp_metadata_url?: string;
}

export interface AtsWebhookSubscription {
  id: string;
  org_id: string;
  target_url: string;
  secret_key: string;
  event_types: string[];
  is_active: boolean;
  created_at: string;
}

export interface AtsWebhookDelivery {
  id: string;
  subscription_id: string;
  event_type: string;
  response_status: number;
  attempt_count: number;
  delivered_at: string;
  error_message?: string;
}

// ---------------------------------------------------------------------------
// Sprint 13: Institutional TPO Admin Suite, Cohorts & NAAC Accreditation
// ---------------------------------------------------------------------------
export interface CohortStudent {
  id: string;
  roll_number?: string;
  student_name: string;
  student_email: string;
  user_id?: string;
  current_readiness: number;
  baseline_readiness: number;
  current_tier: string;
  deficit_skills: string[];
  enrolled_at?: string;
}

export interface Cohort {
  id: string;
  org_id: string;
  name: string;
  department: string;
  graduation_year: number;
  target_role: string;
  student_count: number;
  mean_readiness_score: number;
  tier_distribution: {
    job_ready: number;
    bridgeable: number;
    developing: number;
  };
  top_deficits: string[];
  created_at?: string;
  updated_at?: string;
}

export interface BatchDispatch {
  id: string;
  cohort_id: string;
  cohort_name: string;
  dispatch_type: "gap_sprint" | "mock_assessment" | string;
  title: string;
  target_skill: string;
  deadline_hours: number;
  total_students: number;
  completed_students: number;
  completion_rate: number;
  mean_score: number;
  status: "active" | "completed" | "expired" | string;
  dispatched_at?: string;
}

export interface NaacDomainBreakdown {
  domain: string;
  baseline_score: number;
  current_score: number;
  growth_percentage: number;
}

export interface NaacAccreditationReport {
  criterion: string;
  cohort_id: string;
  cohort_name: string;
  department: string;
  graduation_year: number;
  total_enrolled: number;
  baseline_mean_readiness: number;
  current_mean_readiness: number;
  competency_growth_percentage: number;
  deficit_remediation_rate: number;
  tier_distribution: {
    job_ready_count: number;
    bridgeable_count: number;
    developing_count: number;
    placement_ready_rate: number;
  };
  domain_breakdowns: NaacDomainBreakdown[];
  accreditation_summary: string;
}

export interface ProctoringAnomalyRecord {
  id: string;
  student_id?: string;
  student_name: string;
  cohort_id?: string;
  session_id: string;
  anomaly_type: string;
  severity: "low" | "medium" | "high" | "critical";
  metadata: Record<string, any>;
  resolved: boolean;
  recorded_at?: string;
}


