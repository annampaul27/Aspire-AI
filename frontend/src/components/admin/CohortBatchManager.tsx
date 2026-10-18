"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { tpoApi } from "@/lib/api/tpo";
import { Cohort, CohortStudent, BatchDispatch } from "@/types";

export default function CohortBatchManager() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [students, setStudents] = useState<CohortStudent[]>([]);
  const [dispatches, setDispatches] = useState<BatchDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [rosterExpanded, setRosterExpanded] = useState(false);

  // Batch dispatch modal states
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchType, setDispatchType] = useState<"gap_sprint" | "mock_assessment">("gap_sprint");
  const [dispatchTitle, setDispatchTitle] = useState("Distributed Caching & Redis Idempotency 48h Sprint");
  const [targetSkill, setTargetSkill] = useState("Distributed Systems");
  const [deadlineHours, setDeadlineHours] = useState(48);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [cRes, dRes] = await Promise.all([
          tpoApi.getCohorts(),
          tpoApi.getBatchDispatches(),
        ]);
        setCohorts(cRes.cohorts);
        setDispatches(dRes.dispatches);
        if (cRes.cohorts.length > 0) {
          const first = cRes.cohorts[0];
          setSelectedCohort(first);
          const detail = await tpoApi.getCohortDetail(first.id);
          setStudents(detail.students);
        }
      } catch (err) {
        console.error("Failed to load cohort data", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSelectCohort = async (cohort: Cohort) => {
    setSelectedCohort(cohort);
    try {
      const detail = await tpoApi.getCohortDetail(cohort.id);
      setStudents(detail.students);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  const handleBatchDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohort) return;
    setDispatching(true);
    setDispatchSuccessMsg(null);
    try {
      const res = await tpoApi.dispatchBatchSprint({
        cohort_id: selectedCohort.id,
        dispatch_type: dispatchType,
        title: dispatchTitle,
        target_skill: targetSkill,
        deadline_hours: deadlineHours,
      });
      setDispatchSuccessMsg(res.message);
      // Refresh dispatches
      const dRes = await tpoApi.getBatchDispatches(selectedCohort.id);
      setDispatches(dRes.dispatches);
      setTimeout(() => {
        setShowDispatchModal(false);
        setDispatchSuccessMsg(null);
      }, 2000);
    } catch (err) {
      console.error("Dispatch failed", err);
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 bg-gray-900 border border-gray-800 rounded-xl">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
        <p className="text-sm">Loading university cohorts & institutional rosters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Institutional TPO Cohort & Batch Dispatch Engine
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  University Suite
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Manage academic cohorts, monitor deficit skill clusters, and trigger 1-click batch sprint interventions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>1-Click Batch Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Selector & Card Summary */}
      {selectedCohort && (
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{selectedCohort.name}</h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                  Batch {selectedCohort.graduation_year}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Department: {selectedCohort.department} • Target Role: {selectedCohort.target_role}
              </p>
            </div>

            {cohorts.length > 1 && (
              <select
                aria-label="Select Academic Cohort"
                value={selectedCohort.id}
                onChange={(e) => {
                  const found = cohorts.find((c) => c.id === e.target.value);
                  if (found) handleSelectCohort(found);
                }}
                className="bg-gray-800 border border-gray-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Enrolled Students
              </span>
              <p className="text-lg font-semibold text-white mt-1">
                {selectedCohort.student_count}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                Mean Readiness
              </span>
              <p className="text-lg font-semibold text-emerald-400 mt-1">
                {selectedCohort.mean_readiness_score}%
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Job-Ready / Bridgeable
              </span>
              <p className="text-lg font-semibold text-white mt-1">
                <span className="text-emerald-400">{selectedCohort.tier_distribution.job_ready}</span>
                <span className="text-gray-500"> / </span>
                <span className="text-amber-400">{selectedCohort.tier_distribution.bridgeable}</span>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Developing (Deficit)
              </span>
              <p className="text-lg font-semibold text-rose-400 mt-1">
                {selectedCohort.tier_distribution.developing}
              </p>
            </div>
          </div>

          {/* Top Deficit Skills */}
          {selectedCohort.top_deficits && selectedCohort.top_deficits.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-400">Common Skill Deficits:</span>
              {selectedCohort.top_deficits.map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Toggle Roster Expander */}
          <button
            onClick={() => setRosterExpanded(!rosterExpanded)}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors pt-1"
          >
            <span>{rosterExpanded ? "Hide Enrolled Student Roster" : `View Enrolled Student Roster (${students.length})`}</span>
            {rosterExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Student Roster Table */}
      {rosterExpanded && (
        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Enrolled Candidate Roster & Competency Benchmarks
            </h4>
            <span className="text-xs text-gray-400">{students.length} Total Enrolled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-800/60 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2">Roll No</th>
                  <th className="px-3 py-2">Candidate</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Baseline</th>
                  <th className="px-3 py-2">Current</th>
                  <th className="px-3 py-2">Uplift</th>
                  <th className="px-3 py-2">Tier</th>
                  <th className="px-3 py-2">Deficit Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {students.map((st) => {
                  const uplift = st.current_readiness - st.baseline_readiness;
                  return (
                    <tr key={st.id} className="hover:bg-gray-800/40">
                      <td className="px-3 py-2.5 font-mono text-gray-400">{st.roll_number || " - "}</td>
                      <td className="px-3 py-2.5 font-medium text-white">{st.student_name}</td>
                      <td className="px-3 py-2.5 text-gray-400">{st.student_email}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-400">{st.baseline_readiness}%</td>
                      <td className="px-3 py-2.5 font-mono font-semibold text-emerald-400">{st.current_readiness}%</td>
                      <td className="px-3 py-2.5 font-mono">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          +{uplift}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            st.current_tier === "job_ready"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : st.current_tier === "bridgeable"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {st.current_tier.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-400">
                        {st.deficit_skills && st.deficit_skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {st.deficit_skills.map((d) => (
                              <span key={d} className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/10 text-rose-300">
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-400/80 text-[11px]">Clear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatched Batches Table */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">Active & Historical Batch Dispatches</h4>
          </div>
          <span className="text-xs text-gray-400">{dispatches.length} Total Dispatched</span>
        </div>

        {dispatches.length === 0 ? (
          <div className="p-6 text-center text-gray-500 border border-gray-800 rounded-lg">
            No batch dispatches have been triggered yet. Click &quot;1-Click Batch Dispatch&quot; to launch.
          </div>
        ) : (
          <div className="space-y-3">
            {dispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="p-4 rounded-lg bg-gray-950/60 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium border ${
                        dispatch.dispatch_type === "gap_sprint"
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      }`}
                    >
                      {dispatch.dispatch_type.replace("_", " ")}
                    </span>
                    <h5 className="text-xs font-semibold text-white">{dispatch.title}</h5>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <span>Target: <strong className="text-gray-300">{dispatch.target_skill}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {dispatch.deadline_hours}h SLA
                    </span>
                    <span>•</span>
                    <span>Cohort: {dispatch.cohort_name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400">Completion</span>
                    <p className="text-xs font-mono font-semibold text-white">
                      {dispatch.completed_students} / {dispatch.total_students} ({dispatch.completion_rate}%)
                    </p>
                    <div className="w-24 bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(dispatch.completion_rate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-gray-400">Mean Score</span>
                    <p className="text-xs font-mono font-semibold text-emerald-400">
                      {dispatch.mean_score}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1-Click Batch Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">1-Click Batch Dispatch</h4>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-gray-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {dispatchSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dispatchSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleBatchDispatch} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Target Cohort</label>
                <input
                  type="text"
                  disabled
                  value={selectedCohort ? selectedCohort.name : "Select Cohort"}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Intervention Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchType("gap_sprint")}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-colors ${
                      dispatchType === "gap_sprint"
                        ? "bg-purple-950/40 border-purple-500 text-purple-200"
                        : "bg-gray-800/40 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      48h Skill Gap Sprint
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Automated code challenge & sandbox test</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDispatchType("mock_assessment")}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-colors ${
                      dispatchType === "mock_assessment"
                        ? "bg-blue-950/40 border-blue-500 text-blue-200"
                        : "bg-gray-800/40 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-400" />
                      Proctored Assessment
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Multimodal interview & code assessment</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Dispatch Title</label>
                <input
                  type="text"
                  value={dispatchTitle}
                  onChange={(e) => setDispatchTitle(e.target.value)}
                  required
                  placeholder="e.g. Distributed Caching & Redis Idempotency 48h Sprint"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Target Skill Domain</label>
                  <input
                    type="text"
                    value={targetSkill}
                    onChange={(e) => setTargetSkill(e.target.value)}
                    required
                    placeholder="e.g. Distributed Systems"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Deadline Window (Hours)</label>
                  <input
                    type="number"
                    min="12"
                    max="168"
                    value={deadlineHours}
                    onChange={(e) => setDeadlineHours(Number(e.target.value))}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-emerald-900/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{dispatching ? "Dispatching to Cohort..." : `Dispatch to All ${selectedCohort?.student_count || 20} Students`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
