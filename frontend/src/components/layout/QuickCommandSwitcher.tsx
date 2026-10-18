"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { RoleType } from "@/types";

interface CommandItem {
  id: string;
  title: string;
  category: "Workspaces" | "Engines" | "Security & Compliance" | "Switch Persona";
  description: string;
  badge?: string;
  href?: string;
  action?: () => void;
}

interface QuickCommandSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCommandSwitcher({
  isOpen,
  onClose,
}: QuickCommandSwitcherProps) {
  const router = useRouter();
  const { setRole, role, addToast } = useStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commandItems: CommandItem[] = [
    {
      id: "student-hub",
      title: "Student Competency Workspace",
      category: "Workspaces",
      description: "Assessments, proctored code sandbox, 90-day curricula roadmaps",
      badge: "/student",
      href: "/student",
    },
    {
      id: "employer-workspace",
      title: "Employer Talent Radar & Kanban",
      category: "Workspaces",
      description: "Candidate radar, blind DEI screening, collaborative scorecards",
      badge: "/employer",
      href: "/employer",
    },
    {
      id: "admin-tpo",
      title: "Institutional TPO & NAAC Accreditation",
      category: "Workspaces",
      description: "University cohorts, 1-click batch sprint dispatch, Criterion 5 CSV",
      badge: "/admin",
      href: "/admin",
    },
    {
      id: "interview-coach",
      title: "Multimodal AI Interview Studio",
      category: "Engines",
      description: "Speech acoustics, vision gaze tracking, 3-agent executive debate",
      badge: "/interview-coach",
      href: "/interview-coach",
    },
    {
      id: "code-sandbox",
      title: "Isolated Code Execution Sandbox",
      category: "Engines",
      description: "Ephemeral database 50k-row EXPLAIN plan and Python AST runner",
      badge: "Sandbox",
      action: () => {
        router.push("/student");
        addToast({
          type: "info",
          title: "Code Sandbox Initialized",
          message: "Navigated to student workspace with live execution harness.",
        });
      },
    },
    {
      id: "ats-parser",
      title: "ATS Resume Normalizer & Gap Analyzer",
      category: "Engines",
      description: "PDF parsing, deficit resistance scoring, job matching",
      badge: "ATS Parser",
      action: () => {
        router.push("/student");
        addToast({
          type: "info",
          title: "ATS Parser Active",
          message: "Navigated to ATS resume and skill deficit radar.",
        });
      },
    },
    {
      id: "credential-verify",
      title: "Public SHA-256 Credential Ledger",
      category: "Engines",
      description: "Zero-auth cryptographic verification portal for recruiters",
      badge: "/verify/[hash]",
      href: "/verify/a4f89d3810c92bf2234e405e6081297e68cfb939e6a0d0a52479e0237d45f3ba",
    },
    {
      id: "github-security",
      title: "GitHub Repository Security Audit",
      category: "Security & Compliance",
      description: "Dependency vulnerability scanning and token leak detection",
      badge: "/student/github-security",
      href: "/student/github-security",
    },
    {
      id: "pricing-plans",
      title: "Subscription Plans & Billing Catalog",
      category: "Security & Compliance",
      description: "Starter, Growth, Institutional tiers with INR & USD checkout",
      badge: "/pricing",
      href: "/pricing",
    },
    {
      id: "terms-service",
      title: "Terms of Service",
      category: "Security & Compliance",
      description: "Platform terms, verified credential licensing, academic compliance",
      badge: "/terms",
      href: "/terms",
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      category: "Security & Compliance",
      description: "Candidate data protection, no third-party data selling commitment",
      badge: "/privacy",
      href: "/privacy",
    },
    {
      id: "switch-student",
      title: "Switch Persona to Student / Candidate",
      category: "Switch Persona",
      description: "Experience the platform as a student learning and taking tests",
      badge: "Role",
      action: () => {
        setRole("student");
        router.push("/student");
        addToast({
          type: "success",
          title: "Persona Switched",
          message: "Active persona updated to Student.",
        });
      },
    },
    {
      id: "switch-employer",
      title: "Switch Persona to Employer / Hiring Lead",
      category: "Switch Persona",
      description: "Experience the platform as an engineering hiring manager",
      badge: "Role",
      action: () => {
        setRole("employer");
        router.push("/employer");
        addToast({
          type: "success",
          title: "Persona Switched",
          message: "Active persona updated to Employer.",
        });
      },
    },
    {
      id: "switch-admin",
      title: "Switch Persona to Institutional TPO Admin",
      category: "Switch Persona",
      description: "Experience the platform as a university placement officer",
      badge: "Role",
      action: () => {
        setRole("admin");
        router.push("/admin");
        addToast({
          type: "success",
          title: "Persona Switched",
          message: "Active persona updated to Institutional Admin.",
        });
      },
    },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const executeItem = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Feature Quick Switcher"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/30 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] rounded-xl border border-[#D2D2D7] shadow-2xl overflow-hidden text-[#1D1D1F] animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="relative border-b border-[#E5E5EA] px-4 py-3 flex items-center gap-3">
          <svg
            className="w-4 h-4 text-[#86868B] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any workspace, assessment engine, or legal page..."
            className="w-full text-sm bg-transparent outline-none text-[#1D1D1F] placeholder-[#86868B]"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#6E6E73] bg-[#F5F5F7] border border-[#E5E5EA] rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto divide-y divide-[#E5E5EA]/60 p-2"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6E6E73]">
              No matching destinations found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-[#0071E3] text-white"
                      : "hover:bg-[#F5F5F7] text-[#1D1D1F]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isSelected ? "text-white/80" : "text-[#6E6E73]"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-mono shrink-0 px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[#F5F5F7] text-[#1D1D1F] border border-[#E5E5EA]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#E5E5EA] bg-[#F5F5F7] flex items-center justify-between text-[11px] text-[#6E6E73]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white border border-[#E5E5EA] px-1 rounded">
                ↑
              </kbd>{" "}
              <kbd className="font-mono bg-white border border-[#E5E5EA] px-1 rounded">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white border border-[#E5E5EA] px-1.5 rounded">
                ↵
              </kbd>{" "}
              Select
            </span>
          </div>
          <div>
            Active Role:{" "}
            <span className="font-semibold text-[#1D1D1F] capitalize">
              {role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
