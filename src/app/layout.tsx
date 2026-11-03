import type { Metadata } from "next";
import "./globals.css";
import "./xyflow.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "TraceX Ai | Enterprise Food Traceability & Recall Intelligence",
  description:
    "AI-powered supply chain traceability, ingredient lot graph lineage, gap detection, and deterministic recall intelligence platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
