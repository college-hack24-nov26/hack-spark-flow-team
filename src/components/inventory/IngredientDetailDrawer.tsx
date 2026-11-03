"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Boxes,
  Building,
  FileText,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  GitFork,
  ArrowRight,
  Factory,
  CheckCircle2,
  Clock,
  Layers,
  Scale,
  Upload,
  AlertCircle,
} from "lucide-react";
import { IngredientLot, LotStatus } from "@/types/ingredient";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";

interface IngredientDetailDrawerProps {
  lot: IngredientLot | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedLot: IngredientLot) => void;
}

export function IngredientDetailDrawer({
  lot,
  isOpen,
  onClose,
  onStatusUpdated,
}: IngredientDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "coa" | "batches" | "mass_balance">("specs");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showQuarantineInput, setShowQuarantineInput] = useState(false);
  const [quarantineReasonText, setQuarantineReasonText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen || !lot) return null;

  const calculateDaysRemaining = (expiryDateStr: string) => {
    try {
      const exp = new Date(expiryDateStr);
      const now = new Date();
      const diffTime = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysRemaining = calculateDaysRemaining(lot.expiryDate);

  const handleUpdateStatus = async (newStatus: LotStatus, reason?: string) => {
    setIsUpdatingStatus(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/inventory/ingredients/${lot.lotNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update lot status.");

      setFeedbackMessage(`Lot ${lot.lotNumber} marked as ${newStatus}.`);
      setShowQuarantineInput(false);
      if (onStatusUpdated) onStatusUpdated(json.data);
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAttachCoASimulation = async () => {
    setIsUpdatingStatus(true);
    try {
      const sampleAssays = [
        { parameter: "Moisture Content", value: "10.4%", specLimit: "< 13.0%", status: "PASS" },
        { parameter: "Salmonella", value: "NEGATIVE", specLimit: "Absence / 25g", status: "PASS" },
        { parameter: "Foreign Matter", value: "0.01%", specLimit: "< 0.05%", status: "PASS" },
      ];

      const res = await fetch(`/api/inventory/ingredients/${lot.lotNumber}/attach-coa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labName: "National Grain & Cereal Inspection Bureau",
          testDate: new Date().toISOString().split("T")[0],
          parameters: sampleAssays,
          fileName: `COA-${lot.lotNumber}-VERIFIED.pdf`,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to attach CoA.");

      setFeedbackMessage(`CoA successfully verified and attached. Lot released from quarantine.`);
      if (onStatusUpdated) onStatusUpdated(json.data);
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: any) {
      setFeedbackMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      {/* Slide-over Panel */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                {lot.lotNumber}
              </span>
              <StatusBadge status={lot.status} size="sm" pulse={lot.status === "RECALLED"} />
              <DemoBadge />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {lot.ingredientName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>Category: {lot.category}</span>
              <span>•</span>
              <span>Supplier: {lot.supplier.name}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Quick Action Bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Link href="/traceability">
              <Button variant="forest" size="sm" className="h-7 gap-1.5 text-[11px]">
                <GitFork className="w-3.5 h-3.5 text-emerald-400" />
                <span>Launch Trace Graph</span>
              </Button>
            </Link>

            <Link href="/recall">
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Recall Simulation</span>
              </Button>
            </Link>
          </div>

          {/* Disposition Controls */}
          <div className="flex items-center gap-1.5">
            {lot.status !== "QUARANTINE" && lot.status !== "RECALLED" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuarantineInput(true)}
                disabled={isUpdatingStatus}
                className="h-7 text-[11px] text-amber-800 border-amber-300 hover:bg-amber-50"
              >
                Quarantine Lot
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus("RELEASED")}
                disabled={isUpdatingStatus}
                className="h-7 text-[11px] text-emerald-800 border-emerald-300 hover:bg-emerald-50"
              >
                Release Lot
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Quarantine Reason Form Overlay */}
        {showQuarantineInput && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 space-y-2 text-xs">
            <div className="font-semibold text-amber-900">
              Administrative Quarantine Justification:
            </div>
            <input
              type="text"
              placeholder="e.g. Suspected seal compromise on inward bags, awaiting lab re-test..."
              value={quarantineReasonText}
              onChange={(e) => setQuarantineReasonText(e.target.value)}
              className="w-full h-8 px-2.5 bg-white border border-amber-300 rounded text-xs focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setShowQuarantineInput(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleUpdateStatus("QUARANTINE", quarantineReasonText)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Confirm Quarantine Hold
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-mono bg-white px-5">
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "specs"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Specs &amp; Inward Details
          </button>
          <button
            onClick={() => setActiveTab("coa")}
            className={`py-2.5 px-3 font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "coa"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Certificate of Analysis</span>
            {lot.coaVerification.status === "MISSING_COA" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
            {lot.coaVerification.status === "FLAGGED_FAIL" && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "batches"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Production Usages ({lot.consumptionHistory.length})
          </button>
          <button
            onClick={() => setActiveTab("mass_balance")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "mass_balance"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Mass Balance Reconciliation
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs font-mono">
          {/* TAB 1: Specs & Inward Receipt */}
          {activeTab === "specs" && (
            <div className="space-y-5">
              {/* Quarantine Banner if Active */}
              {lot.quarantineReason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Active Hold Notice</span>
                  </div>
                  <p className="text-amber-800 text-[11px] font-sans">
                    {lot.quarantineReason}
                  </p>
                </div>
              )}

              {/* Inward Inventory Card */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Inward Inventory Quantities
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Initial Received</span>
                    <span className="text-sm font-bold text-slate-900">
                      {lot.initialQuantity.toLocaleString()} {lot.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Current Remaining</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {lot.remainingQuantity.toLocaleString()} {lot.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Quarantined Hold</span>
                    <span className={`text-sm font-bold ${lot.quarantinedQuantity > 0 ? "text-amber-700" : "text-slate-400"}`}>
                      {lot.quarantinedQuantity.toLocaleString()} {lot.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Critical Dates & Expiration */}
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Critical Tracking Events (CTEs) &amp; Timeline
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Received Timestamp</span>
                    <span className="text-xs font-semibold text-slate-800">{lot.receivedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Expiration Date</span>
                    <span className="text-xs font-semibold text-slate-800">{lot.expiryDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Remaining Shelf Life:</span>
                  <span className={`font-bold ${daysRemaining && daysRemaining < 60 ? "text-amber-700" : "text-emerald-700"}`}>
                    {daysRemaining !== null ? `${daysRemaining} days remaining` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Supplier & Chain of Custody */}
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                    Approved Supplier Dossier
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    Audit Grade: {lot.supplier.auditRating}
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendor Entity:</span>
                    <span className="font-semibold text-slate-900">{lot.supplier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Supplier Code:</span>
                    <span className="text-slate-800">{lot.supplier.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Origin Region:</span>
                    <span className="text-slate-800">{lot.supplier.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Facility Address:</span>
                    <span className="text-slate-700 font-sans truncate max-w-xs">{lot.supplier.facilityAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Safety Email:</span>
                    <span className="text-emerald-700">{lot.supplier.contactEmail}</span>
                  </div>
                </div>
              </div>

              {/* Allergens & Storage */}
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Allergen Profile &amp; Storage Conditions
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-slate-500 text-[11px]">Allergens:</span>
                  {lot.allergenProfiles.map((allergen) => (
                    <span
                      key={allergen}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        allergen === "NONE"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 font-sans pt-1">
                  {lot.storageConditions}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Certificate of Analysis (CoA) */}
          {activeTab === "coa" && (
            <div className="space-y-4">
              {/* Missing CoA Banner & 1-Click Fix */}
              {lot.coaVerification.status === "MISSING_COA" && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        COMPLIANCE GAP: MISSING CERTIFICATE OF ANALYSIS
                      </h4>
                      <p className="text-[11px] font-sans text-amber-800 mt-1 leading-relaxed">
                        Under FSMA 204 QA regulations, this raw ingredient lot cannot be released to production lines until a certified analytical report is validated.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex justify-end">
                    <Button
                      size="sm"
                      variant="forest"
                      onClick={handleAttachCoASimulation}
                      disabled={isUpdatingStatus}
                      className="gap-1.5 text-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isUpdatingStatus ? "Validating CoA..." : "Upload & Verify Lab CoA Now"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Tainted / Failed Assay Alert */}
              {lot.coaVerification.status === "FLAGGED_FAIL" && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>HAZARD ALERT: OUT-OF-SPEC CONTAMINANT CONFIRMED</span>
                  </div>
                  <p className="text-[11px] font-sans text-rose-800">
                    Laboratory testing identified pathogen contamination. This lot is restricted from production and triggered in active Recall Incident RCL-2026-004.
                  </p>
                </div>
              )}

              {/* Lab Metadata Header */}
              {lot.coaVerification.status !== "MISSING_COA" && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Testing Laboratory:</span>
                    <span className="font-semibold text-slate-900">{lot.coaVerification.labName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assay Date:</span>
                    <span className="text-slate-800">{lot.coaVerification.testDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Source Doc:</span>
                    <Link href="/documents" className="text-emerald-700 hover:underline flex items-center gap-1">
                      <span>{lot.sourceDocument.fileName}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Lab Parameters Table */}
              {lot.coaVerification.parameters.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans mb-2">
                    Chemical &amp; Microbial Laboratory Assays ({lot.coaVerification.parameters.length})
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Assay Parameter</th>
                          <th className="p-2.5">Observed Value</th>
                          <th className="p-2.5">Specification Limit</th>
                          <th className="p-2.5 text-right">Disposition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lot.coaVerification.parameters.map((param, idx) => (
                          <tr
                            key={idx}
                            className={param.status === "FAIL" ? "bg-rose-50/60" : "hover:bg-slate-50"}
                          >
                            <td className="p-2.5 font-sans font-medium text-slate-900">
                              {param.parameter}
                            </td>
                            <td className={`p-2.5 font-bold ${param.status === "FAIL" ? "text-rose-700" : "text-slate-800"}`}>
                              {param.value}
                            </td>
                            <td className="p-2.5 text-slate-500">{param.specLimit}</td>
                            <td className="p-2.5 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  param.status === "FAIL"
                                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                }`}
                              >
                                {param.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Production Batches Usage */}
          {activeTab === "batches" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Compounded Downstream Batches
                </span>
                <span className="text-slate-500 text-[10px]">
                  {lot.consumptionHistory.length} Manufacturing Runs
                </span>
              </div>

              {lot.consumptionHistory.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                  <Boxes className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">Unconsumed Virgin Lot</p>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    This raw lot has not been formulated into any finished production batches yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lot.consumptionHistory.map((usage) => (
                    <div
                      key={usage.batchNumber}
                      className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Factory className="w-4 h-4 text-slate-500" />
                          <span className="font-bold text-slate-900">{usage.batchNumber}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                            {usage.lineIdentifier}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          {usage.quantityUsed.toLocaleString()} {usage.unit} consumed
                        </span>
                      </div>

                      <div className="text-xs font-sans text-slate-700">
                        {usage.productName}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {usage.sku} • Formulated: {new Date(usage.usedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Link href="/traceability">
                          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-slate-600 hover:text-slate-900">
                            Trace Batch Explosion →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Mass Balance Reconciliation */}
          {activeTab === "mass_balance" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                    Deterministic Inventory Ledger Equation
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    lot.massBalance.isBalanced ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {lot.massBalance.isBalanced ? "100% RECONCILED" : "VARIANCE DETECTED"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">(+) Initial Received:</span>
                    <span className="font-bold text-slate-900">{lot.massBalance.totalReceived.toLocaleString()} {lot.unit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">(-) Total Formulated into Batches:</span>
                    <span className="font-bold text-rose-700">-{lot.massBalance.totalConsumed.toLocaleString()} {lot.unit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">(=) Current Warehouse Balance:</span>
                    <span className="font-bold text-emerald-700">{lot.massBalance.remainingRecorded.toLocaleString()} {lot.unit}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-700 font-bold">Unaccounted Variance:</span>
                    <span className="font-bold text-slate-900">{lot.massBalance.variance} {lot.unit}</span>
                  </div>
                </div>
              </div>

              {/* Allocation Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-500 font-sans">
                  <span>Inventory Distribution</span>
                  <span>{((lot.massBalance.totalConsumed / lot.massBalance.totalReceived) * 100).toFixed(1)}% Consumed</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${(lot.massBalance.totalConsumed / lot.massBalance.totalReceived) * 100}%` }}
                    title={`Consumed: ${lot.massBalance.totalConsumed} kg`}
                  />
                  <div
                    className="bg-emerald-300 h-full"
                    style={{ width: `${(lot.massBalance.remainingRecorded / lot.massBalance.totalReceived) * 100}%` }}
                    title={`Remaining: ${lot.massBalance.remainingRecorded} kg`}
                  />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-600" />
                    <span>Compounded in Batches</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-300" />
                    <span>In Warehouse Storage</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">FSMA 204 Inward Lot Verification Active</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}
