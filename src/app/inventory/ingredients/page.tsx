"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  FileText,
  GitFork,
  ArrowRight,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { IngredientLot, LotStatus } from "@/types/ingredient";
import { IngredientDetailDrawer } from "@/components/inventory/IngredientDetailDrawer";
import { RegisterLotModal } from "@/components/inventory/RegisterLotModal";

export default function IngredientLotsPage() {
  const [lots, setLots] = useState<IngredientLot[]>([]);
  const [metrics, setMetrics] = useState({
    totalLots: 0,
    totalInventoryKg: 0,
    activeReleasedCount: 0,
    quarantinedCount: 0,
    missingCoaCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedAllergen, setSelectedAllergen] = useState<string>("ALL");
  const [selectedCoaStatus, setSelectedCoaStatus] = useState<string>("ALL");

  // Drawer & Modal States
  const [selectedLot, setSelectedLot] = useState<IngredientLot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  // Fetch Lots from API
  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedAllergen !== "ALL") params.set("allergen", selectedAllergen);
      if (selectedCoaStatus !== "ALL") params.set("coaStatus", selectedCoaStatus);

      const res = await fetch(`/api/inventory/ingredients?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLots(json.data);
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error("Failed to load lots:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, [searchTerm, selectedStatus, selectedAllergen, selectedCoaStatus]);

  const handleOpenDrawer = (lot: IngredientLot) => {
    setSelectedLot(lot);
    setDrawerOpen(true);
  };

  const handleLotStatusUpdated = (updatedLot: IngredientLot) => {
    setLots((prev) =>
      prev.map((l) => (l.lotNumber === updatedLot.lotNumber ? updatedLot : l))
    );
    setSelectedLot(updatedLot);
    setBannerToast(`Disposition for Lot ${updatedLot.lotNumber} changed to ${updatedLot.status}.`);
    setTimeout(() => setBannerToast(null), 4000);
  };

  const handleNewLotCreated = (newLot: IngredientLot) => {
    setLots((prev) => [newLot, ...prev]);
    setBannerToast(`New inward lot ${newLot.lotNumber} registered into traceability ledger.`);
    setTimeout(() => setBannerToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Detail Slide-over Drawer */}
      <IngredientDetailDrawer
        lot={selectedLot}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusUpdated={handleLotStatusUpdated}
      />

      {/* Manual Registration Modal */}
      <RegisterLotModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onLotCreated={handleNewLotCreated}
      />

      {/* Toast Alert */}
      {bannerToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-mono border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bannerToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Ingredient Lot Management &amp; Lineage Register
            </h1>
            <DemoBadge label="FSMA 204 LOTS" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Raw material inventory tracked by supplier lot, CoA verification state, mass balance reconciliation, and outward chain-of-custody.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/traceability">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-200">
              <GitFork className="w-3.5 h-3.5 text-slate-600" />
              <span>Trace Lineage Graph</span>
            </Button>
          </Link>

          <Button
            variant="forest"
            size="sm"
            onClick={() => setRegisterModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Register Inward Lot</span>
          </Button>
        </div>
      </div>

      {/* Operational Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Inward Inventory Balance"
          value={`${metrics.totalInventoryKg.toLocaleString()} kg`}
          subtext="Total available across all warehouses"
          icon={Boxes}
          statusVariant="success"
          isDemoData={true}
        />
        <MetricCard
          title="Active Released Lots"
          value={metrics.activeReleasedCount}
          subtext="Available for batch compounding"
          icon={ShieldCheck}
          statusVariant="default"
          isDemoData={true}
        />
        <MetricCard
          title="Quarantined / Recalled"
          value={metrics.quarantinedCount}
          subtext="1 Pathogen Alert • 1 Missing CoA Hold"
          icon={AlertTriangle}
          statusVariant="danger"
          isDemoData={true}
        />
        <MetricCard
          title="Missing CoA Gaps"
          value={metrics.missingCoaCount}
          subtext="Action required before release"
          icon={AlertCircle}
          statusVariant="warning"
          isDemoData={true}
        />
      </div>

      {/* Multi-Parameter Filters & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3 font-mono text-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lot code, ingredient, supplier, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Segment */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
              {["ALL", "RELEASED", "QUARANTINE", "RECALLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                    selectedStatus === status
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Allergen Filter */}
            <select
              value={selectedAllergen}
              onChange={(e) => setSelectedAllergen(e.target.value)}
              className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-mono text-slate-700"
            >
              <option value="ALL">Allergens: All</option>
              <option value="PEANUTS">Allergen: Peanuts</option>
              <option value="TREE_NUTS">Allergen: Tree Nuts</option>
              <option value="NONE">Allergen: None</option>
            </select>

            {/* CoA Filter */}
            <select
              value={selectedCoaStatus}
              onChange={(e) => setSelectedCoaStatus(e.target.value)}
              className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-mono text-slate-700"
            >
              <option value="ALL">CoA State: All</option>
              <option value="VERIFIED">CoA: Verified</option>
              <option value="MISSING_COA">CoA: Missing CoA</option>
              <option value="FLAGGED_FAIL">CoA: Flagged / Fail</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ingredient Lots Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-800">
              Inward Raw Material Lot Ledger
            </CardTitle>
            <CardDescription>
              Displaying {lots.length} verified supplier lots • Click any row to inspect complete inward audit dossier
            </CardDescription>
          </div>
          <DemoBadge label="FSMA 204 REGISTER" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Lot Identifier</th>
                  <th className="py-2.5 px-4 font-medium">Ingredient &amp; Allergen</th>
                  <th className="py-2.5 px-4 font-medium">Approved Supplier</th>
                  <th className="py-2.5 px-4 font-medium">Inventory (Remaining / Initial)</th>
                  <th className="py-2.5 px-4 font-medium">Batches Formulated</th>
                  <th className="py-2.5 px-4 font-medium">CoA State</th>
                  <th className="py-2.5 px-4 font-medium">Disposition</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lots.map((lot) => {
                  const percentRemaining = (lot.remainingQuantity / lot.initialQuantity) * 100;

                  return (
                    <tr
                      key={lot.lotNumber}
                      onClick={() => handleOpenDrawer(lot)}
                      className={`cursor-pointer transition-colors ${
                        lot.status === "RECALLED"
                          ? "bg-rose-50/40 hover:bg-rose-50/60"
                          : lot.status === "QUARANTINE"
                          ? "bg-amber-50/30 hover:bg-amber-50/50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Lot Code */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {lot.status === "RECALLED" && (
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          {lot.status === "QUARANTINE" && (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <span className={lot.status === "RECALLED" ? "text-rose-900" : ""}>
                            {lot.lotNumber}
                          </span>
                        </div>
                      </td>

                      {/* Ingredient & Allergen */}
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-medium text-slate-900">{lot.ingredientName}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {lot.allergenProfiles.map((allergen) => (
                            <span
                              key={allergen}
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                allergen === "NONE"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="font-sans text-slate-800">{lot.supplier.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {lot.supplier.code} • {lot.supplier.country}
                        </div>
                        {lot.farmerOrigin && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              L1 Origin: {lot.farmerOrigin.farmerName} ({lot.farmerOrigin.farmerId})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Inventory Remaining / Initial */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-900">
                            {lot.remainingQuantity.toLocaleString()} {lot.unit}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            of {lot.initialQuantity.toLocaleString()}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lot.status === "RECALLED"
                                ? "bg-rose-500"
                                : percentRemaining < 30
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentRemaining}%` }}
                          />
                        </div>
                      </td>

                      {/* Batches Formulated */}
                      <td className="py-3.5 px-4">
                        {lot.consumptionHistory.length > 0 ? (
                          <span className="font-bold text-slate-800">
                            {lot.consumptionHistory.length} Batches
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0 (Virgin Lot)</span>
                        )}
                      </td>

                      {/* CoA State */}
                      <td className="py-3.5 px-4">
                        {lot.coaVerification.status === "VERIFIED" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            VERIFIED
                          </span>
                        )}
                        {lot.coaVerification.status === "MISSING_COA" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            MISSING_COA
                          </span>
                        )}
                        {lot.coaVerification.status === "FLAGGED_FAIL" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            CONTAMINATED
                          </span>
                        )}
                        {lot.coaVerification.status === "PENDING_LAB" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            PENDING_LAB
                          </span>
                        )}
                      </td>

                      {/* Disposition Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={lot.status} size="sm" pulse={lot.status === "RECALLED"} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDrawer(lot)}
                            className="h-6 px-2 text-slate-600 hover:text-slate-900"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Inspect</span>
                          </Button>
                          <Link href="/traceability">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50"
                            >
                              Trace →
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
