"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  FileCheck2,
  Mail,
  Download,
  ShieldAlert,
  ArrowRight,
  Boxes,
  Factory,
  Truck,
  CheckCircle2,
  Printer,
  Lock,
  Unlock,
  Send,
  Building,
  Store,
  Phone,
  Copy,
  Check,
  FileText,
  Clock,
  Flame,
  FileDown,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { RecallService, RecallBlastRadiusAnalysis, ImpactedCustomerConsignment } from "@/services/recall-service";
import { IngredientService } from "@/services/ingredient-service";

export default function RecallIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"blast_radius" | "customers" | "dossier">("blast_radius");
  const [selectedLotNumber, setSelectedLotNumber] = useState<string>("LOT-PNUT-2026-081");
  const [analysis, setAnalysis] = useState<RecallBlastRadiusAnalysis | null>(null);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [isSendingNotices, setIsSendingNotices] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Load deterministic analysis
  const loadAnalysis = (lotNum: string) => {
    const data = RecallService.calculateBlastRadius(lotNum);
    setAnalysis(data);
  };

  useEffect(() => {
    loadAnalysis(selectedLotNumber);
  }, [selectedLotNumber]);

  // Handle warehouse lock action
  const handleLockWarehouse = () => {
    setIsLocking(true);
    setTimeout(() => {
      const res = RecallService.lockWarehouseInventory();
      loadAnalysis(selectedLotNumber);
      setIsLocking(false);
      setFeedbackMessage(res.message);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }, 400);
  };

  // Handle dispatch notices action
  const handleDispatchNotices = () => {
    setIsSendingNotices(true);
    setTimeout(() => {
      const res = RecallService.dispatchDistributorNotices();
      loadAnalysis(selectedLotNumber);
      setIsSendingNotices(false);
      setFeedbackMessage(
        `Urgent electronic recall notices transmitted to ${res.noticesCount} wholesale accounts.`
      );
      setTimeout(() => setFeedbackMessage(null), 5000);
    }, 500);
  };

  // Handle individual DC acknowledgment simulation
  const handleAcknowledgeDC = (dispatchNumber: string) => {
    RecallService.acknowledgeCustomerQuarantine(dispatchNumber);
    loadAnalysis(selectedLotNumber);
    setFeedbackMessage(`Quarantine verified and logged for consignment ${dispatchNumber}.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Copy dossier text
  const handleCopyDossier = () => {
    const text = document.getElementById("fda-dossier-content")?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!analysis) return null;

  const isWarehouseLocked = analysis.impactSummary.isWarehouseLocked;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Recall Intelligence & Incident Commander
            </h1>
            <DemoBadge label="DETERMINISTIC SIMULATION" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculates exact market blast radius from verified batch BOMs and customer dispatches without synthetic assumptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/traceability">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-slate-300">
              <span>View Interactive Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/reports">
            <Button size="sm" variant="forest" className="gap-1.5 text-xs font-semibold">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full FSMA 204 Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Incident Header & Scenario Selector Bar */}
      <Card className="border-rose-300 bg-rose-50/30">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status="ACTIVE" pulse={true} />
                <span className="font-mono text-xs font-bold text-rose-950">
                  {analysis.incidentId}: {analysis.severityClass} Recall Investigation
                </span>
                <DemoBadge label="VERIFIED CTE DATA" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {analysis.title}
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Triggered by out-of-spec laboratory assay: <strong>{analysis.rootCause.contaminant}</strong> confirmed in raw lot <strong>{analysis.rootCause.ingredientLotNumber}</strong> from <strong>{analysis.rootCause.supplierName}</strong>.
              </p>
            </div>

            {/* Quick Actions & Scenario Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600 font-semibold text-[11px]">Scenario:</span>
                <select
                  value={selectedLotNumber}
                  onChange={(e) => setSelectedLotNumber(e.target.value)}
                  className="text-xs font-mono bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="LOT-PNUT-2026-081">⚠️ [Class I] LOT-PNUT-2026-081 (Salmonella)</option>
                  <option value="LOT-OAT-9102">⚠️ [Class II] LOT-OAT-9102 (Missing CoA)</option>
                  <option value="LOT-HONEY-2026-442">✓ [Clean] LOT-HONEY-2026-442 (Routine Mock)</option>
                  <option value="LOT-ALMD-2026-033">✓ [Clean] LOT-ALMD-2026-033 (Routine Mock)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isWarehouseLocked ? "secondary" : "destructive"}
                  size="sm"
                  onClick={handleLockWarehouse}
                  disabled={isLocking || isWarehouseLocked}
                  className="gap-1.5 text-xs font-semibold shadow-2xs"
                >
                  {isWarehouseLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Warehouse Locked</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isLocking ? "Locking..." : "Lock Warehouse Stock"}</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDispatchNotices}
                  disabled={isSendingNotices}
                  className="gap-1.5 border-rose-300 text-rose-900 hover:bg-rose-100 text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5 text-rose-700" />
                  <span>{isSendingNotices ? "Transmitting..." : "Send DC Notices"}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="Compromised Batches"
          value={`${analysis.impactSummary.totalCompromisedBatches} Batches`}
          subtext={analysis.impactSummary.compromisedBatchNumbers.join(", ") || "None"}
          statusVariant={analysis.impactSummary.totalCompromisedBatches ? "danger" : "success"}
        />
        <MetricCard
          title="Total Finished Units"
          value={`${analysis.impactSummary.totalFinishedUnitsProduced.toLocaleString()} Jars`}
          subtext="Manufactured volume"
          statusVariant={analysis.impactSummary.totalFinishedUnitsProduced ? "danger" : "default"}
        />
        <MetricCard
          title="Units In Commerce"
          value={`${analysis.impactSummary.totalUnitsInCommerce.toLocaleString()} Units`}
          subtext="Shipped to wholesale DCs"
          statusVariant={analysis.impactSummary.totalUnitsInCommerce ? "warning" : "default"}
        />
        <MetricCard
          title="Warehouse Quarantined"
          value={`${analysis.impactSummary.totalUnitsWarehouseHeld.toLocaleString()} Units`}
          subtext={isWarehouseLocked ? "100% Stock frozen" : "Action required"}
          statusVariant={isWarehouseLocked ? "success" : "danger"}
        />
        <MetricCard
          title="Distributor Containment"
          value={`${analysis.impactSummary.marketContainmentPercent}%`}
          subtext={`${analysis.impactSummary.totalDistributorsImpacted} Wholesale accounts`}
          statusVariant={analysis.impactSummary.marketContainmentPercent > 60 ? "success" : "warning"}
        />
      </div>

      {/* Command Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("blast_radius")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "blast_radius"
                ? "border-emerald-700 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1. Blast Radius & Market Exposure</span>
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "customers"
                ? "border-emerald-700 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>2. Wholesale DC Consignee Manifest ({analysis.customerConsignments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("dossier")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "dossier"
                ? "border-emerald-700 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. 24-Hour FDA Electronic Dossier</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: BLAST RADIUS & MARKET EXPOSURE */}
      {activeTab === "blast_radius" && (
        <div className="space-y-6">
          {/* Root Culprit & Laboratory Confirmation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border border-slate-200">
              <CardHeader className="py-3 px-4 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Origin Raw Material Root
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-900 text-sm">
                      {analysis.rootCause.ingredientLotNumber}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-200 text-rose-800">
                      RECALLED
                    </span>
                  </div>
                  <div className="font-medium text-slate-900">
                    {analysis.rootCause.ingredientName}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Received: {analysis.rootCause.receivedDate} ({analysis.rootCause.initialQuantity.toLocaleString()} {analysis.rootCause.unit})
                  </div>
                </div>

                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Tier-1 Supplier:</span>
                    <span className="font-semibold text-slate-900">{analysis.rootCause.supplierName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Supplier Code:</span>
                    <span className="text-slate-900">{analysis.rootCause.supplierCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Confirmed Pathogen:</span>
                    <span className="font-bold text-rose-700">{analysis.rootCause.contaminant}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Analytical Assay:</span>
                    <span className="text-slate-700">{analysis.rootCause.labAssayRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Warehouse Quarantined:</span>
                    <span className="font-bold text-emerald-700">
                      {analysis.rootCause.remainingWarehouseQuantity.toLocaleString()} {analysis.rootCause.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affected Finished Batches Table */}
            <Card className="lg:col-span-2 border border-slate-200">
              <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Downstream Finished Goods Affected
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Every production batch formulated using tainted raw material
                  </CardDescription>
                </div>
                <DemoBadge label="TRANSFORMATION CTE" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">Batch Number</th>
                        <th className="py-2.5 px-4">Product Name</th>
                        <th className="py-2.5 px-4">UPC / SKU</th>
                        <th className="py-2.5 px-4 text-right">Yield</th>
                        <th className="py-2.5 px-4 text-right">In Market</th>
                        <th className="py-2.5 px-4 text-right">In Warehouse</th>
                        <th className="py-2.5 px-4">QA Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {analysis.affectedProducts.map((batch) => (
                        <tr key={batch.batchId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {batch.batchNumber}
                          </td>
                          <td className="py-2.5 px-4 font-sans text-slate-800">
                            {batch.productName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {batch.upcBarcode}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium">
                            {batch.yieldQuantity.toLocaleString()} {batch.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right text-rose-700 font-bold">
                            {batch.dispatchedQuantity.toLocaleString()} {batch.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right text-emerald-700 font-semibold">
                            {batch.warehouseQuarantineQuantity.toLocaleString()} {batch.unit}
                          </td>
                          <td className="py-2.5 px-4">
                            <StatusBadge status={batch.qaStatus as any} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Containment Breakdown Bar */}
          <Card className="border border-slate-200">
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Supply Chain Containment & Custody Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700">Total Market Recovery & Warehouse Containment:</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {Math.round(
                      ((analysis.impactSummary.totalUnitsWarehouseHeld +
                        (analysis.impactSummary.totalUnitsInCommerce * analysis.impactSummary.marketContainmentPercent) / 100) /
                        analysis.impactSummary.totalFinishedUnitsProduced) *
                        100
                    )}% Contained
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Warehouse frozen */}
                  <div
                    style={{
                      width: `${(analysis.impactSummary.totalUnitsWarehouseHeld / analysis.impactSummary.totalFinishedUnitsProduced) * 100}%`,
                    }}
                    className="bg-emerald-600 h-full"
                    title="Warehouse Stock Locked"
                  />
                  {/* Market acknowledged */}
                  <div
                    style={{
                      width: `${
                        ((analysis.impactSummary.totalUnitsInCommerce * analysis.impactSummary.marketContainmentPercent) /
                          100 /
                          analysis.impactSummary.totalFinishedUnitsProduced) *
                        100
                      }%`,
                    }}
                    className="bg-amber-500 h-full"
                    title="Distributor Quarantined"
                  />
                  {/* Uncontained */}
                  <div
                    style={{
                      width: `${
                        ((analysis.impactSummary.totalUnitsInCommerce * (100 - analysis.impactSummary.marketContainmentPercent)) /
                          100 /
                          analysis.impactSummary.totalFinishedUnitsProduced) *
                        100
                      }%`,
                    }}
                    className="bg-rose-500 h-full"
                    title="Pending Distributor Notice"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block">
                      {analysis.impactSummary.totalUnitsWarehouseHeld.toLocaleString()} Jars Frozen
                    </span>
                    <span className="text-[10px] text-emerald-800">Seized in on-site cold storage</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      {Math.round(
                        (analysis.impactSummary.totalUnitsInCommerce * analysis.impactSummary.marketContainmentPercent) / 100
                      ).toLocaleString()} Jars Confirmed Held
                    </span>
                    <span className="text-[10px] text-amber-800">Distributor quarantine confirmed</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-950 block">
                      {Math.round(
                        (analysis.impactSummary.totalUnitsInCommerce * (100 - analysis.impactSummary.marketContainmentPercent)) / 100
                      ).toLocaleString()} Jars Outstanding
                    </span>
                    <span className="text-[10px] text-rose-800">Awaiting DC confirmation</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: WHOLESALE DC CONSIGNEE MANIFEST */}
      {activeTab === "customers" && (
        <Card className="border border-slate-200">
          <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Wholesale Consignee Distribution List
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Verified shipping addresses, safety officers, and quarantine status per 21 CFR § 7.42
              </CardDescription>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDispatchNotices}
              disabled={isSendingNotices}
              className="gap-1.5 border-emerald-700 text-emerald-950 hover:bg-emerald-50 text-xs font-semibold shrink-0"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bulk Transmit Electronic Notices</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Distributor / Account</th>
                    <th className="py-2.5 px-4">Facility & Contact</th>
                    <th className="py-2.5 px-4">Dispatch & Carrier</th>
                    <th className="py-2.5 px-4">Affected Consignment</th>
                    <th className="py-2.5 px-4 text-right">Volume</th>
                    <th className="py-2.5 px-4">Quarantine Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {analysis.customerConsignments.map((c) => (
                    <tr key={c.dispatchNumber} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.customerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700 text-[11px]">
                        <div>{c.contactPerson}</div>
                        <div className="text-[10px] text-slate-500">{c.contactEmail}</div>
                        <div className="text-[10px] text-slate-400">{c.destinationDC}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.dispatchNumber}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{c.carrier}</div>
                        <div className="text-[9.5px] text-slate-400">{c.trackingNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-900">{c.productName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{c.batchNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-700">
                        {c.quantityShipped.toLocaleString()} {c.unit}
                      </td>
                      <td className="py-3 px-4">
                        {c.noticeStatus === "ACKNOWLEDGED_QUARANTINED" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            QUARANTINE CONFIRMED
                          </span>
                        ) : c.noticeStatus === "NOTICE_SENT" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            NOTICE TRANSMITTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            PENDING DISPATCH
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {c.noticeStatus !== "ACKNOWLEDGED_QUARANTINED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledgeDC(c.dispatchNumber)}
                            className="text-[10px] h-7 px-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50"
                          >
                            Verify Hold
                          </Button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1 font-sans">
                            <Check className="w-3 h-3" /> Logged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: 24-HOUR FDA ELECTRONIC DOSSIER */}
      {activeTab === "dossier" && (
        <Card className="border border-slate-300 shadow-sm">
          <CardHeader className="py-3 px-4 border-b border-slate-200 bg-slate-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  24-Hour FDA Electronic Recall Dossier & Consignee Submission
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Formatted for submission to FDA Office of Regulatory Affairs under 21 CFR § 7.42 & FSMA 204
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyDossier}
                className="text-xs font-semibold gap-1.5 border-slate-300"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="forest"
                onClick={() => window.print()}
                className="text-xs font-semibold gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Print Official PDF</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 font-mono text-xs leading-relaxed bg-white">
            <div id="fda-dossier-content" className="space-y-6 max-w-4xl text-slate-800">
              {/* Document Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-base font-bold text-slate-950">
                    UNITED STATES FOOD AND DRUG ADMINISTRATION (FDA)
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    OFFICE OF REGULATORY AFFAIRS (ORA) — RECALL NOTIFICATION PACKET
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    FSMA Section 204 Electronic Traceability Record (21 CFR § 1.1455)
                  </div>
                </div>

                <div className="text-right text-[11px]">
                  <div><strong>FEI Number:</strong> {analysis.regulatoryMetadata.fdaEstablishmentIdentifier}</div>
                  <div><strong>Facility Reg:</strong> {analysis.regulatoryMetadata.facilityRegistrationNumber}</div>
                  <div><strong>Submission Date:</strong> {analysis.regulatoryMetadata.declaredAt.split("T")[0]}</div>
                  <div className="text-rose-700 font-bold">24-HR DEADLINE: {analysis.regulatoryMetadata.deadline24h}</div>
                </div>
              </div>

              {/* Section 1 */}
              <div>
                <h3 className="font-bold text-slate-950 uppercase border-b border-slate-200 pb-1 mb-2">
                  1. RECALL CLASSIFICATION & HEALTH HAZARD EVALUATION (HHE)
                </h3>
                <div className="space-y-1.5 text-[11px]">
                  <div><strong>Recall Classification:</strong> <span className="text-rose-700 font-bold">{analysis.severityClass}</span> (Voluntary Firm-Initiated Recall)</div>
                  <div><strong>Product Category:</strong> Spreads, Nut Butters & Confectionery Components</div>
                  <div><strong>Identified Contaminant:</strong> {analysis.rootCause.contaminant}</div>
                  <div><strong>Clinical Hazard Justification:</strong> Salmonella enterica is an organism capable of causing serious and sometimes fatal infections in young children, frail or elderly people, and individuals with weakened immune systems.</div>
                  <div><strong>Source Analytical Record:</strong> {analysis.rootCause.labAssayRef}</div>
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="font-bold text-slate-950 uppercase border-b border-slate-200 pb-1 mb-2">
                  2. TRACEABILITY CHAIN OF CUSTODY (CRITICAL TRACKING EVENTS)
                </h3>
                <div className="space-y-1 text-[11px]">
                  <div><strong>Inward Receiving CTE:</strong> Lot {analysis.rootCause.ingredientLotNumber} ({analysis.rootCause.ingredientName}) received on {analysis.rootCause.receivedDate} from {analysis.rootCause.supplierName} ({analysis.rootCause.supplierCode}).</div>
                  <div><strong>Transformation CTE:</strong> Compounded into {analysis.affectedProducts.length} production batches: {analysis.impactSummary.compromisedBatchNumbers.join(", ")}.</div>
                  <div><strong>Total Finished Volume Produced:</strong> {analysis.impactSummary.totalFinishedUnitsProduced.toLocaleString()} Finished Units.</div>
                  <div><strong>On-Site Warehouse Quarantine:</strong> {analysis.impactSummary.totalUnitsWarehouseHeld.toLocaleString()} Units physically frozen under lock disposition.</div>
                  <div><strong>Commerce / Distributed Volume:</strong> {analysis.impactSummary.totalUnitsInCommerce.toLocaleString()} Units in transit or delivered to wholesale accounts.</div>
                </div>
              </div>

              {/* Section 3: Affected Items Detail */}
              <div>
                <h3 className="font-bold text-slate-950 uppercase border-b border-slate-200 pb-1 mb-2">
                  3. FINISHED PRODUCT LOT ROSTER
                </h3>
                <table className="w-full text-left text-[10.5px] border border-slate-300">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5 border-b border-slate-300">Batch Code</th>
                      <th className="p-1.5 border-b border-slate-300">Product Name</th>
                      <th className="p-1.5 border-b border-slate-300">UPC / SKU</th>
                      <th className="p-1.5 border-b border-slate-300">Production Date</th>
                      <th className="p-1.5 border-b border-slate-300">Expiry Date</th>
                      <th className="p-1.5 border-b border-slate-300 text-right">Dispatched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.affectedProducts.map((p) => (
                      <tr key={p.batchId} className="border-b border-slate-200">
                        <td className="p-1.5 font-bold">{p.batchNumber}</td>
                        <td className="p-1.5 font-sans">{p.productName}</td>
                        <td className="p-1.5">{p.upcBarcode}</td>
                        <td className="p-1.5">{p.productionDate}</td>
                        <td className="p-1.5">{p.expiryDate}</td>
                        <td className="p-1.5 text-right font-bold text-rose-700">
                          {p.dispatchedQuantity.toLocaleString()} {p.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 4: Consignee List */}
              <div>
                <h3 className="font-bold text-slate-950 uppercase border-b border-slate-200 pb-1 mb-2">
                  4. MANDATORY WHOLESALE CONSIGNEE ROSTER
                </h3>
                <table className="w-full text-left text-[10.5px] border border-slate-300">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-1.5 border-b border-slate-300">Consignee Name</th>
                      <th className="p-1.5 border-b border-slate-300">Delivery Address</th>
                      <th className="p-1.5 border-b border-slate-300">Dispatch Number</th>
                      <th className="p-1.5 border-b border-slate-300 text-right">Cases / Jars</th>
                      <th className="p-1.5 border-b border-slate-300">Acknowledgment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.customerConsignments.map((c) => (
                      <tr key={c.dispatchNumber} className="border-b border-slate-200">
                        <td className="p-1.5 font-sans font-bold">{c.customerName}</td>
                        <td className="p-1.5 font-sans text-slate-600">{c.destinationDC}</td>
                        <td className="p-1.5">{c.dispatchNumber}</td>
                        <td className="p-1.5 text-right font-bold">{c.quantityShipped.toLocaleString()} {c.unit}</td>
                        <td className="p-1.5 font-semibold text-emerald-700">{c.noticeStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 5: Electronic Signatures */}
              <div className="pt-4 border-t-2 border-slate-800 grid grid-cols-2 gap-6 text-[11px]">
                <div>
                  <div className="text-slate-500">INCIDENT COMMANDER SIGN-OFF:</div>
                  <div className="font-bold text-slate-900 mt-1">{analysis.regulatoryMetadata.incidentCommander}</div>
                  <div className="text-slate-500 text-[10px]">VP Quality Assurance, TraceX Certified</div>
                  <div className="text-emerald-700 text-[10px] mt-1">✓ Cryptographically Signed & Timestamped</div>
                </div>

                <div>
                  <div className="text-slate-500">REGULATORY COMPLIANCE OFFICER:</div>
                  <div className="font-bold text-slate-900 mt-1">{analysis.regulatoryMetadata.regulatoryLead}</div>
                  <div className="text-slate-500 text-[10px]">FSMA 204 Qualified Regulatory Agent</div>
                  <div className="text-emerald-700 text-[10px] mt-1">✓ Electronically Transmitted via FDA ESG</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
