"use client";

import React, { useState } from "react";
import { X, Sprout, CheckCircle2, AlertTriangle, ShieldAlert, Plus, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Farmer, InboundLot } from "@/types/inbound";

interface InboundRegisterLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmers: Farmer[];
  onLotRegistered: (newLot: InboundLot) => void;
}

export function InboundRegisterLotModal({
  isOpen,
  onClose,
  farmers,
  onLotRegistered,
}: InboundRegisterLotModalProps) {
  const [lotId, setLotId] = useState("");
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.farmerId || "FARM-001");
  const [ingredient, setIngredient] = useState("Hard Amber Durum Wheat");
  const [cropType, setCropType] = useState("Wheat");
  const [quantity, setQuantity] = useState("10000");
  const [unit, setUnit] = useState("kg");
  const [harvestDate, setHarvestDate] = useState("2026-10-05");
  const [receivingDate, setReceivingDate] = useState("2026-10-12");
  const [merchantHub, setMerchantHub] = useState("Central Punjab Grain Silo Hub #2");
  const [labReportStatus, setLabReportStatus] = useState<"AVAILABLE" | "PENDING" | "FAILED" | "EXPIRED" | "UNAVAILABLE">("AVAILABLE");
  const [coaStatus, setCoaStatus] = useState<"VERIFIED" | "MISSING" | "EXPIRED" | "FLAGGED_FAIL">("VERIFIED");
  const [hasContaminant, setHasContaminant] = useState(false);
  const [contaminantParam, setContaminantParam] = useState("Chlorpyrifos");
  const [contaminantValue, setContaminantValue] = useState("0.15 mg/kg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const labParameters = [];
      if (labReportStatus === "AVAILABLE" || labReportStatus === "FAILED") {
        labParameters.push(
          { parameter: "Moisture Content", value: "11.6%", specLimit: "< 13.0%", status: "PASS" as const },
          { parameter: "Foreign Matter", value: "0.20%", specLimit: "< 0.50%", status: "PASS" as const }
        );

        if (hasContaminant || labReportStatus === "FAILED" || coaStatus === "FLAGGED_FAIL") {
          labParameters.push({
            parameter: contaminantParam,
            value: contaminantValue,
            specLimit: "< 0.05 mg/kg",
            status: "FAIL" as const,
          });
        }
      }

      const res = await fetch("/api/inbound/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId,
          farmerId: selectedFarmerId,
          ingredient,
          cropType,
          quantity: Number(quantity),
          unit,
          harvestDate,
          receivingDate,
          merchantHub,
          labReportStatus: hasContaminant ? "FAILED" : labReportStatus,
          coaStatus: hasContaminant ? "FLAGGED_FAIL" : coaStatus,
          labParameters,
          evidenceFileName: `COA-${lotId}.pdf`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to register lot");
        setIsSubmitting(false);
        return;
      }

      onLotRegistered(data.lot);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Register Inbound Agricultural Lot (L2 Inward Receipt)
              </h2>
              <p className="text-[11px] text-slate-500">
                L2 Merchant/Aggregator intake screening before transfer to food manufacturers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Section 1: Lot Identifiers & Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inbound Lot ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LOT-105"
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                L1 Origin Farmer <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedFarmerId}
                onChange={(e) => setSelectedFarmerId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                {farmers.map((f) => (
                  <option key={f.farmerId} value={f.farmerId}>
                    {f.farmerId} - {f.name} ({f.cropType}, {f.farmLocation.split(",")[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Commodity & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ingredient Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Oats">Oats</option>
                <option value="Corn">Corn</option>
                <option value="Mustard">Mustard</option>
                <option value="Soybean">Soybean</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="w-20">
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="MT">MT</option>
                  <option value="quintal">qtl</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Dates & Merchant Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inward Receiving Date
              </label>
              <input
                type="date"
                value={receivingDate}
                onChange={(e) => setReceivingDate(e.target.value)}
                className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aggregator / Merchant Hub
              </label>
              <input
                type="text"
                value={merchantHub}
                onChange={(e) => setMerchantHub(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Laboratory Quality & CoA Credentials */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-emerald-700" />
                <span>Laboratory Test Status &amp; CoA Credentials</span>
              </span>
              <DemoBadge label="DETERMINISTIC SCREENING" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Analytical Lab Report
                </label>
                <select
                  value={labReportStatus}
                  onChange={(e) => setLabReportStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-medium"
                >
                  <option value="AVAILABLE">AVAILABLE (Official Lab Report on file)</option>
                  <option value="PENDING">PENDING (Samples at testing lab)</option>
                  <option value="FAILED">FAILED (Exceedance detected)</option>
                  <option value="UNAVAILABLE">UNAVAILABLE (No report)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Certificate of Analysis (CoA)
                </label>
                <select
                  value={coaStatus}
                  onChange={(e) => setCoaStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-medium"
                >
                  <option value="VERIFIED">VERIFIED (Accredited lab signed CoA)</option>
                  <option value="MISSING">MISSING (Triggers AMBER Verification)</option>
                  <option value="EXPIRED">EXPIRED (Expired audit/CoA)</option>
                  <option value="FLAGGED_FAIL">FLAGGED_FAIL (Triggers RED Hold)</option>
                </select>
              </div>
            </div>

            {/* Simulation of Out-of-Spec Chemical Residue */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasContaminant}
                  onChange={(e) => setHasContaminant(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-rose-800">
                  Simulate Lab Assay Failure (Tests RED risk classification &amp; automatic HOLD)
                </span>
              </label>

              {hasContaminant && (
                <div className="mt-2 grid grid-cols-2 gap-3 p-2.5 rounded bg-rose-50 border border-rose-200">
                  <div>
                    <span className="text-[10px] text-slate-600 block">Tested Chemical/Toxin</span>
                    <input
                      type="text"
                      value={contaminantParam}
                      onChange={(e) => setContaminantParam(e.target.value)}
                      className="w-full font-mono text-xs px-2 py-1 border border-rose-300 rounded bg-white text-rose-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 block">Observed Exceedance</span>
                    <input
                      type="text"
                      value={contaminantValue}
                      onChange={(e) => setContaminantValue(e.target.value)}
                      className="w-full font-mono text-xs px-2 py-1 border border-rose-300 rounded bg-white text-rose-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="forest"
              disabled={isSubmitting}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? "Screening & Registering..." : "Run Risk Screening & Register"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
