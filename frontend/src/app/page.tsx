"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

export default function HomePage() {
  const { credentials, isAuthenticated, currentUser } = useStore();
  const mounted = useMounted();

  const defaultHash =
    credentials[0]?.hash ||
    "a4f89d3810c92bf2234e405e6081297e68cfb939e6a0d0a52479e0237d45f3ba";

  const [inputHash, setInputHash] = useState(defaultHash);
  const [activeTab, setActiveTab] = useState<"payload" | "verification" | "sandbox">("payload");

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0071E3]" />
            <span>Aspire AI Platform 2.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.08]">
            Verifiable skill credentials. Built for engineering teams and candidates.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#6E6E73] font-normal leading-relaxed max-w-2xl">
            Aspire AI tests technical candidates in isolated code sandboxes, measures acoustic interview telemetry, and issues tamper-evident SHA-256 credentials that require zero third-party verification lookups.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {mounted && isAuthenticated && currentUser ? (
              <>
                <Link
                  href={
                    currentUser.role === "student"
                      ? "/student"
                      : currentUser.role === "employer"
                      ? "/employer"
                      : "/admin"
                  }
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
                >
                  Open {currentUser.role === "student" ? "Candidate Workspace" : currentUser.role === "employer" ? "Hiring Console" : "Governance Portal"}
                </Link>
                <Link
                  href={`/verify/${defaultHash}`}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] border border-[#D2D2D7] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
                >
                  Inspect Sample Credential
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/student"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[#0071E3] text-white hover:bg-[#0077ED] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
                >
                  Candidate Workspace
                </Link>
                <Link
                  href="/employer"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] border border-[#D2D2D7] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
                >
                  Employer ATS Console
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
                >
                  University TPO Governance &rarr;
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Live Hash Verification Quick Bar */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm max-w-3xl">
          <label htmlFor="hash-verify-input" className="block text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-2">
            Instant SHA-256 Credential Hash Verification
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="hash-verify-input"
              type="text"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              placeholder="Paste 64-character hexadecimal SHA-256 hash"
              className="flex-1 px-3 py-2 rounded-lg bg-[#F5F5F7] border border-[#D2D2D7] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent"
              spellCheck={false}
            />
            <Link
              href={`/verify/${encodeURIComponent(inputHash.trim() || defaultHash)}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#1D1D1F] text-white text-xs font-medium hover:bg-[#333336] transition-colors"
            >
              Verify Ledger
            </Link>
          </div>
          <p className="mt-2 text-[11px] text-[#6E6E73]">
            Try verified sample: <button type="button" onClick={() => setInputHash(defaultHash)} className="text-[#0071E3] hover:underline font-mono">{defaultHash.substring(0, 16)}...</button>
          </p>
        </div>
      </section>

      {/* Primary Product Proof: The Credential & Sandbox Engine */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E5E5EA]">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3]">
            Architectural Verification
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">
            Cryptographic proof without vendor lock-in.
          </h2>
          <p className="mt-3 text-base text-[#6E6E73] max-w-2xl leading-relaxed">
            Every candidate assessment compiles down to a deterministic canonical JSON representation. Recipient organizations can audit the SHA-256 digest offline using standard POSIX tools or OpenSSL.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("payload")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "payload"
                ? "bg-[#1D1D1F] text-white"
                : "bg-transparent text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            Canonical Payload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "verification"
                ? "bg-[#1D1D1F] text-white"
                : "bg-transparent text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            Verification Output
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === "sandbox"
                ? "bg-[#1D1D1F] text-white"
                : "bg-transparent text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            Sandbox Telemetry
          </button>
        </div>

        {/* Interactive Inspection Frame */}
        <div className="rounded-2xl bg-white border border-[#E5E5EA] p-6 shadow-sm overflow-hidden font-mono text-xs">
          {activeTab === "payload" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#6E6E73] border-b border-[#F5F5F7] pb-2 font-sans text-xs">
                <span>canonical_payload.json</span>
                <span className="text-[#0071E3] font-mono">Format: RFC 8785 Canonical JSON</span>
              </div>
              <pre className="text-[#1D1D1F] leading-relaxed overflow-x-auto p-4 bg-[#F5F5F7] rounded-xl">
{`{
  "authority": "Aspire AI Institutional Ledger",
  "candidate_identifier": "usr_99f2a08",
  "certificate_id": "CERT-2026-SQL-9482",
  "evaluation_context": {
    "engine": "PostgreSQL Query Optimization",
    "execution_time_ms": 4.8,
    "memory_footprint_mb": 18.2,
    "percentile": 96.4,
    "score": 94.2
  },
  "issued_timestamp_utc": "2026-10-18T10:00:00Z",
  "key_fingerprint": "SHA256:4d80a1c1d8c11e69fe90264b38bfd2e6",
  "tamper_digest": "${defaultHash}"
}`}
              </pre>
              <p className="font-sans text-xs text-[#6E6E73] pt-2">
                This canonical string produces an identical SHA-256 hash across Python, Node.js, Go, or Rust runtimes.
              </p>
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#6E6E73] border-b border-[#F5F5F7] pb-2 font-sans text-xs">
                <span>Ledger Audit Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Cryptographically Intact
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-4 rounded-xl bg-[#F5F5F7] space-y-2">
                  <span className="text-[#6E6E73] font-medium block">Digest Consistency</span>
                  <p className="text-[#1D1D1F]">
                    Computed SHA-256 over raw payload matches the certified blockchain ledger entry exactly.
                  </p>
                  <span className="font-mono text-[11px] text-[#0071E3] break-all block">
                    {defaultHash}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F5F7] space-y-2">
                  <span className="text-[#6E6E73] font-medium block">Key Revocation Status</span>
                  <p className="text-[#1D1D1F]">
                    Signing authority certificate active. Zero revocation markers reported by CRL or OCSP responders.
                  </p>
                  <span className="text-emerald-700 font-semibold block">
                    Valid through December 2027
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sandbox" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[#6E6E73] border-b border-[#F5F5F7] pb-2 font-sans text-xs">
                <span>Containerized gVisor Sandbox</span>
                <span className="text-[#1D1D1F] font-mono">Status: Terminated cleanly (0)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="p-3 bg-[#F5F5F7] rounded-xl">
                  <span className="text-[#6E6E73] text-[11px] block">CPU Budget</span>
                  <span className="text-lg font-semibold text-[#1D1D1F]">2.0 vCPU</span>
                  <span className="text-[11px] text-emerald-700 block">Peak 18%</span>
                </div>
                <div className="p-3 bg-[#F5F5F7] rounded-xl">
                  <span className="text-[#6E6E73] text-[11px] block">Memory Floor</span>
                  <span className="text-lg font-semibold text-[#1D1D1F]">512 MB</span>
                  <span className="text-[11px] text-[#6E6E73] block">Allocated 18.2 MB</span>
                </div>
                <div className="p-3 bg-[#F5F5F7] rounded-xl">
                  <span className="text-[#6E6E73] text-[11px] block">Network Egress</span>
                  <span className="text-lg font-semibold text-[#1D1D1F]">Isolated</span>
                  <span className="text-[11px] text-emerald-700 block">0 Bytes transmitted</span>
                </div>
              </div>
              <pre className="text-[#1D1D1F] text-[11px] leading-relaxed overflow-x-auto p-4 bg-[#F5F5F7] rounded-xl">
{`EXPLAIN ANALYZE
SELECT candidate_id, score, percentile_rank
FROM skill_assessments
WHERE tenant_id = 'org_c8f92' AND verified = true
ORDER BY score DESC LIMIT 10;

Execution Plan:
-> Limit (cost=0.42..18.40 rows=10 width=48) (actual time=0.038..0.045 rows=10 loops=1)
   -> Index Scan Backward using idx_assessments_score on skill_assessments
      Filter: (verified AND (tenant_id = 'org_c8f92'::text))
Planning Time: 0.082 ms
Execution Time: 0.061 ms`}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Multimodal AI Interview Studio Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E5E5EA]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3]">
              Acoustic & Conversational Telemetry
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">
              Multimodal interview evaluations without subjective bias.
            </h2>
            <p className="mt-4 text-base text-[#6E6E73] leading-relaxed">
              Aspire AI captures audio cadence, response latency, and technical lexicon clarity in real time. Hiring managers receive quantifiable speech analytics rather than unstructured impressions.
            </p>

            <dl className="mt-8 space-y-4 text-sm">
              <div className="border-l-2 border-[#0071E3] pl-4">
                <dt className="font-semibold text-[#1D1D1F]">Acoustic Cadence Metrics</dt>
                <dd className="text-xs text-[#6E6E73] mt-0.5">
                  Tracks words per minute, pause distribution, and vocal stability across 12-minute technical drill downs.
                </dd>
              </div>
              <div className="border-l-2 border-[#0071E3] pl-4">
                <dt className="font-semibold text-[#1D1D1F]">Blind Merit Screening</dt>
                <dd className="text-xs text-[#6E6E73] mt-0.5">
                  Masks candidate demographic indicators during evaluation passes to ensure defensible, merit-first selection.
                </dd>
              </div>
              <div className="border-l-2 border-[#0071E3] pl-4">
                <dt className="font-semibold text-[#1D1D1F]">Direct Code Review Linking</dt>
                <dd className="text-xs text-[#6E6E73] mt-0.5">
                  Correlates verbal architectural explanations directly with live code modifications made inside the editor.
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <Link
                href="/interview-coach"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0071E3] hover:underline"
              >
                <span>Launch Multimodal Interview Coach Studio</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Telemetry Display Card */}
          <div className="rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] p-6 space-y-5">
            <div className="flex items-center justify-between text-xs font-medium text-[#1D1D1F] border-b border-[#E5E5EA] pb-3">
              <span>Telemetry HUD Preview</span>
              <span className="text-[#0071E3] font-mono">Sample Session #482</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#E5E5EA]">
                <span className="text-[#6E6E73] block text-[11px]">Speaking Cadence</span>
                <span className="text-2xl font-semibold text-[#1D1D1F] mt-1 block">138 WPM</span>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Optimal Engineering Range</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#E5E5EA]">
                <span className="text-[#6E6E73] block text-[11px]">Technical Lexicon Match</span>
                <span className="text-2xl font-semibold text-[#1D1D1F] mt-1 block">91.4%</span>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Distributed Systems Taxonomy</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#E5E5EA]">
                <span className="text-[#6E6E73] block text-[11px]">Filler Rate</span>
                <span className="text-2xl font-semibold text-[#1D1D1F] mt-1 block">1.2%</span>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Low hesitation variance</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#E5E5EA]">
                <span className="text-[#6E6E73] block text-[11px]">Question Coverage</span>
                <span className="text-2xl font-semibold text-[#1D1D1F] mt-1 block">5 / 5</span>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">All technical rubrics addressed</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E5E5EA] text-xs">
              <span className="text-[#6E6E73] font-medium block mb-1">Algorithmic Synthesis</span>
              <p className="text-[#1D1D1F] leading-relaxed">
                Candidate articulated consensus invariants and write quorum trade-offs with high precision. Code modifications matched verbal explanation with zero syntactical errors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Workspaces Directory */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E5E5EA]">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3]">
            Dedicated Portals
          </span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">
            Every role receives an uncompromised interface.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Candidates */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                Learners & Engineers
              </span>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mt-1">
                Candidate Workspace
              </h3>
              <p className="mt-2 text-xs text-[#6E6E73] leading-relaxed">
                Execute timed sandbox assessments, identify skill gaps against real job requirements, and generate portable SHA-256 credentials.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#1D1D1F]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>13 hands-on micro-learning modules</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Interactive code sandbox with test runners</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Direct cryptographic credential downloads</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E5EA]">
              <Link
                href="/student"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline"
              >
                <span>Enter Candidate Portal</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Hiring Teams */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                Engineering Recruiters
              </span>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mt-1">
                Employer ATS Console
              </h3>
              <p className="mt-2 text-xs text-[#6E6E73] leading-relaxed">
                Parse job descriptions, assess incoming talent on objective benchmarks, review telemetry, and export audit trails.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#1D1D1F]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Weighted skill gap analysis and scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Blind review mode to remove bias</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Bulk batch verification of credential digests</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E5EA]">
              <Link
                href="/employer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline"
              >
                <span>Enter Employer Console</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* University TPO */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
                University Leadership
              </span>
              <h3 className="text-lg font-semibold text-[#1D1D1F] mt-1">
                Institutional Governance
              </h3>
              <p className="mt-2 text-xs text-[#6E6E73] leading-relaxed">
                Manage organization tenants, oversee cohort placement readiness, manage cryptographic signing authorities, and detect anomalies.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#1D1D1F]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>University cohort placement analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Multi-tenant isolation and role policies</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  <span>Platform integrity and fraud monitoring</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E5E5EA]">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:underline"
              >
                <span>Enter Institutional Portal</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E5E5EA]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3]">
              Simple Licensing
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1D1D1F]">
              Transparent pricing. No hidden seat fees.
            </h2>
          </div>
          <Link
            href="/pricing"
            className="text-xs font-semibold text-[#0071E3] hover:underline"
          >
            View Complete Pricing Matrix &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
            <span className="text-xs font-semibold uppercase text-[#6E6E73]">Candidate</span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#1D1D1F]">$0</span>
              <span className="text-xs text-[#6E6E73]">/ forever</span>
            </div>
            <p className="mt-2 text-xs text-[#6E6E73]">
              Free for students and engineers seeking assessment and verifiable credentials.
            </p>
            <div className="mt-6">
              <Link
                href="/student"
                className="block text-center py-2 px-3 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F] transition-colors"
              >
                Start Learning
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-[#0071E3] shadow-sm relative">
            <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#0071E3] text-white text-[10px] font-semibold tracking-wide uppercase">
              Hiring Teams
            </span>
            <span className="text-xs font-semibold uppercase text-[#0071E3]">Employer Pro</span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#1D1D1F]">$79</span>
              <span className="text-xs text-[#6E6E73]">/ month</span>
            </div>
            <p className="mt-2 text-xs text-[#6E6E73]">
              Full ATS integration, unlimited skill assessments, and acoustic interview telemetry.
            </p>
            <div className="mt-6">
              <Link
                href="/employer"
                className="block text-center py-2 px-3 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-xs font-medium text-white transition-colors"
              >
                Launch Hiring
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm">
            <span className="text-xs font-semibold uppercase text-[#6E6E73]">Campus & Enterprise</span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#1D1D1F]">$399</span>
              <span className="text-xs text-[#6E6E73]">/ month</span>
            </div>
            <p className="mt-2 text-xs text-[#6E6E73]">
              Dedicated key authorities, custom skill rubrics, and campus placement telemetry.
            </p>
            <div className="mt-6">
              <Link
                href="/admin"
                className="block text-center py-2 px-3 rounded-lg bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F] transition-colors"
              >
                Institutional Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#E5E5EA] bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div>
            <span className="font-semibold text-[#1D1D1F] block mb-3">Workspaces</span>
            <ul className="space-y-2 text-[#6E6E73]">
              <li><Link href="/student" className="hover:text-[#1D1D1F]">Candidate Workspace</Link></li>
              <li><Link href="/employer" className="hover:text-[#1D1D1F]">Employer ATS Console</Link></li>
              <li><Link href="/admin" className="hover:text-[#1D1D1F]">Institutional Governance</Link></li>
              <li><Link href="/hub" className="hover:text-[#1D1D1F]">Course & Lab Catalog</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-[#1D1D1F] block mb-3">Verification & Tools</span>
            <ul className="space-y-2 text-[#6E6E73]">
              <li><Link href={`/verify/${defaultHash}`} className="hover:text-[#1D1D1F]">Credential Ledger</Link></li>
              <li><Link href="/interview-coach" className="hover:text-[#1D1D1F]">Multimodal Studio</Link></li>
              <li><Link href="/demo" className="hover:text-[#1D1D1F]">Live Code Sandbox</Link></li>
              <li><Link href="/pricing" className="hover:text-[#1D1D1F]">Pricing Matrix</Link></li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-[#1D1D1F] block mb-3">Security & Legal</span>
            <ul className="space-y-2 text-[#6E6E73]">
              <li><Link href="/terms" className="hover:text-[#1D1D1F]">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#1D1D1F]">Privacy Policy</Link></li>
              <li><span className="text-[#86868B]">SHA-256 Authority</span></li>
              <li><span className="text-[#86868B]">gVisor Sandbox Isolation</span></li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-[#1D1D1F] block mb-3">Aspire AI</span>
            <p className="text-[#6E6E73] leading-relaxed mb-3">
              Verifiable skill intelligence platform. Deterministic credentials signed by cryptographic institutional keys.
            </p>
            <div className="text-[11px] text-[#86868B]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#D2D2D7] font-mono text-[10px] text-[#1D1D1F]">⌘K</kbd> anywhere for Quick Jump
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[#E5E5EA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868B] gap-4">
          <p>© 2026 Aspire AI Inc. All rights reserved. Zero tracking cookies.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#1D1D1F]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#1D1D1F]">Privacy</Link>
            <Link href="/pricing" className="hover:text-[#1D1D1F]">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
