"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Factory,
  Boxes,
  Truck,
  ShieldCheck,
  AlertTriangle,
  GitFork,
  ArrowRight,
  CheckCircle2,
  Clock,
  Scale,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { ProductionBatch, QAStatus } from "@/types/batch";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";

interface BatchDetailDrawerProps {
  batch: ProductionBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onBatchUpdated?: (updatedBatch: ProductionBatch) => void;
}

export function BatchDetailDrawer({
  batch,
  isOpen,
  onClose,
  onBatchUpdated,
}: BatchDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"bom" | "yield" | "dispatches" | "qa">("bom");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showDispositionInput, setShowDispositionInput] = useState(false);
  const [targetStatus, setTargetStatus] = useState<QAStatus>("PASSED");
  const [dispositionReason, setDispositionReason] = useState("");

  if (!isOpen || !batch) return null;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/inventory/batches/${batch.batchNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: dispositionReason,
          signature: targetStatus === "PASSED" ? {
            signedBy: "QA Supervisor On-Duty",
            labClearanceRef: `LAB-CLR-MANUAL-${Date.now().toString(36).toUpperCase()}`,
          } : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update batch status.");

      setFeedback(`Batch disposition successfully changed to ${targetStatus}.`);
      setShowDispositionInput(false);
      if (onBatchUpdated) onBatchUpdated(json.data);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
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
                {batch.batchNumber}
              </span>
              <StatusBadge status={batch.qaStatus} size="sm" pulse={batch.qaStatus === "RECALLED"} />
              <DemoBadge />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              {batch.product.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>SKU: {batch.product.sku}</span>
              <span>•</span>
              <span>WO: {batch.workOrderId}</span>
              <span>•</span>
              <span>Line: {batch.facility.lineIdentifier}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Action Bar */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Link href="/traceability">
              <Button variant="forest" size="sm" className="h-7 gap-1.5 text-[11px]">
                <GitFork className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trace Lineage Graph</span>
              </Button>
            </Link>

            {batch.contaminationExposure.isCompromised && (
              <Link href="/recall">
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px] text-rose-700 border-rose-200 hover:bg-rose-50">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Recall Investigation</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Disposition State Toggle */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTargetStatus(batch.qaStatus === "PASSED" ? "QUARANTINED" : "PASSED");
                setShowDispositionInput(true);
              }}
              className="h-7 text-[11px] text-slate-700"
            >
              Update QA Disposition
            </Button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Disposition Update Overlay */}
        {showDispositionInput && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs font-mono">
            <div className="font-semibold text-slate-900">
              Change Batch QA Status:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as QAStatus)}
                className="h-8 px-2 bg-white border border-slate-300 rounded text-xs"
              >
                <option value="PASSED">PASSED (Release for Dispatch)</option>
                <option value="PENDING">PENDING (Awaiting Lab Assay)</option>
                <option value="QUARANTINED">QUARANTINED (Hold in Warehouse)</option>
                <option value="RECALLED">RECALLED (Public Hazard Flag)</option>
              </select>
              <input
                type="text"
                placeholder="Reason / Hold Justification..."
                value={dispositionReason}
                onChange={(e) => setDispositionReason(e.target.value)}
                className="h-8 px-2 bg-white border border-slate-300 rounded text-xs font-sans"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setShowDispositionInput(false)}>
                Cancel
              </Button>
              <Button
                variant="forest"
                size="sm"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm Disposition</span>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-mono bg-white px-5">
          <button
            onClick={() => setActiveTab("bom")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "bom"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Bill of Materials ({batch.billOfMaterials.length} Lots)
          </button>
          <button
            onClick={() => setActiveTab("yield")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "yield"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Yield &amp; Operations
          </button>
          <button
            onClick={() => setActiveTab("dispatches")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "dispatches"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Market Consignments ({batch.downstreamDispatches.length})
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`py-2.5 px-3 font-medium transition-all ${
              activeTab === "qa"
                ? "border-b-2 border-emerald-600 text-emerald-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            QA Clearance &amp; Audit
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs font-mono">
          {/* TAB 1: Bill of Materials (BOM) */}
          {activeTab === "bom" && (
            <div className="space-y-4">
              {/* Contamination Alert Banner */}
              {batch.contaminationExposure.isCompromised && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>CONTAMINATED BATCH: RECALL SCOPE CONFIRMED</span>
                  </div>
                  <p className="text-[11px] font-sans text-rose-800 leading-relaxed">
                    This manufacturing batch consumed raw ingredient{" "}
                    <code className="bg-rose-100 text-rose-900 px-1 py-0.5 rounded font-bold font-mono">
                      {batch.contaminationExposure.taintedLotNumber}
                    </code>{" "}
                    which tested positive for <em>{batch.contaminationExposure.contaminantName}</em>.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Formulated Inward Raw Ingredients (Transformation CTE)
                </span>
                <span className="text-slate-500 text-[10px]">
                  {batch.billOfMaterials.length} Inward Lots Consumed
                </span>
              </div>

              <div className="space-y-3">
                {batch.billOfMaterials.map((ing) => (
                  <div
                    key={ing.lotNumber}
                    className={`p-4 rounded-lg border transition-all ${
                      ing.isTainted
                        ? "bg-rose-50/50 border-rose-300"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Boxes className={`w-4 h-4 ${ing.isTainted ? "text-rose-600" : "text-slate-500"}`} />
                        <span className={`font-bold ${ing.isTainted ? "text-rose-900" : "text-slate-900"}`}>
                          {ing.lotNumber}
                        </span>
                        {ing.isTainted && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            TAINTED LOT
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">
                        {ing.actualQuantityUsed.toLocaleString()} {ing.unit} used
                      </span>
                    </div>

                    <div className="text-xs font-sans text-slate-800 font-medium mt-1">
                      {ing.ingredientName}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Supplier: {ing.supplierName} • Compounded: {new Date(ing.addedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Allergen:</span>
                        {ing.allergenProfiles.map((a) => (
                          <span key={a} className="text-[9px] px-1 rounded bg-slate-100 text-slate-700 font-bold">
                            {a}
                          </span>
                        ))}
                      </div>

                      <Link href="/inventory/ingredients">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-600 hover:text-slate-900">
                          Inspect Inward Lot →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Yield & Operations */}
          {activeTab === "yield" && (
            <div className="space-y-4">
              {/* Yield Metric Card */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                    Manufacturing Yield Performance
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {batch.yieldEfficiency}% Efficiency
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Yield</span>
                    <span className="text-sm font-bold text-slate-900">
                      {batch.targetQuantity.toLocaleString()} {batch.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Actual Packaged</span>
                    <span className="text-sm font-bold text-slate-900">
                      {batch.yieldQuantity.toLocaleString()} {batch.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Scrap / Loss</span>
                    <span className="text-sm font-bold text-slate-500">
                      {batch.scrapQuantity.toLocaleString()} {batch.unit}
                    </span>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${batch.yieldEfficiency}%` }}
                  />
                </div>
              </div>

              {/* Facility & Shift Details */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Manufacturing Facility &amp; Shift Execution
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Production Facility:</span>
                    <span className="font-semibold text-slate-900">{batch.facility.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Packaging Line:</span>
                    <span className="text-slate-800">{batch.facility.lineIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shift Window:</span>
                    <span className="text-slate-800">{batch.facility.shift}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Line Supervisor:</span>
                    <span className="text-slate-800">{batch.facility.supervisorName}</span>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Finished Product Specifications
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SKU / Item Code:</span>
                    <span className="font-bold text-slate-900">{batch.product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Net Weight / Pack:</span>
                    <span className="text-slate-800">{batch.product.netWeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Case Packaging:</span>
                    <span className="text-slate-800">{batch.product.standardPackSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">UPC Barcode:</span>
                    <span className="text-slate-800">{batch.product.upcBarcode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Dispatches */}
          {activeTab === "dispatches" && (
            <div className="space-y-4">
              {/* Market Distribution Balance Card */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Inventory Distribution Status
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Dispatched to Retail</span>
                    <span className={`text-sm font-bold ${batch.marketStatus.dispatchedQuantity > 0 ? "text-rose-700" : "text-slate-800"}`}>
                      {batch.marketStatus.dispatchedQuantity.toLocaleString()} {batch.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Held in Warehouse Quarantine</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {batch.marketStatus.warehouseQuarantineQuantity.toLocaleString()} {batch.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consignment List */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans block">
                  Outward Shipping Consignments ({batch.downstreamDispatches.length})
                </span>

                {batch.downstreamDispatches.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                    <Truck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800">No Dispatches Recorded</p>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                      All units from this production run are currently contained in warehouse storage.
                    </p>
                  </div>
                ) : (
                  batch.downstreamDispatches.map((dsp) => (
                    <div
                      key={dsp.dispatchNumber}
                      className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-500" />
                          <span className="font-bold text-slate-900">{dsp.dispatchNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 font-bold border border-rose-200">
                            {dsp.status}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {dsp.quantityShipped.toLocaleString()} {dsp.unit}
                        </span>
                      </div>

                      <div className="text-xs font-sans text-slate-800">
                        {dsp.customerName}
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {dsp.destinationDC} • Carrier: {dsp.carrier}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QA Clearance */}
          {activeTab === "qa" && (
            <div className="space-y-4">
              {batch.qaHoldReason && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>QA Administrative Disposition Hold</span>
                  </div>
                  <p className="text-amber-800 text-[11px] font-sans">
                    {batch.qaHoldReason}
                  </p>
                </div>
              )}

              {batch.qaReleaseSignature && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Electronic QA Release</span>
                  </div>
                  <div className="text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Signoff Officer:</span>
                      <span className="font-semibold text-slate-900">{batch.qaReleaseSignature.signedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Release Timestamp:</span>
                      <span className="text-slate-800">{new Date(batch.qaReleaseSignature.signedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Laboratory Assay Ref:</span>
                      <span className="font-mono text-emerald-700 font-bold">{batch.qaReleaseSignature.labClearanceRef}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Document Reference */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                  Manufacturing Record Evidence
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Work Order Batch Sheet:</span>
                  <Link href="/documents" className="text-emerald-700 hover:underline flex items-center gap-1 font-mono">
                    <span>{batch.sourceDocument.fileName}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Verification Ledger ID:</span>
                  <span className="text-slate-700 font-mono">{batch.sourceDocument.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">FSMA 204 Transformation CTE Record Verified</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}
