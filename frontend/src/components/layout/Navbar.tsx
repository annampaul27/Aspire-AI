"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import NotificationCenter from "./NotificationCenter";
import QuickCommandSwitcher from "./QuickCommandSwitcher";
import { RoleType } from "@/types";

export default function Navbar() {
  const mounted = useMounted();
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentOrg,
    setCurrentOrg,
    organizations,
    role,
    setRole,
    isAuthenticated,
    currentUser,
    logout,
  } = useStore();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcut for Quick-Switcher (Cmd+K or Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickSwitcherOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: "/student", label: "Student" },
    { href: "/employer", label: "Employer" },
    { href: "/admin", label: "Academic TPO" },
    { href: "/interview-coach", label: "AI Interview Coach" },
    { href: "/pricing", label: "Pricing" },
    {
      href: "/verify/a4f89d3810c92bf2234e405e6081297e68cfb939e6a0d0a52479e0237d45f3ba",
      label: "Verify",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FBFBFD]/90 backdrop-blur-md border-b border-[#E5E5EA] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13">
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 group transition-opacity hover:opacity-80"
              >
                <div className="w-5 h-5 rounded-[5px] bg-[#1D1D1F] flex items-center justify-center text-white text-[11px] font-bold">
                  A
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-[#1D1D1F]">
                    Aspire AI
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href.split("?")[0]);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "text-[#0071E3] font-semibold bg-[#0071E3]/5"
                          : "text-[#1D1D1F] hover:text-[#0071E3] hover:bg-[#F5F5F7]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Quick-Nav, Role, Notifications & Account */}
            <div className="flex items-center gap-2.5">
              {/* Quick Jump Command Switcher Trigger */}
              <button
                type="button"
                onClick={() => setQuickSwitcherOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 text-xs text-[#6E6E73] bg-[#F5F5F7] hover:bg-[#E5E5EA] border border-[#E5E5EA] rounded-md transition-colors"
                title="Quick Feature Switcher (Cmd+K)"
                aria-label="Open Quick Feature Switcher"
              >
                <svg
                  className="w-3.5 h-3.5 text-[#86868B]"
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
                <span className="hidden sm:inline">Jump</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.2 font-mono text-[10px] bg-white border border-[#D2D2D7] rounded text-[#1D1D1F]">
                  ⌘K
                </kbd>
              </button>

              {/* Organization Switcher (If authenticated employer or admin) */}
              {mounted && organizations.length > 0 && (
                <div className="relative hidden lg:block" ref={orgRef}>
                  <button
                    type="button"
                    onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#1D1D1F] bg-[#FFFFFF] border border-[#D2D2D7] rounded-md hover:bg-[#F5F5F7] transition-colors"
                  >
                    <span className="truncate max-w-[120px] font-medium">
                      {currentOrg?.name || "Acme Systems"}
                    </span>
                    <svg
                      className="w-3 h-3 text-[#86868B]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {orgDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg border border-[#D2D2D7] shadow-lg py-1 z-50 text-xs">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#86868B] tracking-wider">
                        Select Workspace
                      </div>
                      {organizations.map((org) => (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => {
                            setCurrentOrg(org);
                            setOrgDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-[#F5F5F7] ${
                            currentOrg?.id === org.id
                              ? "font-semibold text-[#0071E3]"
                              : "text-[#1D1D1F]"
                          }`}
                        >
                          <span className="truncate">{org.name}</span>
                          {currentOrg?.id === org.id && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notification Center */}
              <NotificationCenter />

              {/* Role Toggle Pill */}
              {mounted && (
                <div className="hidden sm:flex items-center border border-[#D2D2D7] rounded-md p-0.5 bg-[#F5F5F7] text-[11px]">
                  {(["student", "employer", "admin"] as RoleType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition-all ${
                        role === r
                          ? "bg-white text-[#1D1D1F] shadow-xs font-semibold"
                          : "text-[#6E6E73] hover:text-[#1D1D1F]"
                      }`}
                    >
                      {r === "admin" ? "TPO" : r}
                    </button>
                  ))}
                </div>
              )}

              {/* Account Dropdown */}
              <div className="relative" ref={userRef}>
                {mounted && isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1D1D1F] bg-white border border-[#D2D2D7] rounded-md hover:bg-[#F5F5F7] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#1E8E3E]" />
                    <span className="truncate max-w-[90px]">
                      {currentUser?.name?.split(" ")[0] || "Account"}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="px-3 py-1 text-xs font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-md transition-colors"
                  >
                    Sign In
                  </Link>
                )}

                {mounted && isAuthenticated && userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg border border-[#D2D2D7] shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-[#E5E5EA]">
                      <p className="font-semibold text-[#1D1D1F] truncate">
                        {currentUser?.name || "Verified User"}
                      </p>
                      <p className="text-[10px] text-[#6E6E73] truncate">
                        {currentUser?.email || "user@aspire.ai"}
                      </p>
                    </div>
                    <Link
                      href={
                        role === "student"
                          ? "/student/profile"
                          : role === "employer"
                          ? "/employer/profile"
                          : "/admin/profile"
                      }
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-1.5 text-[#1D1D1F] hover:bg-[#F5F5F7]"
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-1.5 text-[#1D1D1F] hover:bg-[#F5F5F7]"
                    >
                      Manage Plan
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full text-left px-3 py-1.5 text-[#D9383A] hover:bg-[#F5F5F7] border-t border-[#E5E5EA]"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-md border border-[#E5E5EA]"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E5EA] bg-white px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#1D1D1F] rounded-md hover:bg-[#F5F5F7]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[#E5E5EA] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setQuickSwitcherOpen(true);
                }}
                className="w-full py-2 text-xs font-semibold text-center text-[#1D1D1F] bg-[#F5F5F7] rounded-md border border-[#D2D2D7]"
              >
                Quick Jump (⌘K)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Omnipresent Quick Command Switcher Modal */}
      <QuickCommandSwitcher
        isOpen={quickSwitcherOpen}
        onClose={() => setQuickSwitcherOpen(false)}
      />
    </>
  );
}
