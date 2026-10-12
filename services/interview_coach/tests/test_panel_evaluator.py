from services.interview_coach.panel_evaluator import (
    MultiAgentPanelOrchestrator,
    PanelEvaluationRequest,
    MultiAgentPanelEvaluationResponse,
)

def test_individual_agent_evaluations():
    orchestrator = MultiAgentPanelOrchestrator(api_key=None)
    req = PanelEvaluationRequest(
        role="Senior Backend Engineer",
        question_scenario="Design an idempotent distributed payment processor with Kafka and PostgreSQL.",
        candidate_answer=(
            "We use unique idempotency keys in Redis with 24h TTL. When a webhook arrives, we open a database "
            "transaction, check for the idempotency key in PostgreSQL using SELECT FOR UPDATE, insert the payment ledger entry, "
            "and publish an event to Kafka with partition key set to customer_id. If anything fails, transaction rolls back."
        ),
    )
    result = orchestrator.evaluate(req)
    assert isinstance(result, MultiAgentPanelEvaluationResponse)
    assert len(result.panel_agents) == 3
    agent_ids = [a.agent_id for a in result.panel_agents]
    assert "tech_lead" in agent_ids
    assert "system_design" in agent_ids
    assert "culture_alignment" in agent_ids

    for agent in result.panel_agents:
        assert 0.0 <= agent.initial_score <= 100.0
        assert 0.0 <= agent.final_score <= 100.0
        assert len(agent.strengths) >= 1
        assert len(agent.critique_quote) > 10

def test_panel_arbiter_unanimous_consensus():
    orchestrator = MultiAgentPanelOrchestrator(api_key=None)
    # A well-balanced answer that scores consistently across code, architecture, and team reasoning
    req = PanelEvaluationRequest(
        role="Principal Systems Engineer",
        question_scenario="How do you architect a multi-region active-active database failover?",
        candidate_answer=(
            "We establish CockroachDB or Spanner with Raft consensus groups across three cloud regions. "
            "To keep cross-region latency within bounds, we partition tables geographically by tenant country. "
            "In our team, we aligned with product managers early on eventual consistency compromises and maintained runbooks."
        ),
    )
    result = orchestrator.evaluate(req)
    assert result.composite_score >= 70.0
    assert result.committee_recommendation in ["Strong Hire", "Hire"]
    assert result.consensus_status in ["Unanimous Consensus", "High Consensus"]
    assert len(result.executive_summary) > 50

def test_panel_arbiter_triggers_debate_on_high_variance():
    orchestrator = MultiAgentPanelOrchestrator(api_key=None)
    # Strong code syntax and Big-O mention, but dismissive tone and ignores distributed failure modes
    req = PanelEvaluationRequest(
        role="Senior Distributed Systems Architect",
        question_scenario="How do you handle split-brain in an asynchronous cluster?",
        candidate_answer=(
            "Obviously you just use a Quorum with majority N/2 + 1 nodes. Anyone who doesn't do this is incompetent. "
            "I write the C++ raft implementation in 50 lines with O(log N) commits. If a network partition happens, "
            "the minor partition just drops all writes, I don't care about their feelings."
        ),
    )
    result = orchestrator.evaluate(req)
    # High variance between Tech Lead (impressed by raft/quorum/O(log N)) vs Culture (alarmed by condescending tone)
    assert result.debate_occurred is True
    assert len(result.debate_transcripts) >= 2
    # Verify adjustments were applied during debate
    tech_agent = next(a for a in result.panel_agents if a.agent_id == "tech_lead")
    culture_agent = next(a for a in result.panel_agents if a.agent_id == "culture_alignment")
    assert tech_agent.final_score != tech_agent.initial_score or culture_agent.final_score != culture_agent.initial_score
