import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/layout/Navbar";
import ToastContainer from "@/components/layout/ToastContainer";

export const metadata: Metadata = {
  title: "Aspire AI — Verified Talent Infrastructure & Competency Trust Engine",
  description:
    "Role-separated talent verification platform connecting employers and candidates through cryptographically verified skill assessments, AST-isolated sandboxes, and institutional NAAC reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col font-sans antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]"
      >
        <StoreProvider>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 relative">{children}</main>
            <ToastContainer />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
