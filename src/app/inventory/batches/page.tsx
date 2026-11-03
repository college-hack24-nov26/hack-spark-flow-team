"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Factory,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  GitFork,
  ArrowRight,
  Plus,
  RefreshCw,
  Boxes,
  Truck,
  Eye,
  ShieldCheck,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { ProductionBatch, QAStatus } from "@/types/batch";
import { BatchDetailDrawer } from "@/components/inventory/BatchDetailDrawer";
import { CreateBatchModal } from "@/components/inventory/CreateBatchModal";

export default function ProductionBatchesPage() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [metrics, setMetrics] = useState({
    totalBatches: 0,
    totalProducedUnits: 0,
    totalDispatchedUnits: 0,
    totalQuarantinedUnits: 0,
    compromisedBatchesCount: 0,
    recalledBatchesCount: 0,
    passedBatchesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQAStatus, setSelectedQAStatus] = useState<string>("ALL");
  const [selectedLine, setSelectedLine] = useState<string>("ALL");
  const [compromisedOnly, setCompromisedOnly] = useState(false);

  // Drawer & Modal States
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  // Fetch batches from API
  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (selectedQAStatus !== "ALL") params.set("qaStatus", selectedQAStatus);
      if (selectedLine !== "ALL") params.set("line", selectedLine);
      if (compromisedOnly) params.set("compromised", "true");

      const res = await fetch(`/api/inventory/batches?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBatches(json.data);
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [searchTerm, selectedQAStatus, selectedLine, compromisedOnly]);

  const handleOpenDrawer = (batch: ProductionBatch) => {
    setSelectedBatch(batch);
    setDrawerOpen(true);
  };

  const handleBatchUpdated = (updatedBatch: ProductionBatch) => {
    setBatches((prev) =>
      prev.map((b) => (b.batchNumber === updatedBatch.batchNumber ? updatedBatch : b))
    );
    setSelectedBatch(updatedBatch);
    setBannerToast(`Disposition for Batch ${updatedBatch.batchNumber} updated to ${updatedBatch.qaStatus}.`);
    setTimeout(() => setBannerToast(null), 4000);
  };

  const handleNewBatchCreated = (newBatch: ProductionBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
    setBannerToast(`New production run ${newBatch.batchNumber} recorded and formulated.`);
    setTimeout(() => setBannerToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Batch Inspection Drawer */}
      <BatchDetailDrawer
        batch={selectedBatch}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBatchUpdated={handleBatchUpdated}
      />

      {/* Formulation Wizard Modal */}
      <CreateBatchModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onBatchCreated={handleNewBatchCreated}
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
              Production Batch Management &amp; BOM Lineage
            </h1>
            <DemoBadge label="FSMA 204 TRANSFORMATION" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manufacturing work orders, finished packaged product yield, raw ingredient consumption BOMs, and warehouse vs. market dispatches.
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
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Production Run</span>
          </Button>
        </div>
      </div>

      {/* Operational Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Units Packaged"
          value={`${metrics.totalProducedUnits.toLocaleString()} units`}
          subtext="Across 5 active manufacturing runs"
          icon={Factory}
          statusVariant="default"
          isDemoData={true}
        />
        <MetricCard
          title="Dispatched to Market"
          value={`${metrics.totalDispatchedUnits.toLocaleString()} units`}
          subtext="In wholesale &amp; retail networks"
          icon={Truck}
          statusVariant="danger"
          isDemoData={true}
        />
        <MetricCard
          title="Warehouse Quarantine"
          value={`${metrics.totalQuarantinedUnits.toLocaleString()} units`}
          subtext="Contained on-premise in facility storage"
          icon={Boxes}
          statusVariant="success"
          isDemoData={true}
        />
        <MetricCard
          title="Compromised Batches"
          value={metrics.compromisedBatchesCount}
          subtext="Compounded using Salmonella lot LOT-081"
          icon={AlertTriangle}
          statusVariant="danger"
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
              placeholder="Search batch #, product title, SKU, work order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Segment */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
              {["ALL", "PASSED", "RECALLED", "PENDING", "QUARANTINED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedQAStatus(st)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                    selectedQAStatus === st
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Packaging Line Filter */}
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-mono text-slate-700"
            >
              <option value="ALL">Packaging Line: All</option>
              <option value="Packaging Line 1">Line 1 (Grains)</option>
              <option value="Packaging Line 2">Line 2 (Nut Butters)</option>
              <option value="Packaging Line 3">Line 3 (High-Capacity)</option>
            </select>

            {/* Compromised Toggle */}
            <button
              onClick={() => setCompromisedOnly(!compromisedOnly)}
              className={`h-8 px-2.5 rounded-md border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                compromisedOnly
                  ? "bg-rose-100 border-rose-300 text-rose-900"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Compromised Batches Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Production Batches Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-800">
              Active Manufacturing Batches Ledger
            </CardTitle>
            <CardDescription>
              Displaying {batches.length} production runs • Click any row to inspect complete BOM composition &amp; dispatches
            </CardDescription>
          </div>
          <DemoBadge label="BOM TRACE REGISTER" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Batch Identifier</th>
                  <th className="py-2.5 px-4 font-medium">Product / Work Order</th>
                  <th className="py-2.5 px-4 font-medium">Yield &amp; Line</th>
                  <th className="py-2.5 px-4 font-medium">Market vs. Storage</th>
                  <th className="py-2.5 px-4 font-medium">Consumed Ingredients (BOM)</th>
                  <th className="py-2.5 px-4 font-medium">QA Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <tr
                    key={batch.batchNumber}
                    onClick={() => handleOpenDrawer(batch)}
                    className={`cursor-pointer transition-colors ${
                      batch.qaStatus === "RECALLED"
                        ? "bg-rose-50/40 hover:bg-rose-50/60"
                        : batch.qaStatus === "QUARANTINED"
                        ? "bg-amber-50/30 hover:bg-amber-50/50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Batch Number */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {batch.qaStatus === "RECALLED" && (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className={batch.qaStatus === "RECALLED" ? "text-rose-900" : ""}>
                          {batch.batchNumber}
                        </span>
                      </div>
                    </td>

                    {/* Product & Work Order */}
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-medium text-slate-900">{batch.product.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {batch.product.sku} • {batch.workOrderId}
                      </div>
                    </td>

                    {/* Yield & Line */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {batch.yieldQuantity.toLocaleString()} {batch.unit}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        {batch.yieldEfficiency}% • {batch.facility.lineIdentifier}
                      </div>
                    </td>

                    {/* Market vs. Storage Balance */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        Dispatched:{" "}
                        <strong className={batch.marketStatus.dispatchedQuantity > 0 ? "text-rose-700" : "text-slate-800"}>
                          {batch.marketStatus.dispatchedQuantity.toLocaleString()}
                        </strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        In Warehouse: {batch.marketStatus.warehouseQuarantineQuantity.toLocaleString()}
                      </div>
                    </td>

                    {/* Consumed Ingredients BOM */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {batch.billOfMaterials.map((ing) => (
                          <span
                            key={ing.lotNumber}
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              ing.isTainted
                                ? "bg-rose-100 text-rose-900 border border-rose-300 font-bold"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {ing.lotNumber} ({ing.actualQuantityUsed} {ing.unit})
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* QA Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={batch.qaStatus} size="sm" pulse={batch.qaStatus === "RECALLED"} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDrawer(batch)}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
