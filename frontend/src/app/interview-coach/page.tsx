"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Video, ShieldCheck, Users } from "lucide-react";
import LiveInterviewStage from "@/components/interview/LiveInterviewStage";

export default function InterviewCoachPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      {/* Top Navbar */}
      <header className="border-b border-[#E5E5EA] bg-[#FBFBFD]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/student"
              className="flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Candidate Workspace
            </Link>
            <div className="h-4 w-px bg-[#E5E5EA]" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0071E3]/10 text-[#0071E3]">
                <Mic className="h-4 w-4" />
              </span>
              <h1 className="text-base font-semibold tracking-tight text-[#1D1D1F]">
                Multimodal AI Interview Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 font-semibold text-purple-700 hidden lg:flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Multi-Agent Panel
            </span>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 font-semibold text-[#0071E3] flex items-center gap-1">
              <Video className="h-3.5 w-3.5" /> Video & Audio Telemetry
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-semibold text-emerald-700 hidden sm:flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Objective Scoring
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
            Real-Time Technical Interview Simulator
          </h2>
          <p className="mt-1 text-sm text-[#6E6E73] max-w-3xl leading-relaxed">
            Practice technical problem-solving with adaptive conversational drills. Aspire AI measures
            speaking pace (WPM), pause distribution, eye-contact stability, and architectural taxonomy match in real time.
          </p>
        </div>

        <LiveInterviewStage />
      </main>
    </div>
  );
}
