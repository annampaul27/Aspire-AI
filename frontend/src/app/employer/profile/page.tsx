"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  Briefcase,
  Building2,
  Mail,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  Sliders,
  Edit3,
  Save,
  ArrowLeft,
  Zap,
  TrendingUp,
  Clock,
  LogOut,
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import EnterpriseSettingsCard from "@/components/employer/EnterpriseSettingsCard";

export default function EmployerProfilePage() {
  const router = useRouter();
  const {
    currentOrg,
    setCurrentOrg,
    organizations,
    jobs,
    candidates,
    isAnonymizedScreening,
    setIsAnonymizedScreening,
    currentUser,
    updateEmployerProfile,
    logout,
    addToast,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [recruiterName, setRecruiterName] = useState(currentUser?.name || "Priya Sharma");
  const [recruiterEmail, setRecruiterEmail] = useState(currentUser?.email || "priya.sharma@acme.com");
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [passThreshold, setPassThreshold] = useState<number>(85);

  const totalScreened = currentOrg.metrics.candidatesScreened || candidates.length;
  const totalHired = currentOrg.metrics.bridgeableHired || 12;
  const hoursSaved = currentOrg.metrics.hoursSaved || 164;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployerProfile({
      name: recruiterName,
      email: recruiterEmail,
      orgName,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <RoleGuard allowedRoles={["employer", "admin"]} portalName="Employer Recruiter Profile">
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/employer"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Return to Employer ATS Pipeline"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h1 className="text-xl font-bold text-white tracking-tight">Employer & Recruiter Profile</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  {currentOrg.plan} Organization
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your corporate hiring workspace, talent screening thresholds, and recruiter credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/employer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5"
            >
              <span>ATS Pipeline</span>
            </Link>
            <Link
              href="/demo"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Live Pitch Cockpit</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Hero Organization Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center text-3xl shadow-lg shadow-blue-950/40">
                {currentOrg.logo}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold text-white tracking-tight">{currentOrg.name}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    {currentOrg.type.toUpperCase()} · {currentOrg.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead Recruiter: <strong className="text-white">{recruiterName}</strong></span>
                  <span className="text-slate-600">·</span>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-300">{recruiterEmail}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Subscription: <strong className="text-slate-200">{currentOrg.plan} Plan</strong> ({currentOrg.seatsUsed} / {currentOrg.seatsTotal} Recruiter Seats Active)
                </p>
              </div>
            </div>

            {/* Quick Actions & Workspace Switcher */}
            <div className="flex flex-col gap-2 self-start md:self-center shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Close Form" : "Edit Recruiter Details"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Edit Recruiter & Workspace Settings</span>
              </h3>
              <span className="text-xs text-slate-400">Updates profile display and organization identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Recruiter Full Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Organization Display Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-950/50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Employer Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* 4 Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Candidates Screened</p>
              <div className="text-2xl font-black text-white mt-1">{totalScreened}</div>
              <span className="text-[10px] text-slate-500">Across {jobs.length} Active JDs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Hours Saved with AI</p>
              <div className="text-2xl font-black text-emerald-400 mt-1">{hoursSaved}h</div>
              <span className="text-[10px] text-slate-500">Auto-scoring & AST checks</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Bridgeable Converted</p>
              <div className="text-2xl font-black text-purple-400 mt-1">{totalHired}</div>
              <span className="text-[10px] text-slate-500">Post-Sprint Hire Rate: 84%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Screening Bias Shield</p>
              <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                {isAnonymizedScreening ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <EyeOff className="w-4 h-4" /> Blind Mode ON
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Standard View
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">E17 Anti-Bias Standard</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Workspace Switcher & Screening Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Switcher */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Multi-Tenant Workspaces ({organizations.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Switch corporate tenant context</span>
            </div>

            <div className="space-y-2">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setCurrentOrg(org);
                    addToast({
                      type: "info",
                      title: "Workspace Changed",
                      message: `Switched active organization to ${org.name}.`,
                    });
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    currentOrg.id === org.id
                      ? "bg-blue-600/15 border-blue-500/50 shadow-sm"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{org.logo}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{org.name}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {org.type} · {org.plan} Plan · {org.seatsUsed}/{org.seatsTotal} Seats
                      </p>
                    </div>
                  </div>

                  {currentOrg.id === org.id ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 hover:text-white">Switch</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Screening Policy & Pass Thresholds */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Screening Policies & AI Automation</span>
              </h3>
              <span className="text-[11px] text-slate-400">Algorithmic Governance</span>
            </div>

            {/* Blind Screening Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-white block">Blind Screening (Anti-Bias Mode)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Anonymizes candidate names, genders, and universities (e.g. &quot;Candidate #8492&quot;) to prevent demographic hiring bias.
                </p>
              </div>
              <button
                onClick={() => setIsAnonymizedScreening(!isAnonymizedScreening)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                  isAnonymizedScreening
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {isAnonymizedScreening ? "Enabled" : "Disabled"}
              </button>
            </div>

            {/* Pass Threshold Slider */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Minimum Job-Ready Threshold</span>
                <span className="font-mono text-purple-400 font-bold">{passThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                step="1"
                value={passThreshold}
                onChange={(e) => setPassThreshold(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>70% (High Volume Pipeline)</span>
                <span>85% (Industry Standard)</span>
                <span>95% (Elite Only)</span>
              </div>
            </div>

            {/* Micro-Sprint Dispatch Auto-Rule */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-white block">Automated Gap Sprint Dispatch</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically invite bridgeable candidates (70–84%) to 48-hour micro-assessments to close skill deficits.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Enterprise SSO & Outbound Webhooks */}
        <EnterpriseSettingsCard orgId={currentOrg.id} orgName={currentOrg.name} />
      </div>
      </div>
    </RoleGuard>
  );
}
