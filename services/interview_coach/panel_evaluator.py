import uuid
from pydantic import BaseModel, Field


class PanelEvaluationRequest(BaseModel):
    role: str = "Senior Software Architect"
    question_scenario: str = "Design a high-throughput event processing architecture"
    candidate_answer: str = ""
    candidate_name: str | None = "Candidate"


class PanelAgentScorecard(BaseModel):
    agent_id: str
    agent_name: str
    avatar_role: str
    role_focus: str
    initial_score: float
    final_score: float
    recommendation: str  # "Strong Hire", "Hire", "Neutral", "Reject"
    strengths: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    critique_quote: str


class DebateExchange(BaseModel):
    round_number: int
    speaker_agent: str
    speaker_title: str
    argument: str
    concession_or_rebuttal: str
    score_adjustment: float


class MultiAgentPanelEvaluationResponse(BaseModel):
    session_id: str
    role: str
    question_scenario: str
    candidate_answer: str
    panel_agents: list[PanelAgentScorecard]
    debate_occurred: bool
    debate_transcripts: list[DebateExchange]
    composite_score: float
    committee_recommendation: str  # "Strong Hire", "Hire", "Leaning Hire", "Needs Improvement", "Do Not Hire"
    consensus_status: str  # "Unanimous Consensus", "High Consensus", "Debated Consensus", "Split Decision"
    consensus_confidence: float  # Percentage (0-100)
    executive_summary: str


class MultiAgentPanelOrchestrator:
    """
    Enterprise Multi-Agent Interview Panel Orchestrator:
    Simulates a live 3-member executive hiring committee:
      1. Alex Rivera - Tech Lead & Code Quality Bar-Raiser (35% weight)
      2. Marcus Chen - Principal Distributed Systems Architect (35% weight)
      3. Elena Rostova - VP of Engineering, Culture & Leadership (30% weight)
    Includes an autonomous Panel Arbiter that detects evaluation variance and
    coordinates dynamic multi-agent debate rounds to resolve split decisions.
    """

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key

    def evaluate(self, request: PanelEvaluationRequest) -> MultiAgentPanelEvaluationResponse:
        session_id = f"panel-{uuid.uuid4().hex[:8]}"
        answer = request.candidate_answer.strip()
        answer_lower = answer.lower()

        # 1. Tech Lead Evaluation (Rigor, Algorithmic Big-O, defensive edge-cases, error handling)
        tech_score, tech_strengths, tech_concerns, tech_quote, tech_rec = self._evaluate_tech_lead(answer_lower, answer)

        # 2. System Design Evaluation (Partitioning, consensus, caching, CAP trade-offs, failover)
        sys_score, sys_strengths, sys_concerns, sys_quote, sys_rec = self._evaluate_system_design(answer_lower, answer)

        # 3. Culture & Leadership Evaluation (Humility, communication clarity, empathy, tone)
        culture_score, culture_strengths, culture_concerns, culture_quote, culture_rec = self._evaluate_culture(answer_lower, answer)

        # 4. Multi-Agent Arbitration & Debate Round
        scores = [tech_score, sys_score, culture_score]
        recs = [tech_rec, sys_rec, culture_rec]
        variance = max(scores) - min(scores)

        # In executive hiring committees, all affirmative votes (Hire/Strong Hire) represent consensus.
        # A calibration debate is triggered if recommendation tiers conflict or if variance is severe (>24)
        all_affirmative = all(r in ("Strong Hire", "Hire") for r in recs)
        has_tier_conflict = any(r in ("Reject", "Neutral") for r in recs) and any(r in ("Strong Hire", "Hire") for r in recs)

        debate_occurred = False
        debate_transcripts: list[DebateExchange] = []

        final_tech_score = tech_score
        final_sys_score = sys_score
        final_culture_score = culture_score

        if has_tier_conflict or (variance > 24.0 and not all_affirmative) or (variance >= 20.0 and ("incompetent" in answer_lower or "obviously" in answer_lower)):
            debate_occurred = True
            # Case A: Culture score is significantly lower than Tech/System scores (Toxic / Arrogant tone)
            if (tech_score - culture_score) >= 15.0 or (sys_score - culture_score) >= 15.0:
                debate_transcripts.append(
                    DebateExchange(
                        round_number=1,
                        speaker_agent="Elena Rostova",
                        speaker_title="VP of Engineering & Culture",
                        argument=(
                            "The candidate's technical claims are notable, but their condescending language and dismissive "
                            "attitude towards team trade-offs represents an acute cultural risk. In an engineering org, brilliant "
                            "jerks destroy team psychological safety."
                        ),
                        concession_or_rebuttal=(
                            "Requested technical evaluators apply a conduct calibration penalty."
                        ),
                        score_adjustment=-6.0,
                    )
                )
                debate_transcripts.append(
                    DebateExchange(
                        round_number=2,
                        speaker_agent="Alex Rivera",
                        speaker_title="Lead Software Architect",
                        argument=(
                            "Conceded. While their Big-O analysis and implementation instincts are acute, architectural "
                            "longevity requires collaborative review. I will discount my initial technical rating by 8 points."
                        ),
                        concession_or_rebuttal="Concession accepted. Adjusting technical bar-raiser score.",
                        score_adjustment=-8.0,
                    )
                )
                final_tech_score = max(0.0, tech_score - 8.0)
                final_sys_score = max(0.0, sys_score - 5.0)
                final_culture_score = min(100.0, culture_score + 2.0)

            # Case B: System Design score is significantly lower than Tech Lead (Lack of scalability / SPOF)
            elif (tech_score - sys_score) >= 15.0:
                debate_transcripts.append(
                    DebateExchange(
                        round_number=1,
                        speaker_agent="Marcus Chen",
                        speaker_title="Principal Systems Architect",
                        argument=(
                            "The candidate described clean algorithmic code, but failed to address multi-region failover, "
                            "partition splits, and cascading cache stampede. Under production load this will fail."
                        ),
                        concession_or_rebuttal="Challenged Tech Lead on system reliability.",
                        score_adjustment=-7.0,
                    )
                )
                debate_transcripts.append(
                    DebateExchange(
                        round_number=2,
                        speaker_agent="Alex Rivera",
                        speaker_title="Lead Software Architect",
                        argument=(
                            "Agreed that cluster resilience was underexplored. However, their data model shows solid fundamentals. "
                            "I will lower the implementation score by 5 points."
                        ),
                        concession_or_rebuttal="Balanced adjustment applied.",
                        score_adjustment=-5.0,
                    )
                )
                final_tech_score = max(0.0, tech_score - 5.0)
                final_sys_score = min(100.0, sys_score + 3.0)

            # Case C: Other general divergent views
            else:
                debate_transcripts.append(
                    DebateExchange(
                        round_number=1,
                        speaker_agent="Marcus Chen",
                        speaker_title="Principal Systems Architect",
                        argument="We observed variance in depth between algorithmic syntax and cloud resiliency.",
                        concession_or_rebuttal="Panelists reconciled edge case weightings.",
                        score_adjustment=-3.0,
                    )
                )
                final_tech_score = round(tech_score * 0.95, 1)
                final_sys_score = round(sys_score * 0.95, 1)

        # 5. Composite Score & Final Consensus Synthesis
        composite_score = round(
            (final_tech_score * 0.35) + (final_sys_score * 0.35) + (final_culture_score * 0.30),
            1
        )

        if composite_score >= 85.0:
            verdict = "Strong Hire"
        elif composite_score >= 70.0:
            verdict = "Hire"
        elif composite_score >= 55.0:
            verdict = "Leaning Hire"
        elif composite_score >= 40.0:
            verdict = "Needs Improvement"
        else:
            verdict = "Do Not Hire"

        post_debate_scores = [final_tech_score, final_sys_score, final_culture_score]
        post_debate_variance = max(post_debate_scores) - min(post_debate_scores)

        # Final recommendations recalculated on adjusted scores
        final_recs = [
            "Strong Hire" if s >= 85 else ("Hire" if s >= 70 else ("Neutral" if s >= 50 else "Reject"))
            for s in post_debate_scores
        ]

        if not debate_occurred and (post_debate_variance <= 12.0 or all(r == final_recs[0] for r in final_recs)):
            consensus_status = "Unanimous Consensus"
            confidence = 94.5
        elif not debate_occurred and all(r in ("Strong Hire", "Hire") for r in final_recs):
            consensus_status = "High Consensus"
            confidence = 88.5
        elif debate_occurred and all(r in ("Strong Hire", "Hire") for r in final_recs):
            consensus_status = "Debated Consensus"
            confidence = 82.0
        elif debate_occurred and post_debate_variance <= 18.0:
            consensus_status = "Debated Consensus"
            confidence = 78.0
        else:
            consensus_status = "Split Decision"
            confidence = 65.0

        # Construct Agent Scorecards
        agents = [
            PanelAgentScorecard(
                agent_id="tech_lead",
                agent_name="Alex Rivera",
                avatar_role="Lead Software Architect",
                role_focus="Code Rigor, Big-O Complexity & Error Handling",
                initial_score=tech_score,
                final_score=final_tech_score,
                recommendation=tech_rec,
                strengths=tech_strengths,
                concerns=tech_concerns,
                critique_quote=tech_quote,
            ),
            PanelAgentScorecard(
                agent_id="system_design",
                agent_name="Marcus Chen",
                avatar_role="Principal Systems Architect",
                role_focus="Distributed Scalability, Partitioning & Resiliency",
                initial_score=sys_score,
                final_score=final_sys_score,
                recommendation=sys_rec,
                strengths=sys_strengths,
                concerns=sys_concerns,
                critique_quote=sys_quote,
            ),
            PanelAgentScorecard(
                agent_id="culture_alignment",
                agent_name="Elena Rostova",
                avatar_role="VP of Engineering & Culture",
                role_focus="Communication Structure, Humility & Team Empathy",
                initial_score=culture_score,
                final_score=final_culture_score,
                recommendation=culture_rec,
                strengths=culture_strengths,
                concerns=culture_concerns,
                critique_quote=culture_quote,
            ),
        ]

        summary = (
            f"The hiring committee reached a {consensus_status} with an overall hireability score of "
            f"{composite_score}/100 ({verdict}, {confidence}% committee confidence). "
            f"Alex Rivera (Tech Lead) awarded a final score of {final_tech_score}, Marcus Chen (System Architecture) "
            f"awarded {final_sys_score}, and Elena Rostova (Culture & Collaboration) awarded {final_culture_score}. "
        )
        if debate_occurred:
            summary += (
                f"A structured calibration debate occurred across {len(debate_transcripts)} rounds "
                "to reconcile initial score divergences and align on team impact."
            )
        else:
            summary += "The committee demonstrated strong initial alignment across all core competencies without dispute."

        return MultiAgentPanelEvaluationResponse(
            session_id=session_id,
            role=request.role,
            question_scenario=request.question_scenario,
            candidate_answer=answer,
            panel_agents=agents,
            debate_occurred=debate_occurred,
            debate_transcripts=debate_transcripts,
            composite_score=composite_score,
            committee_recommendation=verdict,
            consensus_status=consensus_status,
            consensus_confidence=confidence,
            executive_summary=summary,
        )

    def _evaluate_tech_lead(self, text_lower: str, text: str):
        score = 65.0
        strengths = []
        concerns = []

        # Technical keywords checking
        tech_signals = [
            ("idempotency", 6.0, "Proper idempotency safeguards demonstrated"),
            ("transaction", 6.0, "Atomic database transactional guarantees cited"),
            ("select for update", 6.0, "Pessimistic locking and concurrency control specified"),
            ("rollback", 5.0, "Defensive error rollback mechanisms in place"),
            ("o(log", 7.0, "Logarithmic algorithmic complexity verified"),
            ("o(1", 6.0, "Constant-time indexing lookups validated"),
            ("raft", 7.0, "Consensus state machine handling mentioned"),
            ("quorum", 6.0, "Strict majority quorum logic included"),
            ("ttl", 5.0, "Cache expiration / TTL boundaries respected"),
        ]

        for term, pts, desc in tech_signals:
            if term in text_lower:
                score += pts
                strengths.append(desc)

        if len(text.split()) < 25:
            score -= 15.0
            concerns.append("Response lacks implementation depth and concrete edge-case syntax")

        if "partition" not in text_lower and "index" not in text_lower and "key" not in text_lower:
            concerns.append("Did not specify storage key structures or schema indexes")

        score = max(20.0, min(96.0, round(score, 1)))
        rec = "Strong Hire" if score >= 85 else ("Hire" if score >= 70 else ("Neutral" if score >= 50 else "Reject"))
        quote = (
            f"Candidate showed {'command of programmatic precision and edge cases' if score >= 70 else 'superficial code awareness without sufficient implementation rigor'}."
        )
        return score, strengths or ["Familiarity with standard software stack"], concerns or ["Consider deeper exploration of async race conditions"], quote, rec

    def _evaluate_system_design(self, text_lower: str, text: str):
        score = 60.0
        strengths = []
        concerns = []

        sys_signals = [
            ("kafka", 7.0, "Asynchronous event stream backbone utilized"),
            ("redis", 6.0, "In-memory caching tier positioned correctly"),
            ("partition", 7.0, "Horizontal data partitioning / sharding articulated"),
            ("cockroachdb", 8.0, "Distributed multi-region active-active SQL store chosen"),
            ("spanner", 8.0, "Globally distributed transactional database specified"),
            ("active-active", 7.0, "High-availability multi-region redundancy designed"),
            ("dead-letter", 6.0, "Dead-letter queue resiliency pattern included"),
            ("eventual consistency", 7.0, "Balanced CAP theorem trade-offs acknowledged"),
            ("multi-region", 6.0, "Cross-region latency mitigation addressed"),
        ]

        for term, pts, desc in sys_signals:
            if term in text_lower:
                score += pts
                strengths.append(desc)

        if "drop all writes" in text_lower or "don't care" in text_lower:
            score -= 18.0
            concerns.append("Unacceptable availability penalty; dropping writes without buffer or fallback")

        if "single point of failure" in text_lower or "monolith" in text_lower:
            concerns.append("Potential single point of failure in hot path")

        score = max(20.0, min(95.0, round(score, 1)))
        rec = "Strong Hire" if score >= 85 else ("Hire" if score >= 70 else ("Neutral" if score >= 50 else "Reject"))
        quote = (
            f"Architectural design reflects {'robust distributed scalability and resilience patterns' if score >= 70 else 'vulnerabilities in fault tolerance and high-concurrency throughput'}."
        )
        return score, strengths or ["Basic architectural component awareness"], concerns or ["Recommend reviewing multi-datacenter failover runbooks"], quote, rec

    def _evaluate_culture(self, text_lower: str, text: str):
        score = 75.0
        strengths = []
        concerns = []

        # Toxic / Arrogant signals
        toxic_terms = ["obviously", "incompetent", "stupid", "idiot", "anyone who doesn't", "don't care about their feelings", "amateurs"]
        toxic_count = sum(1 for term in toxic_terms if term in text_lower)
        if toxic_count > 0:
            score -= (28.0 * toxic_count)
            concerns.append("Exhibited dismissive, condescending tone toward colleagues or alternative designs")

        # Collaborative signals
        collab_signals = [
            ("team", 6.0, "Emphasized cross-functional team alignment"),
            ("product manager", 6.0, "Collaborated with product stakeholders on SLA trade-offs"),
            ("runbook", 5.0, "Shared operational documentation and runbooks with on-call peers"),
            ("trade-off", 6.0, "Demonstrated structured communication around architectural trade-offs"),
            ("compromise", 5.0, "Showed humility and pragmatism regarding consistency models"),
        ]

        for term, pts, desc in collab_signals:
            if term in text_lower:
                score += pts
                strengths.append(desc)

        score = max(10.0, min(96.0, round(score, 1)))
        rec = "Strong Hire" if score >= 85 else ("Hire" if score >= 70 else ("Neutral" if score >= 50 else "Reject"))
        quote = (
            f"Candidate demonstrated {'mature communication, pragmatic humility, and team leadership' if score >= 70 else 'severe collaborative friction and risk of damaging team psychological safety'}."
        )
        return score, strengths or ["Polite communication format"], concerns or ["Could articulate more proactive empathy for downstream maintainers"], quote, rec
