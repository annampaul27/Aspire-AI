"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import {
  Compass,
  Clock,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sparkles,
  BookOpen,
  Layers,
} from "lucide-react";

interface RoadmapPhase {
  phase: number;
  skill: string;
  title: string;
  current_level: string;
  required_level: string;
  course: {
    path: string;
    duration_minutes: number;
  };
  course_content?: Record<string, unknown>;
  lessons: Array<{
    title: string;
    duration_minutes: number;
  }>;
  mock_test: {
    question_count: number;
    duration_minutes: number;
    passing_score: number;
  };
  goal: string;
}

interface DynamicRoadmapData {
  roadmap_title: string;
  total_course_duration_hours: number;
  total_course_duration_minutes: number;
  skill_gap_count: number;
  available_course_count: number;
  phases: RoadmapPhase[];
  external_learning: Array<{ skill: string; message: string }>;
  completion_rule: {
    course_completion: string;
    mock_test: string;
    mock_test_duration_minutes: number;
    passing_score: number;
  };
}

interface ReadinessRoadmapProps {
  onLaunchSprint: (skillId: string) => void;
}

export default function ReadinessRoadmap({ onLaunchSprint }: ReadinessRoadmapProps) {
  const { currentStudent, activeJob, addToast } = useStore();
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [dynamicRoadmap, setDynamicRoadmap] = useState<DynamicRoadmapData | null>(null);

  const targetJob = activeJob;
  if (!targetJob) return null;

  // Collect missing or unverified skills sorted by weight descending
  const roadmapSteps = targetJob.criticalSkills
    .concat(targetJob.optionalSkills)
    .map((skill) => {
      const studentSkill = currentStudent.skills.find(
        (s) =>
          s.skillId === skill.id ||
          s.skillName.toLowerCase() === skill.name.toLowerCase()
      );
      const isCompleted = studentSkill?.isVerified || false;
      return {
        skill,
        isCompleted,
        score: studentSkill?.score,
        hash: studentSkill?.credentialHash,
      };
    })
    .sort((a, b) => {
      // Critical skills first, then incomplete first
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return b.skill.weight - a.skill.weight;
    });

  const completedSteps = roadmapSteps.filter((s) => s.isCompleted);
  const progressPercent = Math.round(
    (completedSteps.length / roadmapSteps.length) * 100
  );

  // Time estimate: ~10 minutes per incomplete sprint
  const incompleteSteps = roadmapSteps.filter((s) => !s.isCompleted);
  const totalEstMinutes = incompleteSteps.length * 10;

  const handleRefreshFit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/fit-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: currentStudent.id,
          job_id: targetJob.id,
          verified_skills: currentStudent.skills
            .filter((s) => s.isVerified)
            .map((s) => ({
              skill_id: s.skillId,
              skill_name: s.skillName,
              score: s.score,
              weight: 1.0,
            })),
          unverified_skills: currentStudent.skills
            .filter((s) => !s.isVerified)
            .map((s) => ({
              skill_id: s.skillId,
              skill_name: s.skillName,
              score: s.score,
              weight: 0.5,
            })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addToast({
          type: "success",
          title: "Fit Score Re-calculated",
          message: `Updated fit: ${data.overall_score}% (${data.readiness_tier.replace("_", "-").toUpperCase()}). Deficit: ${data.critical_deficits_count} critical gaps.`,
        });
      }
    } catch (e) {
      console.warn("Fit-score recalculation failed:", e);
      addToast({
        type: "info",
        title: "Fit Checked",
        message: `Current readiness remains at ${currentStudent.readinessScore}%.`,
      });
    }
  };

  const handleGenerateAICurriculum = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const missingSkills = roadmapSteps
        .filter((s) => !s.isCompleted)
        .map((s) => s.skill.name);

      const res = await fetch("http://localhost:8000/api/v1/roadmaps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: currentStudent.id,
          job_title: targetJob.title,
          missing_skills: missingSkills.length > 0 ? missingSkills : ["PostgreSQL", "Docker", "FastAPI"],
          current_score: currentStudent.readinessScore,
          target_score: targetJob.passThreshold,
        }),
      });

      if (res.ok) {
        const data: DynamicRoadmapData = await res.json();
        setDynamicRoadmap(data);
        addToast({
          type: "success",
          title: "AI Career Curriculum Generated",
          message: `Linked ${data.phases?.length || 0} course modules from catalogue. Total duration: ~${data.total_course_duration_hours || 0} hrs.`,
        });
      } else {
        throw new Error("Backend response error");
      }
    } catch (err) {
      console.warn("Failed to generate dynamic curriculum:", err);
      addToast({
        type: "warning",
        title: "Curriculum Generation Note",
        message: "Course server offline, using local competency checkpoints.",
      });
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Application Readiness Report Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-4 h-4 text-[#0071E3]" />
              <span className="text-xs uppercase text-[#0071E3] font-semibold tracking-wider">
                Application Readiness Report
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F]">
              Target Roadmap: {targetJob.title}
            </h3>
            <p className="text-xs text-[#6E6E73] mt-1 max-w-2xl leading-relaxed">
              Complete the sequenced skill modules below to advance your profile into the{" "}
              <strong className="text-emerald-700">Job-Ready tier (&ge;85%)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleGenerateAICurriculum}
              disabled={isGeneratingRoadmap}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingRoadmap ? "animate-spin" : ""}`} />
              <span>{isGeneratingRoadmap ? "Synthesizing..." : "Generate Dynamic AI Curriculum"}</span>
            </button>
            <button
              onClick={handleRefreshFit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5F5F7] border border-[#D2D2D7] text-xs font-medium text-[#1D1D1F] hover:bg-[#E8E8ED] transition-colors"
              title="Re-check fit score without re-uploading resume"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Re-check Fit</span>
            </button>
          </div>
        </div>

        {/* Progress & Time Estimate Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#E5E5EA]">
          <div className="p-3 bg-[#F5F5F7] rounded-xl">
            <span className="text-[11px] text-[#6E6E73] uppercase block font-medium">
              Roadmap Progress
            </span>
            <p className="text-lg font-bold font-mono text-[#0071E3] mt-0.5">
              {completedSteps.length} / {roadmapSteps.length} Completed ({progressPercent}%)
            </p>
          </div>
          <div className="p-3 bg-[#F5F5F7] rounded-xl">
            <span className="text-[11px] text-[#6E6E73] uppercase block font-medium">
              Est. Time to Job-Ready
            </span>
            <p className="text-lg font-bold font-mono text-amber-700 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              {totalEstMinutes > 0 ? `~${totalEstMinutes} mins` : "0 mins (Ready)"}
            </p>
          </div>
          <div className="p-3 bg-[#F5F5F7] rounded-xl">
            <span className="text-[11px] text-[#6E6E73] uppercase block font-medium">
              Current Benchmark
            </span>
            <p
              className={`text-lg font-bold font-mono mt-0.5 ${
                currentStudent.readinessScore >= 85
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
            >
              {currentStudent.readinessScore}% ({currentStudent.currentTier.replace("_", "-").toUpperCase()})
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic AI Course Curriculum & Modules (Catalog-Backed) */}
      {dynamicRoadmap && (
        <div className="rounded-2xl bg-white border border-[#E5E5EA] p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5EA]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#0071E3]" />
                <span className="text-xs uppercase text-[#0071E3] font-semibold tracking-wider">
                  AI Dynamic Course Catalog Curriculum
                </span>
              </div>
              <h4 className="text-base font-semibold text-[#1D1D1F]">
                {dynamicRoadmap.roadmap_title}
              </h4>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Curriculum dynamically synthesized from CareerCompass course catalog.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] font-mono text-xs font-semibold">
                {dynamicRoadmap.total_course_duration_hours} hrs Total
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
                {dynamicRoadmap.phases.length} Course Modules
              </span>
            </div>
          </div>

          {/* Phase Cards */}
          <div className="space-y-4">
            {dynamicRoadmap.phases.map((phase) => (
              <div
                key={phase.phase}
                className="p-5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0071E3] text-white flex items-center justify-center font-mono text-xs font-bold">
                      P{phase.phase}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2">
                        {phase.title}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E5E5EA] text-[#6E6E73]">
                          {phase.course.duration_minutes} mins
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#6E6E73]">
                    <span className="px-2 py-0.5 rounded bg-white border border-[#E5E5EA] text-[#1D1D1F]">
                      Mock Test: {phase.mock_test.question_count} Qs (&ge;{phase.mock_test.passing_score}%)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#424245] pl-9">
                  {phase.goal}
                </p>

                {/* Lessons breakdown */}
                {phase.lessons && phase.lessons.length > 0 && (
                  <div className="pl-9 pt-3 border-t border-[#E5E5EA]">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6E6E73] block mb-2">
                      Syllabus Lessons ({phase.lessons.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {phase.lessons.map((lesson, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F]"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
                          <span className="truncate">{lesson.title}</span>
                          <span className="ml-auto text-[10px] font-mono text-[#6E6E73] shrink-0">
                            {lesson.duration_minutes}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* External Learning Guidance if applicable */}
          {dynamicRoadmap.external_learning && dynamicRoadmap.external_learning.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-900">
                  Supplementary External Specializations
                </strong>
                <span>
                  The following skill gaps require external production capstones:{" "}
                  {dynamicRoadmap.external_learning.map((e) => e.skill).join(", ")}.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sequenced Roadmap Steps */}
      <div className="rounded-2xl bg-white border border-[#E5E5EA] shadow-sm p-6 space-y-4">
        <h4 className="text-xs uppercase font-semibold tracking-wider text-[#6E6E73]">
          Sequenced Competency Steps (Priority Ranked)
        </h4>

        <div className="space-y-3">
          {roadmapSteps.map((step, idx) => {
            const isCritical = step.skill.isCritical;

            return (
              <div
                key={step.skill.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  step.isCompleted
                    ? "bg-emerald-50/50 border-emerald-200"
                    : isCritical
                    ? "bg-[#F5F5F7] border-[#E5E5EA] hover:border-[#D2D2D7]"
                    : "bg-white border-[#E5E5EA]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      step.isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-[#1D1D1F] text-white"
                    }`}
                  >
                    {step.isCompleted ? "✓" : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-xs text-[#1D1D1F]">
                        {step.skill.name}
                      </h5>
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
                    <p className="text-xs text-[#6E6E73] mt-1">
                      {step.isCompleted
                        ? `Verified credential issued (${step.score}% score)`
                        : "Target deficit gap. Closing this unlocks direct application readiness."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {step.isCompleted ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Passed
                    </span>
                  ) : (
                    <button
                      onClick={() => onLaunchSprint(step.skill.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Launch 10-Min Sprint</span>
                    </button>
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
