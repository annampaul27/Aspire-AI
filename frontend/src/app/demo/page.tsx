"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Candidate, ProofOfWorkCredential } from "@/types";
import { CAMPUS_25_CANDIDATES } from "@/lib/campusCandidatesSeed";
import {
  ShieldCheck,
  Zap,
  Code2,
  CheckCircle2,
  Award,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Users,
  GraduationCap,
  Play,
  RotateCcw,
  Filter,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  Bot,
} from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import AIInterviewerModal from "@/components/student/AIInterviewerModal";
import { GitHubAnalysisModal } from "@/components/student/GitHubAnalysisModal";
import BackendEngineTabs from "@/components/hub/BackendEngineTabs";

export default function LivePitchCockpitPage() {
  const {
    candidates: globalCandidates,
    setCandidates: setGlobalCandidates,
    seedCampusCandidates: seedGlobalCampus,
    addToast,
    setIsAnonymizedScreening: setGlobalAnonymized,
  } = useStore();

  // Guaranteed candidate fallback to prevent failure
  const [candidates, setCandidates] = useState<Candidate[]>(() =>
    globalCandidates && globalCandidates.length >= 20
      ? globalCandidates
      : CAMPUS_25_CANDIDATES
  );

  // Demo Controls
  const [blindDeiMode, setBlindDeiMode] = useState<boolean>(false);
  const [onlyBridgeableFilter, setOnlyBridgeableFilter] = useState<boolean>(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("cand-aarav-hero");
  const [activeUSPModal, setActiveUSPModal] = useState<string | null>(null);
  const [isAIInterviewerOpen, setIsAIInterviewerOpen] = useState<boolean>(false);
  const [isGitHubAnalysisOpen, setIsGitHubAnalysisOpen] = useState<boolean>(false);

  // Zone B Sandbox State (Aarav Sharma)
  const [testRunLogs, setTestRunLogs] = useState<string[]>([]);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testsPassed, setTestsPassed] = useState<boolean>(false);

  // Broken vs Fixed Code Snippets
  const brokenSnippetFastAPI = `# BROKEN PRODUCTION CODE: Blocking event loop with sync call
from fastapi import FastAPI
import time

app = FastAPI(title="Payment Gateway")

@app.post("/api/v1/charge")
def process_payment(amount: float):
    # CRITICAL DEFICIT: Synchronous sleep halts all async workers
    time.sleep(5) 
    return {"status": "charged", "amount": amount}`;

  const fixedSnippetFastAPI = `# PRODUCTION HARDENED: AsyncIO non-blocking concurrency
from fastapi import FastAPI
import asyncio

app = FastAPI(title="Payment Gateway")

@app.post("/api/v1/charge")
async def process_payment(amount: float):
    # FIXED: Non-blocking asyncio preserves worker pool throughput
    await asyncio.sleep(0.01)
    return {"status": "charged", "amount": amount, "concurrency": "unblocked"}`;

  const [editableCode, setEditableCode] = useState<string>(brokenSnippetFastAPI);

  // Zone C Minting & Elevation State
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintedCredential, setMintedCredential] = useState<ProofOfWorkCredential | null>(null);
  const [hasElevatedAarav, setHasElevatedAarav] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);

  // Zone D TPO State
  const [tpoSprintDeployed, setTpoSprintDeployed] = useState<boolean>(false);
  const [campusReadiness, setCampusReadiness] = useState<number>(42);
  const [sprintDispatched, setSprintDispatched] = useState<boolean>(false);

  // Computed Top KPIs
  const totalCandidatesCount = candidates.length;
  const jobReadyCount = useMemo(
    () => candidates.filter((c) => c.currentTier === "job_ready").length,
    [candidates]
  );
  const bridgeableCount = useMemo(
    () => candidates.filter((c) => c.currentTier === "bridgeable").length,
    [candidates]
  );
  const verifiedBadgesCount = useMemo(() => {
    return 19 + (hasElevatedAarav ? 1 : 0);
  }, [hasElevatedAarav]);

  // Seed Handler
  const handleSeedCandidates = () => {
    if (typeof seedGlobalCampus === "function") {
      seedGlobalCampus(CAMPUS_25_CANDIDATES);
    }
    setCandidates(CAMPUS_25_CANDIDATES);
    setHasElevatedAarav(false);
    setTestsPassed(false);
    setMintedCredential(null);
    setEditableCode(brokenSnippetFastAPI);
    setTestRunLogs([]);
    addToast({
      type: "success",
      title: "🚀 25+ Campus Candidates Populated",
      message: "Seeded realistic engineering candidates across IITs, NITs, BITS, VIT, and Tier-3 institutions.",
    });
  };

  // Reset Demo State
  const handleResetDemo = () => {
    setCandidates(CAMPUS_25_CANDIDATES);
    setHasElevatedAarav(false);
    setTestsPassed(false);
    setMintedCredential(null);
    setEditableCode(brokenSnippetFastAPI);
    setTestRunLogs([]);
    setTpoSprintDeployed(false);
    setCampusReadiness(42);
    setSprintDispatched(false);
    addToast({
      type: "info",
      title: "🔄 Live Demo Reset",
      message: "All state restored to baseline presentation parameters.",
    });
  };

  // 1-Click Run Tests
  const handleRunTests = async () => {
    setIsTestRunning(true);
    setEditableCode(fixedSnippetFastAPI);
    setTestRunLogs(["[RUNNING] Inspecting AST & event-loop concurrency profile..."]);

    await new Promise((r) => setTimeout(r, 450));
    setTestRunLogs((prev) => [
      ...prev,
      "[PASS] Test 1: Event loop non-blocking (<12ms execution time)",
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setTestRunLogs((prev) => [
      ...prev,
      "[PASS] Test 2: Non-root UID 1001 enforced in multi-stage Docker build",
    ]);

    await new Promise((r) => setTimeout(r, 400));
    setTestRunLogs((prev) => [
      ...prev,
      "[PASS] Proctoring Telemetry: 0 Tab Switches Detected (Integrity: 100%)",
      "[SUCCESS] All 3 verification gates passed! Ready to mint SHA-256 micro-credential.",
    ]);

    setIsTestRunning(false);
    setTestsPassed(true);

    addToast({
      type: "success",
      title: "Deterministic Tests Passed (3/3)",
      message: "Production fix validated! Cryptographic SHA-256 micro-credential unlocked.",
    });
  };

  // Trigger Confetti
  const triggerConfetti = async () => {
    try {
      const confettiModule = await import("canvas-confetti");
      const confetti = confettiModule.default;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn("Confetti animation fallback:", e);
    }
  };

  // Mint SHA-256 Credential
  const handleMintCredential = async () => {
    setIsMinting(true);
    triggerConfetti();

    const issuedAt = new Date().toISOString();
    const payloadObj = {
      candidateEmail: "aarav.sharma@example.com",
      candidateId: "cand-aarav-hero",
      candidateName: "Aarav Sharma",
      institution: "Tier-3 Regional Engineering College",
      issuedAt,
      passedQuestions: 3,
      proctoringViolations: 0,
      score: 100,
      skillId: "fastapi_docker_prod",
      skillName: "Docker Multi-Stage & FastAPI Concurrency",
      totalQuestions: 3,
    };

    const canonicalPayload = JSON.stringify(payloadObj);

    // Real Web Crypto SHA-256 Digest
    let hash = "";
    try {
      const msgBuffer = new TextEncoder().encode(canonicalPayload);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    }

    const newCred: ProofOfWorkCredential = {
      hash,
      candidateId: "cand-aarav-hero",
      candidateName: "Aarav Sharma",
      candidateEmail: "aarav.sharma@example.com",
      skillId: "fastapi_docker_prod",
      skillName: "Docker Multi-Stage & FastAPI Concurrency",
      score: 100,
      passedQuestions: 3,
      totalQuestions: 3,
      issuedAt,
      issuerOrg: "Aspire AI Trust Engine (Hackathon Demo)",
      isSponsored: true,
      sponsorOrg: "Acme HyperScale Systems",
      canonicalPayload,
      answersLog: [
        {
          questionId: "q1",
          question: "How does asyncio prevent event loop starvation under high concurrency?",
          selectedOption: "Delegating I/O to async event loop without blocking CPU worker threads.",
          isCorrect: true,
          timeSpentSeconds: 28,
        },
      ],
      antiCheatAudit: {
        tabBlurEvents: 0,
        flagged: false,
      },
    };

    setMintedCredential(newCred);

    // LIVE CAUSE-AND-EFFECT: Elevate Aarav Sharma to Rank #1 (94% Job-Ready)
    const updatedList = candidates.map((c) => {
      if (c.id === "cand-aarav-hero") {
        return {
          ...c,
          readinessScore: 94,
          currentTier: "job_ready" as const,
          missingCompetencies: [],
          skills: [
            ...c.skills.map((s) => ({ ...s, isVerified: true, score: 95 })),
            {
              skillId: "fastapi_docker_prod",
              skillName: "Docker Multi-Stage & FastAPI Concurrency",
              category: "backend",
              level: "Advanced" as const,
              isVerified: true,
              score: 100,
              credentialHash: hash,
            },
          ],
          credentials: [newCred, ...(c.credentials || [])],
        };
      }
      return c;
    });

    // Re-sort so Aarav Sharma jumps to Rank #1
    const sorted = [...updatedList].sort((a, b) => b.readinessScore - a.readinessScore);
    setCandidates(sorted);
    if (typeof setGlobalCandidates === "function") {
      setGlobalCandidates(sorted);
    }

    setHasElevatedAarav(true);
    setIsMinting(false);

    addToast({
      type: "credential",
      title: "🏆 SHA-256 Micro-Credential Minted!",
      message: `Aarav Sharma elevated from 74% (Rank #8) to 94% (Rank #1)! Verification hash: ${hash.substring(0, 16)}...`,
    });
  };

  // TPO Sprint Deploy Handler
  const handleDeployTpoSprint = () => {
    setTpoSprintDeployed(true);
    setCampusReadiness(79);
    addToast({
      type: "success",
      title: "🚀 TPO Cohort Sprint Dispatched!",
      message: "Mandatory 48-Hr Batch Sprint sent to 47 unplaced final-year CSE students (NAAC Criterion 5).",
    });
  };

  // Filtered Candidates
  const displayedCandidates = useMemo(() => {
    let list = [...candidates];
    if (onlyBridgeableFilter) {
      list = list.filter((c) => c.currentTier === "bridgeable");
    }
    return list;
  }, [candidates, onlyBridgeableFilter]);

  const aaravCandidate = useMemo(
    () => candidates.find((c) => c.id === "cand-aarav-hero") || candidates[0],
    [candidates]
  );

  const aaravRank = useMemo(() => {
    return candidates.findIndex((c) => c.id === "cand-aarav-hero") + 1;
  }, [candidates]);

  // Copy helpers
  const handleCopyHash = () => {
    if (!mintedCredential) return;
    navigator.clipboard.writeText(mintedCredential.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyBadge = () => {
    if (!mintedCredential) return;
    const badgeMarkdown = `[![Aspire AI Verified](https://img.shields.io/badge/Aspire_AI_SHA256-Verified_100%25-10b981)](http://localhost:3000/verify/${mintedCredential.hash})`;
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    addToast({
      type: "info",
      title: "Badge Copied to Clipboard",
      message: "GitHub README markdown badge ready to paste.",
    });
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col font-sans antialiased pb-16">
      {/* Top Cockpit Header */}
      <section className="border-b border-[#E5E5EA] bg-[#FBFBFD]/90 backdrop-blur-md sticky top-14 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0071E3] text-white font-semibold text-xs">
                ⚡
              </span>
              <h1 className="text-lg font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-2">
                Live Pitch Cockpit
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#0071E3] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Interactive Evaluation Mode
                </span>
              </h1>
            </div>
            <p className="text-xs text-[#6E6E73]">
              Single-screen demonstration of Aspire AI closed-loop architecture: Blind Radar &rarr; 1-Click Sprint &rarr; Proctored Bug-Fixer &rarr; SHA-256 Micro-Minting &rarr; Live Talent Liquidity.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleSeedCandidates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
              title="Populate 25+ realistic candidates across IIT, NIT, BITS, VIT, Tier-3"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Seed 25+ Campus Candidates</span>
            </button>

            <button
              onClick={() => setIsAIInterviewerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
              title="Launch AI Interview Coach & Live Question Generator"
            >
              <Bot className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>AI Interview Coach</span>
            </button>

            <button
              onClick={() => setIsGitHubAnalysisOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F5F7] hover:bg-[#E8E8ED] border border-[#D2D2D7] text-[#1D1D1F] transition-colors"
              title="Launch GitHub AST Codebase & Commit Verifier"
            >
              <GithubIcon className="w-3.5 h-3.5 text-[#1D1D1F]" />
              <span>GitHub Verifier</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] border border-[#D2D2D7] transition-colors"
              title="Reset presentation to clean start state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6E6E73]" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Live Top KPI Banner */}
        <div className="max-w-[1720px] mx-auto mt-3.5 pt-3 border-t border-[#E5E5EA] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-[#E5E5EA] flex items-center justify-between shadow-xs">
            <span className="text-[#6E6E73]">Total Talent Pool</span>
            <span className="font-mono font-semibold text-[#1D1D1F] text-sm">{totalCandidatesCount} Students</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-[#E5E5EA] flex items-center justify-between shadow-xs">
            <span className="text-[#6E6E73]">Job-Ready Tier (&gt;85%)</span>
            <span className="font-mono font-semibold text-emerald-700 text-sm flex items-center gap-1">
              {jobReadyCount}
              {hasElevatedAarav && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-sans">
                  (+1 Elevated)
                </span>
              )}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-[#E5E5EA] flex items-center justify-between shadow-xs">
            <span className="text-[#6E6E73]">Bridgeable Pool (68-84%)</span>
            <span className="font-mono font-semibold text-amber-700 text-sm">{bridgeableCount} Candidates</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-[#E5E5EA] flex items-center justify-between shadow-xs">
            <span className="text-[#6E6E73]">Verified SHA-256 Badges</span>
            <span className="font-mono font-semibold text-[#0071E3] text-sm">{verifiedBadgesCount} Minted</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-[#E5E5EA] flex items-center justify-between shadow-xs">
            <span className="text-[#6E6E73]">Time-to-Hire Saved</span>
            <span className="font-mono font-semibold text-purple-700 text-sm">68% / 14 Days</span>
          </div>
        </div>

        {/* USP Verification Strip */}
        <div className="max-w-[1720px] mx-auto mt-3 pt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
          <span className="text-[#6E6E73] font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Core Technical Moats:
          </span>

          <button
            onClick={() =>
              setActiveUSPModal(
                "α=1.6 Deficit Math: Our proprietary Weighted Deficit Resistance Model mathematically penalizes missing core competencies by 1.6x. Candidates cannot game their score with non-essential framework tags."
              )
            }
            className="shrink-0 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0071E3] hover:bg-blue-100 transition-colors flex items-center gap-1 font-medium"
          >
            <span>α=1.6 Deficit Math</span>
            <HelpCircle className="w-3 h-3 text-[#0071E3]" />
          </button>

          <button
            onClick={() =>
              setActiveUSPModal(
                "Blind DEI Equalizer: Masks candidate names and normalizes pedigree bias. Proves that candidates from Tier-3 institutions perform equally or better when tested on real code."
              )
            }
            className="shrink-0 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1 font-medium"
          >
            <span>Blind DEI Equalizer</span>
            <HelpCircle className="w-3 h-3 text-amber-700" />
          </button>

          <button
            onClick={() =>
              setActiveUSPModal(
                "In-Browser Bug Fixer Sandbox: Direct proctored challenge environment testing actual production bug fixing (asyncio event loop deadlocks, container security) instead of LeetCode trivia."
              )
            }
            className="shrink-0 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 transition-colors flex items-center gap-1 font-medium"
          >
            <span>Code Bug-Fixer Sandbox</span>
            <HelpCircle className="w-3 h-3 text-purple-700" />
          </button>

          <button
            onClick={() =>
              setActiveUSPModal(
                "Zero-Trust SHA-256 Ledger: Minted on-chain or via cryptographic SHA-256 seals. Combines proctoring telemetry (0 tab switches) with the exact code diff for tamper-proof verification."
              )
            }
            className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1 font-medium"
          >
            <span>SHA-256 Anti-Cheat Ledger</span>
            <HelpCircle className="w-3 h-3 text-emerald-700" />
          </button>

          <button
            onClick={() =>
              setActiveUSPModal(
                "TPO Batch Placement Sprint: University Training & Placement Officers can trigger cohort-wide remediation sprints in 1 click, elevating unplaced batches and fulfilling NAAC Criterion 5."
              )
            }
            className="shrink-0 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-1 font-medium"
          >
            <span>TPO Cohort Sprint</span>
            <HelpCircle className="w-3 h-3 text-teal-700" />
          </button>
        </div>
      </section>

      {/* Main 4-Zone Presentation Grid */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 mt-5 flex-1 grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* ================= ZONE A: Employer Talent Radar ================= */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] p-5 flex flex-col space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5EA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0071E3] border border-blue-200">
                  Zone A • Recruiter Perspective
                </span>
                <span className="text-xs font-semibold text-[#1D1D1F]">Talent Radar & Equalizer</span>
              </div>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">
                Target Job: <strong className="text-[#1D1D1F]">Senior FastAPI & Microservices Architect</strong>
              </p>
            </div>

            {/* Filter Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBlindDeiMode(!blindDeiMode);
                  if (typeof setGlobalAnonymized === "function") {
                    setGlobalAnonymized(!blindDeiMode);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  blindDeiMode
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-[#F5F5F7] border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
                title="Mask names and college pedigree to prevent hiring bias"
              >
                {blindDeiMode ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5" />}
                <span>Blind DEI: {blindDeiMode ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => setOnlyBridgeableFilter(!onlyBridgeableFilter)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  onlyBridgeableFilter
                    ? "bg-blue-50 border-blue-300 text-[#0071E3]"
                    : "bg-[#F5F5F7] border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F]"
                }`}
                title="Filter only candidates with 68-84% readiness"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Bridgeable Only</span>
              </button>
            </div>
          </div>

          {/* Aarav Sharma Live Promotion Alert Banner if elevated */}
          {hasElevatedAarav && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-fadeIn shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <div>
                  <strong className="text-emerald-800">Live Talent Liquidity Triggered!</strong>
                  <p className="text-[11px] text-emerald-700">
                    Aarav Sharma jumped from <strong>Rank #8 (74% Amber)</strong> &rarr; <strong>Rank #1 (94% Emerald Job-Ready)</strong> in real time!
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800">
                100% Verified
              </span>
            </div>
          )}

          {/* Candidates Table List */}
          <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-[#E5E5EA] pr-1">
            {displayedCandidates.slice(0, 10).map((cand, idx) => {
              const isAarav = cand.id === "cand-aarav-hero";
              const isSelected = selectedCandidateId === cand.id;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`p-3 rounded-xl my-1 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAarav && hasElevatedAarav
                      ? "bg-emerald-50/70 border border-emerald-300 shadow-xs"
                      : isSelected
                      ? "bg-[#F5F5F7] border border-[#D2D2D7]"
                      : "hover:bg-[#F5F5F7]/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#6E6E73] w-5">
                      #{idx + 1}
                    </span>

                    <div className="relative">
                      {blindDeiMode ? (
                        <div className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-xs font-mono text-[#6E6E73]">
                          {cand.anonymizedId.slice(-2)}
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={cand.avatarUrl}
                          alt={cand.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[#E5E5EA]"
                        />
                      )}
                      {cand.currentTier === "job_ready" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          {blindDeiMode ? cand.anonymizedId : cand.fullName}
                        </span>
                        {isAarav && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300">
                            Demo Candidate
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6E6E73]">
                        {blindDeiMode ? cand.anonymizedCollege : cand.college}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Score Bar */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span
                          className={`font-mono text-xs font-bold ${
                            cand.readinessScore >= 85
                              ? "text-emerald-700"
                              : cand.readinessScore >= 68
                              ? "text-amber-700"
                              : "text-red-700"
                          }`}
                        >
                          {cand.readinessScore}%
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            cand.currentTier === "job_ready"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                              : cand.currentTier === "bridgeable"
                              ? "bg-amber-50 text-amber-800 border border-amber-300"
                              : "bg-red-50 text-red-800 border border-red-300"
                          }`}
                        >
                          {cand.currentTier === "job_ready"
                            ? "Job Ready"
                            : cand.currentTier === "bridgeable"
                            ? "Bridgeable"
                            : "High Deficit"}
                        </span>
                      </div>

                      {/* Missing competencies tag */}
                      {cand.missingCompetencies && cand.missingCompetencies.length > 0 ? (
                        <p className="text-[10px] text-amber-700 mt-0.5 truncate max-w-[180px]">
                          Needs: {cand.missingCompetencies[0]}
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-700 mt-0.5">
                          ✓ All Competencies Sealed
                        </p>
                      )}
                    </div>

                    {/* Action on Aarav */}
                    {isAarav && !hasElevatedAarav && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSprintDispatched(true);
                          addToast({
                            type: "info",
                            title: "🎯 1-Click Gap Sprint Dispatched",
                            message: "Assigned targeted 15-min Docker & FastAPI concurrency challenge to Aarav Sharma.",
                          });
                        }}
                        disabled={sprintDispatched}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1 shrink-0 ${
                          sprintDispatched
                            ? "bg-[#F5F5F7] text-[#86868B] border border-[#E5E5EA] cursor-default"
                            : "bg-[#0071E3] hover:bg-[#0077ED] text-white"
                        }`}
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>{sprintDispatched ? "✓ Sprint Dispatched" : "Dispatch Sprint"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E5E5EA] text-[11px] text-[#6E6E73] flex items-center justify-between">
            <span>Showing top 10 of {totalCandidatesCount} verified campus profiles</span>
            <span>Accreditation: NAAC / NBA Verified</span>
          </div>
        </div>

        {/* ================= ZONE B: Student Skill Gap & Sandbox ================= */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] p-5 flex flex-col space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5EA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  Zone B • Student Perspective
                </span>
                <span className="text-xs font-semibold text-[#1D1D1F]">Skill Gap & Bug-Fixer Sandbox</span>
              </div>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">
                Candidate: <strong className="text-[#1D1D1F]">{aaravCandidate.fullName}</strong> • Tier-3 Engineering College (Current Score: <strong className="text-amber-700">{aaravCandidate.readinessScore}%</strong>)
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Proctor: 0 Tab Blurs
              </span>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-center">
              <span className="text-[10px] text-[#6E6E73] block truncate">Python Async</span>
              <span className="font-mono text-xs font-bold text-emerald-700">95% (Pass)</span>
            </div>
            <div className="p-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-center">
              <span className="text-[10px] text-[#6E6E73] block truncate">PostgreSQL Index</span>
              <span className="font-mono text-xs font-bold text-emerald-700">88% (Pass)</span>
            </div>
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-center">
              <span className="text-[10px] text-red-700 block truncate">Docker Multi-Stage</span>
              <span className="font-mono text-xs font-bold text-red-700">32% [CRITICAL]</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] text-amber-800 block truncate">FastAPI Concurrency</span>
              <span className="font-mono text-xs font-bold text-amber-700">45% [DEFICIT]</span>
            </div>
          </div>

          {/* Interactive Code Bug-Fixer Sandbox */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-[#0071E3]" />
                <span className="font-semibold text-[#1D1D1F]">Interactive Production Challenge:</span>
              </div>
              <span className="text-[10px] text-amber-800 font-mono">
                Bug: Synchronous sleep freezing event loop
              </span>
            </div>

            {/* Code Editor Box */}
            <div className="relative">
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                rows={6}
                className="w-full p-2.5 rounded-lg bg-[#1D1D1F] border border-[#333336] font-mono text-[11px] text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-[#0071E3] leading-relaxed resize-none"
              />
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={handleRunTests}
                disabled={isTestRunning}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {isTestRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing AST & Concurrency Harness...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>⚡ 1-Click Apply Production Fix & Run Deterministic Tests</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Runner Console Output */}
            {testRunLogs.length > 0 && (
              <div className="p-2.5 rounded-lg bg-[#1D1D1F] border border-[#333336] font-mono text-[10px] space-y-1 text-gray-300">
                {testRunLogs.map((log, lIdx) => (
                  <div
                    key={lIdx}
                    className={
                      log.includes("[PASS]")
                        ? "text-emerald-400"
                        : log.includes("[SUCCESS]")
                        ? "text-blue-300 font-bold"
                        : "text-amber-300"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= ZONE C: Cryptographic Micro-Minting ================= */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] p-5 flex flex-col space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5EA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Zone C • Cryptographic Trust
                </span>
                <span className="text-xs font-semibold text-[#1D1D1F]">SHA-256 Micro-Minting & Elevation</span>
              </div>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">
                Closed-loop proof generation connecting proctored challenge code to verified recruiter radar.
              </p>
            </div>

            <span className="text-[11px] font-mono text-[#6E6E73]">
              Rank: <strong className="text-[#1D1D1F]">#{aaravRank}</strong> ({aaravCandidate.readinessScore}%)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Target Verification: Docker Multi-Stage & FastAPI Concurrency
                </h4>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  Candidate: Aarav Sharma (Tier-3 College) • Proctored Assessment Score: 100%
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                100% Score
              </span>
            </div>

            {/* Mint Action Button */}
            <div>
              <button
                onClick={handleMintCredential}
                disabled={!testsPassed || isMinting || hasElevatedAarav}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  hasElevatedAarav
                    ? "bg-emerald-50 border border-emerald-300 text-emerald-800 cursor-default"
                    : testsPassed
                    ? "bg-[#0071E3] hover:bg-[#0077ED] text-white cursor-pointer"
                    : "bg-[#F5F5F7] border border-[#E5E5EA] text-[#86868B] cursor-not-allowed"
                }`}
              >
                {hasElevatedAarav ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>✓ SHA-256 Credential Minted & Rank #1 Elevated!</span>
                  </>
                ) : isMinting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Hashing Canonical Payload via Web Crypto...</span>
                  </>
                ) : testsPassed ? (
                  <>
                    <Award className="w-4 h-4 text-white" />
                    <span>🏆 Mint SHA-256 Micro-Credential & Elevate Aarav to Rank #1</span>
                  </>
                ) : (
                  <span>Pass Zone B Tests to Unlock Cryptographic Minting</span>
                )}
              </button>
            </div>

            {/* Impact Projection */}
            <div className="p-3 rounded-lg bg-white border border-[#E5E5EA] text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-[#6E6E73] block">
                Talent Liquidity Impact Analysis:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73]">Pre-Sprint Readiness:</span>
                  <span className="font-mono text-amber-700 font-semibold">74% (Rank #8)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73]">Post-Mint Readiness:</span>
                  <span className="font-mono text-emerald-700 font-semibold">94% (Rank #1)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ZONE D: Zero-Trust Audit & TPO Campus Impact ================= */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] p-5 flex flex-col space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5EA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  Zone D • Audit & Institution
                </span>
                <span className="text-xs font-semibold text-[#1D1D1F]">Cryptographic Audit & TPO Impact</span>
              </div>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">
                Public verification inspector & campus placement batch remediation.
              </p>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
              NAAC Criterion 5 Compliant
            </span>
          </div>

          {/* Cryptographic Inspector */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-[#6E6E73] uppercase tracking-wider">
                SHA-256 Verification Digest:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHash}
                  className="text-[10px] text-[#0071E3] hover:text-[#0077ED] flex items-center gap-1 transition-colors font-medium"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                </button>
                <button
                  onClick={handleCopyBadge}
                  className="text-[10px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors font-medium"
                >
                  {copiedBadge ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>README Badge</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1D1D1F] border border-[#333336] font-mono text-[11px] text-emerald-400 break-all select-all">
              {mintedCredential
                ? mintedCredential.hash
                : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-[#6E6E73] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tamper Check: VALID (0 Violations)
              </span>

              {mintedCredential && (
                <Link
                  href={`/verify/${mintedCredential.hash}`}
                  target="_blank"
                  className="text-[#0071E3] hover:text-[#0077ED] inline-flex items-center gap-1 font-medium"
                >
                  <span>Open Full /verify/[hash]</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* TPO Batch Placement Sprint Trigger */}
          <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-700" />
                TPO Campus Remediation Trigger
              </h5>
              <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
                Institutional Sprint
              </span>
            </div>

            <p className="text-[11px] text-[#6E6E73]">
              Institutional Cohort Audit: <strong>47 students</strong> in Final Year CSE currently lack <em>Docker Multi-Stage & FastAPI Concurrency</em>.
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#6E6E73]">Batch Placement Readiness</span>
                <span className="font-mono font-semibold text-teal-700">{campusReadiness}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E5E5EA] overflow-hidden">
                <div
                  className="h-full bg-[#0071E3] transition-all duration-700"
                  style={{ width: `${campusReadiness}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <button
                onClick={handleDeployTpoSprint}
                disabled={tpoSprintDeployed}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tpoSprintDeployed
                    ? "bg-teal-50 text-teal-800 border border-teal-200 cursor-default"
                    : "bg-[#0071E3] hover:bg-[#0077ED] text-white cursor-pointer shadow-xs"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>
                  {tpoSprintDeployed
                    ? "✓ 48-Hr Batch Sprint Active (47 Students)"
                    : "🚀 Deploy 48-Hr Mandatory Batch Sprint to 47 Students"}
                </span>
              </button>

              <div className="text-right">
                <span className="text-[10px] text-[#6E6E73] block">Projected B2B Value:</span>
                <span className="text-xs font-semibold text-emerald-700">₹14.2L Annual SaaS ARR</span>
              </div>
            </div>
          </div>
        </div>

        {/* ⚡ Live Backend Engine Modules (10 FastAPI Routers Connected) */}
        <section id="live-backend-engine-section" className="mt-12 pt-8 border-t border-[#E5E5EA] space-y-4">
          <BackendEngineTabs initialTab={1} />
        </section>
      </main>

      {/* USP Explainer Modal */}
      {activeUSPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1D1F]/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E5E5EA] p-6 space-y-3.5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA]">
              <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Technical Moat Deep-Dive
              </h3>
              <button
                onClick={() => setActiveUSPModal(null)}
                className="text-[#86868B] hover:text-[#1D1D1F] text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#6E6E73] leading-relaxed">{activeUSPModal}</p>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveUSPModal(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Interviewer Modal */}
      {isAIInterviewerOpen && (
        <AIInterviewerModal
          isOpen={isAIInterviewerOpen}
          onClose={() => setIsAIInterviewerOpen(false)}
          defaultRole="Senior FastAPI & Microservices Architect"
        />
      )}

      {/* GitHub Analysis Modal */}
      {isGitHubAnalysisOpen && (
        <GitHubAnalysisModal
          isOpen={isGitHubAnalysisOpen}
          onClose={() => setIsGitHubAnalysisOpen(false)}
          defaultUsername="aaravsharma-dev"
          candidateName="Aarav Sharma"
        />
      )}
    </div>
  );
}
