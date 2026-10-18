import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Aspire AI",
  description: "Terms of Service governing the use of Aspire AI verifiable skill infrastructure and code sandboxes.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-b border-[#E5E5EA] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] mb-4">
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[#6E6E73]">
            Effective Date: October 18, 2026. Version 2.4. Draft for operational review.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-10 text-sm leading-relaxed text-[#333336]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              1. Acceptance and Scope
            </h2>
            <p>
              By accessing, browsing, or utilizing the Aspire AI platform, code execution sandboxes,
              multimodal interview studios, and verifiable credential verification services, you agree
              to be bound by these Terms of Service. If you are entering into this agreement on behalf of
              a corporation, staffing agency, or higher education institution, you represent that you possess
              the requisite legal authority to bind that entity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              2. Platform Services and Permitted Use
            </h2>
            <p>
              Aspire AI provides deterministic skill evaluations, isolated code runtime environments,
              acoustic speech telemetry, and cryptographic credential ledgers. Users may access these
              features according to their provisioned role:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#424245]">
              <li>
                <strong>Candidates and Students:</strong> Access micro-learning modules, execute code
                challenges against automated test suites, participate in practice interviews, and hold
                verifiable SHA-256 credentials.
              </li>
              <li>
                <strong>Employers and Recruiters:</strong> Benchmark applicants, review verified skill
                digests, configure blind screening filters, and manage candidate pipelines.
              </li>
              <li>
                <strong>Institutional Administrators:</strong> Manage tenant organizations, monitor
                accreditation telemetry, and administer cryptographic key authority parameters.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              3. Code Sandbox Acceptable Use Policy
            </h2>
            <p>
              All code submissions execute within containerized gVisor micro-sandboxes allocated with
              a ceiling of 2.0 vCPU, 512 MB RAM, and zero egress networking. You explicitly agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#424245]">
              <li>Attempt to circumvent container boundaries, access host kernel structures, or execute fork bombs.</li>
              <li>Deploy automated scripts designed to mine cryptocurrency, exfiltrate test harness memory, or conduct denial-of-service attempts.</li>
              <li>Submit malicious payloads, reverse engineer proprietary evaluation harnesses, or interfere with tenant isolation.</li>
            </ul>
            <p className="text-xs text-[#6E6E73] bg-[#F5F5F7] p-3 rounded-lg border border-[#E5E5EA]">
              Violation of the Sandbox Acceptable Use Policy results in immediate credential revocation,
              permanent IP blocklisting, and notification to affiliated institutional sponsors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              4. Cryptographic Credential Authority
            </h2>
            <p>
              Credentials minted by Aspire AI are deterministic SHA-256 digests generated from canonical
              JSON payloads conforming to RFC 8785. The platform guarantees mathematical verification of
              unaltered credentials against registered institutional public keys.
            </p>
            <p>
              Aspire AI reserves the right to issue revocation markers on the public ledger if an assessment
              is subsequently determined to have been completed through proxy test-taking, harness tampering,
              or confirmed plagiarism.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              5. Multi-Tenant Subscriptions and Billing
            </h2>
            <p>
              Candidate accounts are complimentary for standard public modules. Employer ATS and
              Institutional Governance consoles are billed monthly or annually in accordance with the
              published pricing schedule. Payments are processed through authorized payment gateways
              (Razorpay for INR transactions, Stripe for USD transactions). Subscriptions renew automatically
              unless cancelled prior to the end of the current billing cycle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              6. Disclaimers and Operational Limitations
            </h2>
            <p>
              Aspire AI provides automated skill evaluation signals and telemetry. The platform does not
              make automated employment hiring determinations. All hiring, interviewing, and institutional
              placement choices remain the independent responsibility of evaluating employers and universities.
              Platform services are provided on an as-is and as-available basis without warranties of any kind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              7. Governance and Dispute Resolution
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of Delaware, USA,
              without regard to its conflict of law principles. Any dispute arising from these Terms will
              be resolved through binding confidential arbitration.
            </p>
          </section>

          <div className="pt-8 border-t border-[#E5E5EA] flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-medium text-[#0071E3] hover:underline"
            >
              &larr; Return to Homepage
            </Link>
            <Link
              href="/privacy"
              className="text-xs font-medium text-[#0071E3] hover:underline"
            >
              View Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
