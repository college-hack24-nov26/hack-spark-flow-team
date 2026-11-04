"use client";

import React, { useState } from "react";
import { X, Sprout, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Farmer } from "@/types/inbound";

interface InboundFarmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmerRegistered: (farmer: Farmer) => void;
}

export function InboundFarmerModal({
  isOpen,
  onClose,
  onFarmerRegistered,
}: InboundFarmerModalProps) {
  const [farmerId, setFarmerId] = useState("");
  const [name, setName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [region, setRegion] = useState("Northern Plains");
  const [cropType, setCropType] = useState("Durum Wheat");
  const [harvestDate, setHarvestDate] = useState("2026-10-01");
  const [contactPhone, setContactPhone] = useState("+91 ");
  const [contactEmail, setContactEmail] = useState("");
  const [farmSizeAcres, setFarmSizeAcres] = useState("40");
  const [certificationStatus, setCertificationStatus] = useState<"ORGANIC" | "GAP_CERTIFIED" | "STANDARD" | "UNDER_REVIEW">("GAP_CERTIFIED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inbound/farmers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId,
          name,
          farmLocation,
          region,
          cropType,
          harvestDate,
          contactPhone,
          contactEmail,
          farmSizeAcres: Number(farmSizeAcres),
          certificationStatus,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to register farmer");
        setIsSubmitting(false);
        return;
      }

      onFarmerRegistered(data.farmer);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Register New Agricultural Farmer (L1 Origin)
              </h3>
              <p className="text-[11px] text-slate-500">
                Add farm location, crop profiles, and GAP accreditation records
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

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Farmer ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FARM-006"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Farmer Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Baldev Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Farm Location / Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Barnala District, Punjab, India"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Crop Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
              >
                <option value="Durum Wheat">Durum Wheat</option>
                <option value="Basmati Rice">Basmati Rice</option>
                <option value="Rolled Oats">Rolled Oats</option>
                <option value="Yellow Corn">Yellow Corn</option>
                <option value="Mustard Seed">Mustard Seed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Farm Size (Acres)
              </label>
              <input
                type="number"
                min="1"
                value={farmSizeAcres}
                onChange={(e) => setFarmSizeAcres(e.target.value)}
                className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full font-mono px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Accreditation Status
              </label>
              <select
                value={certificationStatus}
                onChange={(e) => setCertificationStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
              >
                <option value="GAP_CERTIFIED">GAP Certified (Good Agri Practices)</option>
                <option value="ORGANIC">Certified Organic</option>
                <option value="STANDARD">Standard Agro Compliance</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="forest"
              disabled={isSubmitting}
              className="text-xs font-semibold gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? "Registering..." : "Add Farmer"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
