"use client";

import React, { useState } from "react";
import {
  X,
  Users,
  Award,
  Download,
  Printer,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Scale,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MultiAgentPanelEvaluationResponse } from "@/types";

interface MultiAgentPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: MultiAgentPanelEvaluationResponse | null;
  isLoading?: boolean;
}

export default function MultiAgentPanelModal({
  isOpen,
  onClose,
  evaluation,
  isLoading = false,
}: MultiAgentPanelModalProps) {
  const [showDebateDetails, setShowDebateDetails] = useState(true);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    if (!evaluation) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(evaluation, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `MultiAgent_Panel_Consensus_${evaluation.session_id || "evaluation"}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "Strong Hire":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "Hire":
        return "bg-teal-500/20 text-teal-400 border-teal-500/40";
      case "Leaning Hire":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "Lean Reject":
      case "Reject":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-2 text-gray-400 hover:bg-gray-900 hover:text-white transition-colors"
          title="Close Dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
            <h3 className="text-xl font-bold">Convening Autonomous Panelists...</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Staff Architect, Systems Lead, and Culture Arbiters are deliberating cross-domain consensus scores and evaluating architectural integrity.
            </p>
          </div>
        ) : !evaluation ? (
          <div className="py-20 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold">No Panel Data Available</h3>
            <p className="text-sm text-gray-400">Please trigger a panel deliberation session first.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Multi-Agent Executive Panel
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Session: {evaluation.session_id}
                  </span>
                </div>
                <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">
                  Autonomous Deliberation & Consensus Debrief
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Target Role: <strong className="text-emerald-400">{evaluation.role}</strong> · Status:{" "}
                  <strong className="text-white">{evaluation.consensus_status}</strong> (
                  {evaluation.consensus_confidence.toFixed(1)}% Confidence)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-4 w-4" /> Export Panel JSON
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2 text-xs font-semibold text-gray-200 hover:bg-gray-800 transition-colors"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
              </div>
            </div>

            {/* Primary Banner: Composite Consensus Verdict */}
            <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950 p-6 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Final Panel Consensus Verdict
                  </span>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-xl border px-4 py-1.5 text-xl font-extrabold shadow-sm ${getVerdictStyle(
                        evaluation.committee_recommendation
                      )}`}
                    >
                      {evaluation.committee_recommendation}
                    </span>
                    <span className="text-3xl font-black text-white font-mono">
                      {evaluation.composite_score.toFixed(1)}
                      <span className="text-base text-gray-500 font-normal"> / 100</span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-300 leading-relaxed max-w-2xl">
                    {evaluation.executive_summary}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-400">Consensus Confidence:</span>
                    <span className="font-mono font-bold text-white">
                      {evaluation.consensus_confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-400">Debate Rounds:</span>
                    <span className="font-mono font-bold text-white">
                      {evaluation.debate_transcripts.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-400">Debate Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evaluation.debate_occurred
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {evaluation.debate_occurred ? "Resolved Debate" : "Aligned Consensus"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Autonomous Panelist Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Independent Panel Scorecards
                </h3>
                <span className="text-xs text-gray-400">3 Persona Specialists</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluation.panel_agents.map((panelist) => (
                  <div
                    key={panelist.agent_id}
                    className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 flex flex-col justify-between hover:border-gray-700 transition-colors"
                  >
                    <div>
                      {/* Persona Header */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg p-1.5 rounded-lg bg-gray-800/80 font-bold">
                            {panelist.agent_id === "tech_lead"
                              ? "👨‍💻"
                              : panelist.agent_id === "system_design"
                              ? "⚡"
                              : "🤝"}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-white leading-tight">
                              {panelist.agent_name}
                            </h4>
                            <p className="text-[10px] text-gray-400">{panelist.avatar_role}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-purple-300 font-medium">
                        Focus: {panelist.role_focus}
                      </div>

                      {/* Score & Recommendation */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-white font-mono">
                            {panelist.final_score.toFixed(1)}
                          </span>
                          {panelist.initial_score !== panelist.final_score && (
                            <span className="text-[10px] text-gray-500 line-through font-mono">
                              {panelist.initial_score.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getVerdictStyle(
                            panelist.recommendation
                          )}`}
                        >
                          {panelist.recommendation}
                        </span>
                      </div>

                      {/* Key Strengths */}
                      <div className="mt-3 space-y-1.5">
                        <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                          Strengths
                        </span>
                        {panelist.strengths.map((str, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{str}</span>
                          </div>
                        ))}
                      </div>

                      {/* Concerns */}
                      {panelist.concerns.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
                            Areas of Concern
                          </span>
                          {panelist.concerns.map((conc, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-amber-200">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{conc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Verbatim Critique Quote */}
                    <div className="mt-4 pt-3 border-t border-gray-800">
                      <p className="text-[11px] italic text-gray-400 bg-black/40 p-2 rounded-lg border border-gray-800/60 leading-relaxed">
                        &quot;{panelist.critique_quote}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calibration Debate Transcript Section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <button
                onClick={() => setShowDebateDetails(!showDebateDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">
                    Arbitration Debate & Concession Log
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 font-mono">
                    {evaluation.debate_transcripts.length} Exchanges
                  </span>
                </div>
                {showDebateDetails ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {showDebateDetails && (
                <div className="mt-4 space-y-3 pt-3 border-t border-gray-800">
                  {evaluation.debate_transcripts.length === 0 ? (
                    <div className="text-xs text-gray-400 italic py-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      All 3 panelists reached immediate consensus within calibrated variance thresholds. No heated debate rounds required.
                    </div>
                  ) : (
                    evaluation.debate_transcripts.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-800 bg-gray-950 p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-purple-500/20 text-purple-300 px-1.5 py-0.5 text-[10px] font-bold font-mono">
                              Round {item.round_number}
                            </span>
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <MessageSquare className="h-3 w-3 text-purple-400" />
                              {item.speaker_agent} ({item.speaker_title})
                            </span>
                          </div>
                          {item.score_adjustment !== 0 && (
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                item.score_adjustment > 0 ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              Adjustment: {item.score_adjustment > 0 ? "+" : ""}
                              {item.score_adjustment.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-300 leading-relaxed">{item.argument}</p>

                        {item.concession_or_rebuttal && (
                          <div className="pt-2 border-t border-gray-800/80 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">
                              Status:
                            </span>
                            <span className="px-2 py-0.5 rounded bg-gray-800 text-[11px] text-gray-300 border border-gray-700">
                              {item.concession_or_rebuttal}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Multi-Agent Consensus Engine v2.0
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 font-semibold transition-colors"
              >
                Close Debrief
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
