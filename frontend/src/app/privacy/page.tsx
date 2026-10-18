import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Aspire AI",
  description: "Privacy Policy explaining data collection, acoustic telemetry processing, and cryptographic ledger transparency at Aspire AI.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-b border-[#E5E5EA] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] mb-4">
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#6E6E73]">
            Last Updated: October 18, 2026. Version 2.2. Draft for operational review.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-10 text-sm leading-relaxed text-[#333336]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              1. Our Data Principles
            </h2>
            <p>
              Aspire AI builds verifiable skill verification infrastructure. We do not sell, rent,
              broker, or monetize candidate personal information. We collect only the information
              strictly necessary to evaluate technical proficiencies, protect code execution environments
              from fraud, and issue cryptographically verifiable credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              2. Information We Collect
            </h2>
            <p>
              Depending on your interactions with the platform, we collect the following categories
              of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#424245]">
              <li>
                <strong>Account Credentials:</strong> Full name, professional email address, account password
                hashes (bcrypt hashed with work factor 12), and institutional affiliation (university or employer).
              </li>
              <li>
                <strong>Code Assessment Data:</strong> Source code submissions, unit test execution logs,
                time-to-completion metrics, and performance telemetry (runtime duration and memory allocation).
              </li>
              <li>
                <strong>Acoustic and Conversational Telemetry:</strong> In the Multimodal Interview Coach Studio,
                audio signals are analyzed for speaking pace (words per minute), pause intervals, and technical
                lexicon density. Audio streams are processed in ephemeral server memory and are not used to train
                public foundation models.
              </li>
              <li>
                <strong>Public GitHub Information:</strong> When you connect your GitHub profile, we inspect
                public repository metadata, commit frequencies, and language distributions to construct verified
                skills profiles. We do not access private repositories without explicit authorization.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              3. Public Ledger and Credential Hashes
            </h2>
            <p>
              When a verified credential is minted, a canonical JSON payload containing the evaluation score,
              date, and an anonymous candidate identifier is hashed using SHA-256. This 64-character hexadecimal
              digest is recorded on the verification ledger.
            </p>
            <p>
              Public verification links display only the assessment title, score percentile, and institutional
              signing authority. Personal contact information (such as email or telephone numbers) is never
              exposed on public verification endpoints.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              4. Multi-Tenant Isolation and Data Storage
            </h2>
            <p>
              Enterprise and university tenant data is strictly segregated using tenant-specific identifiers
              and row-level database policies. Data at rest is encrypted using AES-256. All communications
              between client browsers, microservices, and execution sandboxes are enforced over TLS 1.3.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              5. Third-Party Data Processors
            </h2>
            <p>
              We partner with trusted third-party service providers solely to deliver core infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#424245]">
              <li>
                <strong>Payment Infrastructure:</strong> Razorpay (INR transactions) and Stripe (USD transactions)
                process subscription payments. Aspire AI does not store raw credit card numbers.
              </li>
              <li>
                <strong>Authentication & Identity:</strong> Secure JWT cookies and OAuth providers (GitHub).
              </li>
              <li>
                <strong>Cloud Infrastructure:</strong> Managed container runtimes hosted in compliant ISO 27001
                and SOC 2 certified data centers.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              6. Your Rights and Data Retention
            </h2>
            <p>
              You maintain full control over your personal data. You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#424245]">
              <li>Export your complete assessment history, telemetry scores, and canonical credential payloads.</li>
              <li>Request the permanent erasure of your account, candidate profile, and historical submission records.</li>
              <li>Opt out of optional interview audio telemetry recording at any time during practice sessions.</li>
            </ul>
            <p>
              To exercise these rights, submit a written request to <span className="font-mono text-[#0071E3]">privacy@aspire-ai.internal</span>.
              Requests are fulfilled within 30 calendar days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">
              7. Security Disclosures
            </h2>
            <p>
              If you identify a potential security vulnerability within our isolated sandboxes, credential
              verification endpoints, or authentication flows, please contact our security team directly at
              <span className="font-mono text-[#0071E3]"> security@aspire-ai.internal</span>. We operate a coordinated
              vulnerability disclosure process.
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
              href="/terms"
              className="text-xs font-medium text-[#0071E3] hover:underline"
            >
              View Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
