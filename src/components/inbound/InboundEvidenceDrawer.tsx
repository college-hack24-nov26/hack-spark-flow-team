"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Beaker,
  Sprout,
  FileCheck2,
  Building,
  Check,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Factory,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { InboundLot, Farmer } from "@/types/inbound";

interface InboundEvidenceDrawerProps {
  lot: InboundLot | null;
  farmer: Farmer | null;
  isOpen: boolean;
  onClose: () => void;
  onPromoted?: (promotedLotId: string) => void;
}

export function InboundEvidenceDrawer({
  lot,
  farmer,
  isOpen,
  onClose,
  onPromoted,
}: InboundEvidenceDrawerProps) {
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionNotice, setPromotionNotice] = useState<string | null>(null);

  if (!isOpen || !lot) return null;

  const isRed = lot.riskLevel === "RED";
  const isAmber = lot.riskLevel === "AMBER";

  const handlePromoteToMfg = async () => {
    setIsPromoting(true);
    setPromotionNotice(null);

    try {
      const res = await fetch(`/api/inbound/lots/${lot.lotId}/disposition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PROMOTE_TO_MFG" }),
      });

      const data = await res.json();
      if (data.success) {
        setPromotionNotice(`Successfully promoted to L3 Manufacturer Lot '${data.ingredientLot.lotNumber}'. Connected to Ingredient Lots & Traceability Graph!`);
        if (onPromoted) onPromoted(data.ingredientLot.id);
      } else {
        setPromotionNotice(`Promotion blocked: ${data.error}`);
      }
    } catch (e: any) {
      setPromotionNotice(`Error: ${e.message}`);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-slate-900 border-l border-slate-800 text-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>L2 Inbound Intake Dossier</span>
              <DemoBadge label="EVIDENCE ARCHIVE" />
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{lot.lotId}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">
                ({lot.ingredient})
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Promotion Feedback Banner */}
        {promotionNotice && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{promotionNotice}</span>
          </div>
        )}

        {/* Risk Classification Callout */}
        <div
          className={`p-3.5 rounded-lg border space-y-2 ${
            isRed
              ? "bg-rose-950/80 border-rose-600 text-rose-200"
              : isAmber
              ? "bg-amber-950/60 border-amber-600 text-amber-200"
              : "bg-emerald-950/60 border-emerald-600 text-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs">
              {isRed ? (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              ) : isAmber ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>RISK RATING: {lot.riskLevel}</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                isRed
                  ? "bg-rose-900 text-rose-100 border-rose-500 animate-pulse"
                  : isAmber
                  ? "bg-amber-900 text-amber-100 border-amber-500"
                  : "bg-emerald-900 text-emerald-100 border-emerald-500"
              }`}
            >
              DISPOSITION: {lot.dispositionStatus}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {lot.riskExplanation}
          </p>
        </div>

        {/* L1 Origin Farmer Profile */}
        <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-700 pb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>L1 Farm Origin &amp; Farmer Registry</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {farmer?.certificationStatus || "GAP_CERTIFIED"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] block">Farmer Name</span>
              <span className="font-semibold text-white">{lot.farmerName} ({lot.farmerId})</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Farm Size</span>
              <span className="font-mono text-slate-200">{farmer?.farmSizeAcres || 45} Acres</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Location</span>
              <span className="text-slate-200">{lot.farmLocation}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Harvest Date</span>
              <span className="font-mono text-slate-200">{lot.harvestDate}</span>
            </div>
          </div>

          {farmer?.contactPhone && (
            <div className="pt-2 border-t border-slate-700/60 flex items-center gap-4 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{farmer.contactPhone}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{farmer.contactEmail}</span>
              </span>
            </div>
          )}
        </div>

        {/* Laboratory Analytical Test Parameters Table */}
        <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-700 pb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-emerald-400" />
              <span>Laboratory Analytical Test Results</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              CoA: {lot.coaStatus}
            </span>
          </div>

          {lot.labParameters && lot.labParameters.length > 0 ? (
            <div className="space-y-1.5">
              {lot.labParameters.map((param, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-[10.5px] font-mono"
                >
                  <div>
                    <span className="text-slate-300 font-sans block">{param.parameter}</span>
                    <span className="text-slate-500 text-[9.5px]">Limit: {param.specLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        param.status === "FAIL" ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {param.value}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                        param.status === "FAIL"
                          ? "bg-rose-950 text-rose-200 border border-rose-700"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      }`}
                    >
                      {param.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center bg-slate-900/60 rounded border border-slate-800 text-slate-400 text-xs">
              No analytical laboratory report uploaded yet. Lot held for verification.
            </div>
          )}
        </div>

        {/* Evidence Document Details */}
        {lot.evidenceDocument && (
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-700 pb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Laboratory Documentation</span>
              </span>
              <span className="text-[9.5px] font-mono text-slate-400">
                {lot.evidenceDocument.documentRef}
              </span>
            </div>

            <div className="text-[11px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">File:</span>
                <span className="text-emerald-300">{lot.evidenceDocument.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Testing Facility:</span>
                <span className="text-slate-200">{lot.evidenceDocument.labName || "Accredited Agri-Lab"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Timestamp:</span>
                <span className="text-slate-400">{lot.evidenceDocument.uploadedAt?.split("T")[0]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Authorized Human Review Record if present */}
        {lot.authorizedReview && (
          <div className="p-3 rounded-lg bg-slate-800/80 border border-amber-600/70 space-y-1.5 text-xs">
            <div className="font-bold text-amber-300 text-[11px] flex items-center justify-between">
              <span>Authorized Executive Review Sign-off</span>
              <span className="text-[9.5px] font-mono">{lot.authorizedReview.signOffRef}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              <strong>Signer:</strong> {lot.authorizedReview.reviewedBy}
            </div>
            <div className="text-[10.5px] text-slate-400 leading-relaxed font-mono">
              &quot;{lot.authorizedReview.justification}&quot;
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-2">
        {lot.dispositionStatus === "RELEASED" && (
          <Button
            variant="forest"
            disabled={isPromoting}
            onClick={handlePromoteToMfg}
            className="w-full gap-2 text-xs font-semibold shadow-xs"
          >
            <Factory className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isPromoting ? "Connecting..." : "Promote to Food Manufacturer Inventory (L3)"}</span>
          </Button>
        )}

        <div className="flex gap-2">
          <Link href="/inventory/ingredients" className="flex-1">
            <Button variant="outline" className="w-full text-xs border-slate-700 text-slate-300 hover:text-white">
              <span>View Inward Ingredients</span>
            </Button>
          </Link>
          <Link href="/traceability" className="flex-1">
            <Button variant="outline" className="w-full text-xs border-slate-700 text-slate-300 hover:text-white">
              <span>Traceability Graph</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
