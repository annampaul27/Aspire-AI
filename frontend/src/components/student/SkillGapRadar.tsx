"use client";

import React from "react";
import { useStore } from "@/lib/store";
import {
  Target,
  ShieldCheck,
  AlertCircle,
  Zap,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface SkillGapRadarProps {
  onLaunchSprint: (skillId: string) => void;
}

export default function SkillGapRadar({ onLaunchSprint }: SkillGapRadarProps) {
  const {
    jobs,
    activeJobId,
    setActiveJobId,
    activeJob,
    currentStudent,
    addToast,
  } = useStore();

  const targetJob = activeJob || jobs[0];

  // Map all skills required by the job against candidate's verified skills
  const allReqSkills = [...targetJob.criticalSkills, ...targetJob.optionalSkills];

  const skillDeltas = allReqSkills.map((req) => {
    const studentSkill = currentStudent.skills.find(
      (s) =>
        s.skillId === req.id ||
        s.skillName.toLowerCase() === req.name.toLowerCase()
    );

    let status: "verified" | "unverified" | "missing" = "missing";
    if (studentSkill) {
      status = studentSkill.isVerified ? "verified" : "unverified";
    }

    return {
      skill: req,
      status,
      score: studentSkill?.score,
      hash: studentSkill?.credentialHash,
    };
  });

  const verifiedCount = skillDeltas.filter((d) => d.status === "verified").length;
  const isJobReady = currentStudent.readinessScore >= targetJob.passThreshold;

  const handleApply = () => {
    if (isJobReady) {
      addToast({
        type: "success",
        title: "Application Submitted",
        message: `Your verified profile (Score: ${currentStudent.readinessScore}%) has been submitted for ${targetJob.title}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Role Selector & High-Level Match Bar */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Target className="w-4 h-4 text-[#0071E3]" />
              <span className="text-xs uppercase text-[#0071E3] font-semibold tracking-wider">
                Target Role Benchmark
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={activeJobId}
                onChange={(e) => setActiveJobId(e.target.value)}
                className="bg-[#F5F5F7] border border-[#D2D2D7] text-[#1D1D1F] font-medium text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} • {j.salaryRange}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-[#6E6E73] mt-2 leading-relaxed">
              Benchmarked against active job requisitions. Direct apply threshold:{" "}
              <strong className="text-[#1D1D1F] font-mono">{targetJob.passThreshold}%</strong>
            </p>
          </div>

          {/* Current Fit Score & Direct Apply Gate */}
          <div className="flex items-center gap-4 bg-[#F5F5F7] p-4 rounded-xl border border-[#E5E5EA] shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-[#6E6E73] uppercase block font-medium">
                Job Readiness Fit
              </span>
              <span
                className={`text-2xl font-bold font-mono ${
                  isJobReady
                    ? "text-emerald-700"
                    : currentStudent.readinessScore >= 60
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {currentStudent.readinessScore}%
              </span>
              <span
                className={`text-[10px] font-mono uppercase block font-semibold ${
                  isJobReady ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {currentStudent.currentTier.replace("_", " ")}
              </span>
              <span className="text-[10px] text-[#6E6E73] block font-mono">
                {verifiedCount}/{skillDeltas.length} Verified
              </span>
            </div>

            <div>
              {isJobReady ? (
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white text-[#86868B] border border-[#D2D2D7] cursor-not-allowed"
                  title="Restricted to ≥85% Job-Ready tier. Close remaining gaps to unlock direct apply."
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Apply Locked (&ge;85%)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Skill Gap Delta Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase font-semibold tracking-wider text-[#6E6E73]">
            Skill Gap Breakdown
          </h4>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Verified
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Self-Reported
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Missing Gap
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillDeltas.map((item) => {
            const isCritical = item.skill.isCritical;
            const isVerified = item.status === "verified";
            const isUnverified = item.status === "unverified";

            return (
              <div
                key={item.skill.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white ${
                  isVerified
                    ? "border-emerald-200 shadow-xs"
                    : isUnverified
                    ? "border-amber-200 shadow-xs"
                    : "border-[#E5E5EA] shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#1D1D1F]">
                          {item.skill.name}
                        </span>
                        {isCritical ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0071E3] border border-blue-200 font-medium">
                            Critical (3.0)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73]">
                            Optional (1.0)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6E6E73] capitalize block mt-1">
                        Category: {item.skill.category.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-right">
                      {isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified ({item.score}%)
                        </span>
                      ) : isUnverified ? (
                        <span className="text-xs text-amber-700 flex items-center gap-1 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3.5 h-3.5" /> Unverified
                        </span>
                      ) : (
                        <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full">
                          Missing Gap
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6E73] mt-2.5 leading-relaxed">
                    {isVerified
                      ? "Verified credential active. Contributes positive weight to your job readiness match."
                      : isUnverified
                      ? "Declared on resume, but lacks verified proof. Complete the 10-minute sprint to verify."
                      : "Required by target employer benchmark. Complete the 10-minute sprint to bridge this gap."}
                  </p>
                </div>

                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
                  {isVerified ? (
                    <span className="text-xs font-mono text-[#6E6E73] truncate max-w-[200px]">
                      Hash: {item.hash?.slice(0, 14)}...
                    </span>
                  ) : (
                    <button
                      onClick={() => onLaunchSprint(item.skill.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Start 10-Min Sprint</span>
                    </button>
                  )}

                  {!isVerified && (
                    <span className="text-xs text-[#6E6E73]">~10 mins</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
