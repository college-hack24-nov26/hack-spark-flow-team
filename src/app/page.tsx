"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Factory,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  GitFork,
  FileText,
  Clock,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Building,
  Upload,
  RefreshCw,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Deterministic state re-synchronized from Supabase PostgreSQL.");
      setTimeout(() => setToastMessage(null), 3500);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-mono border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Operational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Operational Traceability & Recall Center
            </h1>
            <DemoBadge variant="prominent" label="DEMO ENVIRONMENT" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plant 01 (Austin Processing Facility) • FSMA Rule 204 Critical Tracking Events (CTEs)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync Ledger</span>
          </button>

          <Link href="/documents">
            <Button size="sm" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notice on Realism & Determinism */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950">
          <span className="font-semibold text-emerald-900">Deterministic Integrity Guarantee: </span>
          All graph linkages, blast radiuses, and recall sums are strictly queried from verified relational records.
          Metrics marked with <DemoBadge /> are derived from the pre-loaded <strong>Apex Organics Salmonella Incident</strong> test dataset.
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Inward Lots"
          value="42"
          subtext="100% linked to inward invoices"
          icon={Boxes}
          statusVariant="success"
          isDemoData={true}
          trend={{ value: "+4 this week", isPositive: true }}
        />
        <MetricCard
          title="Production Batches"
          value="18"
          subtext="16 Released • 2 In Quarantine"
          icon={Factory}
          statusVariant="default"
          isDemoData={true}
          trend={{ value: "14,200 total jars", isNeutral: true }}
        />
        <MetricCard
          title="Exposed in Recall"
          value="11,000"
          subtext="Units shipped across 3 distributors"
          icon={AlertTriangle}
          statusVariant="danger"
          isDemoData={true}
          trend={{ value: "Incident RCL-004", isPositive: false }}
        />
        <MetricCard
          title="Chain Integrity"
          value="96.4%"
          subtext="2 Gaps require manual review"
          icon={ShieldCheck}
          statusVariant="warning"
          isDemoData={true}
          trend={{ value: "2 Flags pending", isPositive: false }}
        />
      </div>

      {/* Active Incident Commander Banner */}
      <Card className="border-rose-200 bg-linear-to-r from-rose-50/50 via-white to-white shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="CRITICAL" pulse={true} />
                <span className="text-xs font-mono font-bold text-rose-900">
                  INCIDENT RCL-2026-004: Suspected Salmonella Contamination
                </span>
                <DemoBadge label="GOLDEN DEMO SCENARIO" />
              </div>
              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                Raw material <code className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded font-mono font-medium">LOT-PNUT-2026-081</code> (Roasted Peanut Paste from Golden Valley Organics) tested positive for <em>Salmonella enterica</em>.
                Deterministic forward trace indicates <strong>2 production batches</strong> and <strong>3 wholesale distributors</strong> are compromised.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-1">
                <span>Total Affected: <strong className="text-rose-700">14,200 Units</strong></span>
                <span>•</span>
                <span>In Warehouse: <strong className="text-slate-800">3,200 Units</strong> (Quarantined)</span>
                <span>•</span>
                <span>Dispatched: <strong className="text-rose-700">11,000 Units</strong> (In Market)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/traceability">
                <Button variant="outline" size="sm" className="gap-1.5 border-rose-300 text-rose-800 hover:bg-rose-50">
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Inspect Trace Graph</span>
                </Button>
              </Link>
              <Link href="/recall">
                <Button variant="destructive" size="sm" className="gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Recall Commander</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Verified Supply Chain Entities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Batches & Ingredient Lots */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Recent Production Batches & Ingredient Consumption</span>
                  <DemoBadge />
                </CardTitle>
                <CardDescription>
                  Verified records linking raw lots to manufactured packaged inventory
                </CardDescription>
              </div>
              <Link href="/inventory/batches">
                <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Batch #</th>
                      <th className="py-2.5 px-4 font-medium">Product / SKU</th>
                      <th className="py-2.5 px-4 font-medium">Yield</th>
                      <th className="py-2.5 px-4 font-medium">Ingredients Used</th>
                      <th className="py-2.5 px-4 font-medium">QA Status</th>
                      <th className="py-2.5 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr className="hover:bg-rose-50/40 bg-rose-50/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-rose-900">
                        BATCH-2026-1049
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">
                        Crunchy Peanut Butter 400g
                      </td>
                      <td className="py-3 px-4 text-slate-700">8,400 jars</td>
                      <td className="py-3 px-4">
                        <span className="text-rose-700 font-semibold underline decoration-rose-300">
                          LOT-PNUT-2026-081
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="RECALLED" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/traceability">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-rose-700 hover:text-rose-900 hover:bg-rose-100">
                            Trace
                          </Button>
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-rose-50/40 bg-rose-50/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-rose-900">
                        BATCH-2026-1052
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">
                        Creamy Peanut Spread 500g
                      </td>
                      <td className="py-3 px-4 text-slate-700">5,800 jars</td>
                      <td className="py-3 px-4">
                        <span className="text-rose-700 font-semibold underline decoration-rose-300">
                          LOT-PNUT-2026-081
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="RECALLED" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/traceability">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-rose-700 hover:text-rose-900 hover:bg-rose-100">
                            Trace
                          </Button>
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        BATCH-2026-1044
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">
                        Organic Almond Butter 350g
                      </td>
                      <td className="py-3 px-4 text-slate-700">4,200 jars</td>
                      <td className="py-3 px-4 text-slate-600">
                        LOT-ALMD-2026-033
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="PASSED" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/traceability">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-slate-600 hover:text-slate-900">
                            Trace
                          </Button>
                        </Link>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        BATCH-2026-1038
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">
                        Rolled Oats Quick Cook 1kg
                      </td>
                      <td className="py-3 px-4 text-slate-700">6,100 packs</td>
                      <td className="py-3 px-4 text-slate-600">
                        LOT-OAT-2026-019
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status="PASSED" size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/traceability">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-slate-600 hover:text-slate-900">
                            Trace
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Document Ingestion Stream */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Document OCR & Extraction Pipeline</span>
                  <DemoBadge />
                </CardTitle>
                <CardDescription>
                  Invoices, CoAs, and dispatch manifests processed via multimodal extraction
                </CardDescription>
              </div>
              <Link href="/documents">
                <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
                  <span>Open Ingestion Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-slate-100">
                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block font-mono">
                        COA-GVO-2026-081.pdf
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Golden Valley Organics • Certificate of Analysis
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      98% Confidence
                    </span>
                    <StatusBadge status="CONFIRMED" size="sm" />
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block font-mono">
                        DISPATCH-MANIFEST-4402.pdf
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        National Supermarkets DC • Shipping Manifest
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      96% Confidence
                    </span>
                    <StatusBadge status="CONFIRMED" size="sm" />
                  </div>
                </div>

                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block font-mono">
                        BATCH-LOG-LINE3-1049.pdf
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Internal Production Sheet • Packaging Line 3
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      94% Confidence
                    </span>
                    <StatusBadge status="CONFIRMED" size="sm" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Integrity Gaps & Quick Actions */}
        <div className="space-y-6">
          {/* Integrity Gap Detector Alerts */}
          <Card className="border-amber-200/90 shadow-xs">
            <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Compliance Gaps Detected</span>
                </CardTitle>
                <DemoBadge label="2 FLAGS" />
              </div>
              <CardDescription className="text-amber-800/80">
                Automated relational rules detected broken links in the chain of custody
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Gap 1 */}
              <div className="p-3 bg-white rounded-md border border-amber-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                    MISSING_COA
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">1 hr ago</span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  Ingredient Lot <code className="font-mono text-slate-900 bg-slate-100 px-1 rounded">LOT-OAT-9102</code> has no verified Certificate of Analysis attached.
                </p>
                <div className="pt-1 flex justify-end">
                  <Link href="/audit/gaps">
                    <Button variant="link" size="sm" className="h-6 p-0 text-emerald-700 font-semibold text-xs">
                      Investigate Gap →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Gap 2 */}
              <div className="p-3 bg-white rounded-md border border-amber-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                    MASS_BALANCE_MISMATCH
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">4 hrs ago</span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  Batch <code className="font-mono text-slate-900 bg-slate-100 px-1 rounded">BATCH-2026-1033</code> consumed 140 kg more sugar than recorded inward receipt.
                </p>
                <div className="pt-1 flex justify-end">
                  <Link href="/audit/gaps">
                    <Button variant="link" size="sm" className="h-6 p-0 text-emerald-700 font-semibold text-xs">
                      Reconcile Usage →
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Trace Navigator */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-700">
                Interactive Traceability
              </CardTitle>
              <CardDescription>
                Explore backward and forward genealogy trees in real time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="font-medium text-slate-900">Featured Golden Demo Scenario</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Analyze the full forward blast radius of the Salmonella-contaminated peanut paste from Golden Valley Organics to the end-consumer distributors.
                </p>
                <Link href="/traceability" className="block pt-1">
                  <Button variant="forest" size="sm" className="w-full gap-2 justify-center">
                    <GitFork className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Launch Trace Graph</span>
                  </Button>
                </Link>
              </div>

              <div className="p-3 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Regulatory Compliance</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Meets FDA 21 CFR Part 1 Subpart S (Traceability) and FSSAI Recall Guidelines.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
