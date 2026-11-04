"use client";

import React, { useState } from "react";
import { X, Lock, Unlock, AlertTriangle, ShieldAlert, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InboundLot } from "@/types/inbound";

interface InboundHoldReleaseModalProps {
  lot: InboundLot | null;
  isOpen: boolean;
  onClose: () => void;
  onDispositionUpdated: (updatedLot: InboundLot) => void;
}

export function InboundHoldReleaseModal({
  lot,
  isOpen,
  onClose,
  onDispositionUpdated,
}: InboundHoldReleaseModalProps) {
  const [action, setAction] = useState<"RELEASE" | "HOLD" | "REQUEST_VERIFICATION">("RELEASE");
  const [reason, setReason] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("Dr. Evelyn Reed, Chief Food Safety Officer");
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lot) return null;

  const isRed = lot.riskLevel === "RED";

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/inbound/lots/${lot.lotId}/disposition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason,
          notes: reason,
          authorizedBy: isRed && action === "RELEASE" ? authorizedBy : undefined,
          justification: isRed && action === "RELEASE" ? justification : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Action failed");
        setIsSubmitting(false);
        return;
      }

      onDispositionUpdated(data.lot);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to execute disposition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${
              isRed ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {action === "RELEASE" ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hold &amp; Release Disposition: {lot.lotId}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {lot.ingredient} • {lot.farmerName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAction} className="p-5 space-y-4 text-xs">
          {/* Action Choice */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select Disposition Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction("RELEASE")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  action === "RELEASE"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Release Lot</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("REQUEST_VERIFICATION")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  action === "REQUEST_VERIFICATION"
                    ? "border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Verification</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("HOLD")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  action === "HOLD"
                    ? "border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-500"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Hold Lot</span>
              </button>
            </div>
          </div>

          {/* High-Risk Authorized Review Protocol */}
          {action === "RELEASE" && isRed && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-xs">
                    MANDATORY SAFETY PROTOCOL: HIGH-RISK (RED) OVERRIDE
                  </h4>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    This lot contains a confirmed laboratory assay failure. Releasing this lot requires authorized executive review, credential verification, and detailed regulatory justification.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-rose-950 mb-1 text-[11px]">
                  Authorized Food Safety Officer <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="w-full text-xs font-medium px-2.5 py-1.5 border border-rose-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-950 mb-1 text-[11px]">
                  Laboratory Re-Assay Justification (Min 15 chars) <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Confirmatory testing via GC-MS mass spec MW-2026-991 cleared the initial screening false-positive."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-rose-300 rounded bg-white text-slate-900 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {action !== "RELEASE" && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Operational Notes / Justification
              </label>
              <textarea
                rows={2}
                placeholder="Enter administrative justification for hold or verification request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === "HOLD" ? "destructive" : "forest"}
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              {isSubmitting ? "Applying..." : `Confirm ${action}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
