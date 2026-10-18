"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import {
  GraduationCap,
  Download,
  Rocket,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  X,
} from "lucide-react";

export default function UniversityCohortAnalytics() {
  const { currentOrg, addToast } = useStore();
  const [exported, setExported] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isBatchSprintActive, setIsBatchSprintActive] = useState(false);

  const cohortDeficits = [
    {
      skill: "PostgreSQL Indexing & Query Tuning",
      studentsAssessed: 480,
      deficitCount: 268,
      deficitPercentage: 55.8,
      status: "Severe Deficit",
      recommendedAction: "Mandatory 48-Hour Sprint",
    },
    {
      skill: "FastAPI Async Workers & Redis Queues",
      studentsAssessed: 480,
      deficitCount: 182,
      deficitPercentage: 37.9,
      status: "Moderate Deficit",
      recommendedAction: "Bridgeable via 10-minute micro-learning modules",
    },
    {
      skill: "Docker Multi-stage Builds & Security",
      studentsAssessed: 480,
      deficitCount: 144,
      deficitPercentage: 30.0,
      status: "Normal Dispersion",
      recommendedAction: "Elective workshop",
    },
  ];

  const handleExportNAAC = () => {
    setExported(true);
    addToast({
      type: "success",
      title: "NAAC/NIRF Accreditation Dossier Exported",
      message:
        "Generated NAAC Criterion 5.1.4 / NIRF Placement Readiness Compliance CSV and verifiable cryptographic hash summary.",
    });
    setTimeout(() => setExported(false), 4000);
  };

  const handleConfirmSprint = () => {
    setIsSprintModalOpen(false);
    setIsBatchSprintActive(true);
    addToast({
      type: "success",
      title: "Placement Sprint Dispatched (NAAC Criterion 5)",
      message:
        "Dispatched PostgreSQL & FastAPI gap sprints to 64 bridgeable students. Auto-grading enabled.",
    });
  };

  return (
    <div className="space-y-6">
      {/* University Cohort Header */}
      <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  University Cohort Readiness & NAAC/NIRF Analytics
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-medium">
                  TPO Portal
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Aggregated cohort skill deficit metrics for {currentOrg?.name || "Anna University / Partner Colleges"} • Class of 2026 (480 Candidates)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Header Action Button: TPO 1-Click Batch Placement Sprint */}
            <button
              onClick={() => setIsSprintModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch 48-Hour Campus Placement Sprint</span>
            </button>

            <button
              onClick={handleExportNAAC}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exported ? "Dossier Exported ✓" : "Export NAAC/NIRF Dossier"}</span>
            </button>
          </div>
        </div>

        {/* Accreditation Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-800">
          <div>
            <span className="text-xs text-gray-400 uppercase font-medium">Batch Fit</span>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">76.4% Avg</p>
            <span className="text-[11px] text-gray-500">+14% post gap-sprints</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-medium">Bridgeable Rate</span>
            <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">42.8% of Batch</p>
            <span className="text-[11px] text-gray-500">185 students ready to bridge</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-medium">Verified Credentials</span>
            <p className="text-lg font-bold font-mono text-blue-400 mt-0.5">432 Minted</p>
            <span className="text-[11px] text-gray-500">SHA-256 verified proof of work</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-medium">NIRF Employability</span>
            <p className="text-lg font-bold font-mono text-indigo-400 mt-0.5">Rank Band 94</p>
            <span className="text-[11px] text-gray-500">Tier-1 Alignment</span>
          </div>
        </div>
      </div>

      {/* Active Batch Sprint Banner */}
      {isBatchSprintActive && (
        <div className="p-4 rounded-xl border border-emerald-800 bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-900/60 border border-emerald-700/80 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-emerald-300">
                  Active Batch Sprint: PostgreSQL Optimization  -  47h 59m remaining (64 students enrolled, 18 already completed)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-900/80 text-emerald-300 border border-emerald-700 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" /> Live
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Curriculum remediation in progress • Direct alignment with Swiggy, Zoho &amp; Snowflake active openings
              </p>
            </div>
          </div>
          <div className="w-full md:w-56 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Cohort Progress</span>
              <span className="text-emerald-400 font-medium">18 / 64 (28%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: "28.1%" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cohort Skill Deficit Table */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Cohort-Wide Skill Gap Heatmap
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Identifies exact curriculum gaps based on real employer job requisition benchmarks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-medium">Skill</th>
                <th className="pb-3 font-medium">Assessed</th>
                <th className="pb-3 font-medium">Deficit Rate</th>
                <th className="pb-3 font-medium">Diagnosis</th>
                <th className="pb-3 font-medium">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 font-sans">
              {cohortDeficits.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-850/50 transition-colors">
                  <td className="py-3.5 font-medium text-gray-200">
                    {row.skill}
                  </td>
                  <td className="py-3.5 text-gray-400 font-mono">
                    {row.studentsAssessed} Students
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.deficitPercentage > 50
                              ? "bg-rose-500"
                              : row.deficitPercentage > 35
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${row.deficitPercentage}%` }}
                        />
                      </div>
                      <span className="font-mono text-gray-300">
                        {row.deficitPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        row.deficitPercentage > 50
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : row.deficitPercentage > 35
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border-emerald-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400 text-xs">
                    {row.recommendedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Confirmation Modal */}
      {isSprintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl rounded-xl border border-gray-700 bg-gray-900 p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Launch 48-Hour Batch Placement Sprint (NAAC Criterion 5)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Institutional Targeted Upskilling for {currentOrg?.name || "Anna University / Partner Colleges"} • Class of 2026
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSprintModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cohort Target Stats */}
            <div className="grid grid-cols-1 gap-2 p-4 rounded-lg bg-gray-950 border border-gray-800 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-850">
                <span className="text-gray-400">Target Audience</span>
                <span className="text-emerald-400 font-medium">
                  64 &apos;Bridgeable&apos; Students (Missing 1-2 skills)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-850">
                <span className="text-gray-400">Target Sprint Modules</span>
                <span className="text-blue-400 font-medium">
                  PostgreSQL Indexing &amp; FastAPI Async Workers
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-400">Employer Partner Benchmarks</span>
                <span className="text-gray-200 font-medium text-right">
                  Direct alignment with Swiggy, Zoho &amp; Snowflake active openings
                </span>
              </div>
            </div>

            {/* Impact Projection Card */}
            <div className="p-4 rounded-lg border border-emerald-800/80 bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Accreditation &amp; Placement Impact Projection</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Projected Placement Readiness: <strong>+28% eligibility</strong></span>
                </div>
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>21 additional students</strong> unlock immediate technical interview shortlists</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSprintModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-750 text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSprint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Confirm &amp; Dispatch Sprints to 64 Students</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
