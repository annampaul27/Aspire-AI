"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Download,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldAlert,
  FileSpreadsheet,
} from "lucide-react";
import { tpoApi } from "@/lib/api/tpo";
import { NaacAccreditationReport, ProctoringAnomalyRecord } from "@/types";

export default function NaacAccreditationCard() {
  const [report, setReport] = useState<NaacAccreditationReport | null>(null);
  const [anomalies, setAnomalies] = useState<ProctoringAnomalyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rep, anomRes] = await Promise.all([
          tpoApi.getNaacReport(),
          tpoApi.getProctoringAnomalies(),
        ]);
        setReport(rep);
        setAnomalies(anomRes.anomalies);
      } catch (err) {
        console.error("Failed to load NAAC report", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownloadCsv = async () => {
    if (!report) return;
    setDownloadingCsv(true);
    try {
      const blob = await tpoApi.downloadNaacCsv(report.cohort_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NAAC_Criterion_5_Accreditation_Report_${report.cohort_id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("CSV download failed", err);
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleResolveAnomaly = async (id: string) => {
    setResolvingId(id);
    try {
      await tpoApi.resolveProctoringAnomaly(id);
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
      );
    } catch (err) {
      console.error("Resolve failed", err);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading || !report) {
    return (
      <div className="p-8 text-center text-gray-400 bg-gray-900 border border-gray-800 rounded-xl">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
        <p className="text-sm">Calculating NAAC Criterion 5 accreditation metrics & competency deltas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top NAAC Accreditation Banner */}
      <div className="p-6 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  NAAC Criterion 5 Accreditation Intelligence
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                  Criterion 5.1.3 & 5.2.1
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Capability Enhancement, Student Progression & Verifiable Placement Competency Auditing for Academic Regulators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              disabled={downloadingCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingCsv ? "Exporting CSV..." : "Export NAAC Criterion 5 Audit CSV"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <span className="text-[11px] text-gray-400">Total Enrolled</span>
          <p className="text-xl font-bold text-white mt-1">{report.total_enrolled}</p>
          <span className="text-[10px] text-gray-500">{report.cohort_name}</span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <span className="text-[11px] text-gray-400">Baseline Readiness</span>
          <p className="text-xl font-bold text-gray-400 mt-1">{report.baseline_mean_readiness}%</p>
          <span className="text-[10px] text-gray-500">Pre-Intervention Mean</span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <span className="text-[11px] text-gray-400">Current Readiness</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{report.current_mean_readiness}%</p>
          <span className="text-[10px] text-gray-500">Post-Sprint Validated</span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Competency Growth
          </span>
          <p className="text-xl font-bold text-emerald-400 mt-1">+{report.competency_growth_percentage}%</p>
          <span className="text-[10px] text-emerald-500/80">Net Uplift Delta</span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <span className="text-[11px] text-gray-400">Deficit Remediation</span>
          <p className="text-xl font-bold text-purple-400 mt-1">{report.deficit_remediation_rate}%</p>
          <span className="text-[10px] text-gray-500">Gaps Closed Successfully</span>
        </div>

        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
          <span className="text-[11px] text-gray-400">Placement Ready</span>
          <p className="text-xl font-bold text-blue-400 mt-1">{report.tier_distribution.placement_ready_rate}%</p>
          <span className="text-[10px] text-gray-500">Job-Ready + Bridgeable</span>
        </div>
      </div>

      {/* Tier Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-emerald-300">Tier 1: Job-Ready (85%+ Readiness)</h4>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{report.tier_distribution.job_ready_count} <span className="text-xs text-gray-400 font-normal">Students</span></p>
          <p className="text-[11px] text-gray-400">
            Immediate placement readiness with zero critical skill deficits. Cleared for Tier-1 corporate drives.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-amber-300">Tier 2: Bridgeable (70-84% Readiness)</h4>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{report.tier_distribution.bridgeable_count} <span className="text-xs text-gray-400 font-normal">Students</span></p>
          <p className="text-[11px] text-gray-400">
            Rapidly remediable through 48h targeted gap sprints. Projected to reach Tier 1 within 1 sprint cycle.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-rose-300">Tier 3: Developing (Under 70% Readiness)</h4>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{report.tier_distribution.developing_count} <span className="text-xs text-gray-400 font-normal">Students</span></p>
          <p className="text-[11px] text-gray-400">
            Enrolled in mandatory institutional intervention sprints to close foundational coding and architecture gaps.
          </p>
        </div>
      </div>

      {/* Domain Competency Growth Breakdown Matrix */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">
              Programmatic Competency Domain Growth Matrix (NAAC 5.1.3 Audit Evidence)
            </h4>
          </div>
          <span className="text-xs text-gray-400">Pre vs Post-Intervention Benchmarking</span>
        </div>

        <div className="space-y-4">
          {report.domain_breakdowns.map((domain) => (
            <div key={domain.domain} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">{domain.domain}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-gray-400">Baseline: {domain.baseline_score}%</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-emerald-400 font-semibold">Current: {domain.current_score}%</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    +{domain.growth_percentage}%
                  </span>
                </div>
              </div>

              {/* Comparative Progress Bars */}
              <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className="bg-gray-600 h-full absolute top-0 left-0 rounded-full"
                  style={{ width: `${domain.baseline_score}%` }}
                />
                <div
                  className="bg-gradient-to-r from-emerald-500 to-purple-500 h-full absolute top-0 left-0 rounded-full opacity-90 transition-all"
                  style={{ width: `${domain.current_score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Integrity & Proctoring Anomaly Audit Trail */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-semibold text-white">
              Assessment Integrity & Proctoring Anomaly Audit Logs
            </h4>
          </div>
          <span className="text-xs text-gray-400">
            {anomalies.filter((a) => !a.resolved).length} Pending Review
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-6 text-center text-gray-500 border border-gray-800 rounded-lg">
            No proctoring anomalies flagged. All institutional tests adhered to strict academic integrity standards.
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  anom.resolved
                    ? "bg-gray-950/40 border-gray-800/60 opacity-60"
                    : anom.severity === "critical" || anom.severity === "high"
                    ? "bg-rose-950/20 border-rose-800/40"
                    : "bg-amber-950/20 border-amber-800/40"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-medium border ${
                        anom.severity === "critical"
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : anom.severity === "high"
                          ? "bg-orange-950 text-orange-300 border-orange-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <h5 className="text-xs font-semibold text-white">{anom.student_name}</h5>
                    <span className="text-xs text-gray-400 font-mono">({anom.anomaly_type.replace(/_/g, " ")})</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Session: <span className="font-mono text-gray-300">{anom.session_id}</span>
                    {anom.metadata && Object.keys(anom.metadata).length > 0 && (
                      <span className="ml-2 text-gray-500 font-mono">
                        {JSON.stringify(anom.metadata)}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:shrink-0">
                  {anom.resolved ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Audited & Cleared</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveAnomaly(anom.id)}
                      disabled={resolvingId === anom.id}
                      className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 hover:text-white border border-gray-700 transition-colors"
                    >
                      {resolvingId === anom.id ? "Resolving..." : "Mark Resolved"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Footnote */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300 leading-relaxed">
          <strong>Accreditation Compliance Notice:</strong> All competency growth percentages, baseline scores, and remediation records are cryptographically timestamped and ready for physical or virtual NAAC Peer Team inspection under Quality Indicator Framework (QIF) Criterion 5.
        </div>
      </div>
    </div>
  );
}
