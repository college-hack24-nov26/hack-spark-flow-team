"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Factory, Plus, Trash2, Boxes } from "lucide-react";
import { ProductionBatch, QAStatus, BOMIngredientUsage } from "@/types/batch";
import { Button } from "@/components/ui/button";

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated: (newBatch: ProductionBatch) => void;
}

const AVAILABLE_LOTS = [
  { lotNumber: "LOT-ALMD-2026-033", name: "California Almond Paste", available: 2200, unit: "kg", isTainted: false, allergens: ["TREE_NUTS"] },
  { lotNumber: "LOT-OAT-2026-019", name: "Gluten-Free Rolled Oats", available: 3900, unit: "kg", isTainted: false, allergens: ["NONE"] },
  { lotNumber: "LOT-SUGR-2026-112", name: "Cane Sugar Granules", available: 4500, unit: "kg", isTainted: false, allergens: ["NONE"] },
  { lotNumber: "LOT-COCOA-2026-045", name: "Organic Dutch Cocoa Powder", available: 1800, unit: "kg", isTainted: false, allergens: ["NONE"] },
  { lotNumber: "LOT-PNUT-2026-081", name: "Roasted Peanut Paste", available: 1250, unit: "kg", isTainted: true, allergens: ["PEANUTS"] },
];

export function CreateBatchModal({
  isOpen,
  onClose,
  onBatchCreated,
}: CreateBatchModalProps) {
  const [batchNumber, setBatchNumber] = useState("");
  const [workOrderId, setWorkOrderId] = useState("");
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [lineIdentifier, setLineIdentifier] = useState("Packaging Line 2");
  const [shift, setShift] = useState<ProductionBatch["facility"]["shift"]>("Morning (06:00 - 14:00)");
  const [targetQuantity, setTargetQuantity] = useState<number>(4000);
  const [yieldQuantity, setYieldQuantity] = useState<number>(3950);
  const [unit, setUnit] = useState("jars");
  const [qaStatus, setQaStatus] = useState<QAStatus>("PASSED");

  // Dynamic BOM builder
  const [selectedBOM, setSelectedBOM] = useState<
    { lotNumber: string; ingredientName: string; quantity: number; unit: string; isTainted: boolean; allergens: string[] }[]
  >([
    { lotNumber: "LOT-ALMD-2026-033", ingredientName: "California Almond Paste", quantity: 1500, unit: "kg", isTainted: false, allergens: ["TREE_NUTS"] },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setSelectedBOM([
      ...selectedBOM,
      { lotNumber: "LOT-SUGR-2026-112", ingredientName: "Cane Sugar Granules", quantity: 200, unit: "kg", isTainted: false, allergens: ["NONE"] },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setSelectedBOM(selectedBOM.filter((_, i) => i !== index));
  };

  const handleLotChange = (index: number, lotNumber: string) => {
    const lotMeta = AVAILABLE_LOTS.find((l) => l.lotNumber === lotNumber);
    if (!lotMeta) return;

    const updated = [...selectedBOM];
    updated[index] = {
      lotNumber: lotMeta.lotNumber,
      ingredientName: lotMeta.name,
      quantity: 500,
      unit: lotMeta.unit,
      isTainted: lotMeta.isTainted,
      allergens: lotMeta.allergens,
    };
    setSelectedBOM(updated);
  };

  const hasTaintedInBOM = selectedBOM.some((item) => item.isTainted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!batchNumber.trim() || !productName.trim() || !sku.trim()) {
      setError("Please fill in Batch Code, Product Name, and SKU.");
      return;
    }

    if (selectedBOM.length === 0) {
      setError("At least one ingredient lot must be included in the Bill of Materials.");
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<ProductionBatch> = {
      batchNumber: batchNumber.toUpperCase().trim(),
      workOrderId: workOrderId.toUpperCase().trim() || `WO-${Date.now().toString(36).toUpperCase()}`,
      product: {
        id: `prod-${Date.now().toString(36)}`,
        name: productName.trim(),
        sku: sku.toUpperCase().trim(),
        category: "Spreads & Nut Butters",
        netWeight: "350g",
        standardPackSize: "12 units / case",
        upcBarcode: `85002194${Math.floor(1000 + Math.random() * 9000)}`,
      },
      facility: {
        name: "Austin Processing Facility #1",
        lineIdentifier,
        supervisorName: "Dr. Evelyn Reed (QA Director)",
        shift,
      },
      productionDate: "2026-11-03",
      expiryDate: "2027-11-03",
      targetQuantity: Number(targetQuantity),
      yieldQuantity: Number(yieldQuantity),
      unit,
      qaStatus: hasTaintedInBOM ? "QUARANTINED" : qaStatus,
      billOfMaterials: selectedBOM.map((item) => ({
        ingredientLotId: `lot-ref-${item.lotNumber}`,
        lotNumber: item.lotNumber,
        ingredientName: item.ingredientName,
        supplierName: "Verified Inward Supplier",
        plannedQuantity: Number(item.quantity),
        actualQuantityUsed: Number(item.quantity),
        unit: item.unit,
        addedAt: new Date().toISOString(),
        isTainted: item.isTainted,
        allergenProfiles: item.allergens,
      })),
    };

    try {
      const res = await fetch("/api/inventory/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to record production batch.");

      onBatchCreated(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                RECORD PRODUCTION RUN &amp; BOM FORMULATION
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                FSMA 204 Transformation Critical Tracking Event (CTE)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hasTaintedInBOM && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">CRITICAL WARNING: Tainted Ingredient Selected!</span>
                <p className="text-[11px] font-sans mt-0.5">
                  Lot LOT-PNUT-2026-081 is flagged with a Salmonella microbial alert. If formulated, this batch will automatically be placed under mandatory Quarantine.
                </p>
              </div>
            </div>
          )}

          {/* Batch Code & Work Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                placeholder="e.g. BATCH-2026-1060"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Work Order #
              </label>
              <input
                type="text"
                placeholder="e.g. WO-LINE2-2026-905"
                value={workOrderId}
                onChange={(e) => setWorkOrderId(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
              />
            </div>
          </div>

          {/* Product & SKU */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Finished Product Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Creamy Almond Butter 350g"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-sans text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Product SKU *
              </label>
              <input
                type="text"
                placeholder="e.g. SKU-ALMD-CREAMY-350G"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
              />
            </div>
          </div>

          {/* Line & Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Packaging Line
              </label>
              <select
                value={lineIdentifier}
                onChange={(e) => setLineIdentifier(e.target.value)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="Packaging Line 1">Packaging Line 1 (Grains & Oats)</option>
                <option value="Packaging Line 2">Packaging Line 2 (Nut Butters)</option>
                <option value="Packaging Line 3">Packaging Line 3 (High-Capacity)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="Morning (06:00 - 14:00)">Morning (06:00 - 14:00)</option>
                <option value="Evening (14:00 - 22:00)">Evening (14:00 - 22:00)</option>
                <option value="Night (22:00 - 06:00)">Night (22:00 - 06:00)</option>
              </select>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Target Yield
              </label>
              <input
                type="number"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(Number(e.target.value))}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Actual Yield
              </label>
              <input
                type="number"
                value={yieldQuantity}
                onChange={(e) => setYieldQuantity(Number(e.target.value))}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Packaging Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-center font-bold"
              />
            </div>
          </div>

          {/* Bill of Materials Builder */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-sans">
                Formulation Bill of Materials (BOM)
              </span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleAddIngredient}
                className="h-6 px-2 text-[10px] gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Ingredient</span>
              </Button>
            </div>

            <div className="space-y-2">
              {selectedBOM.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
                  <select
                    value={item.lotNumber}
                    onChange={(e) => handleLotChange(idx, e.target.value)}
                    className="w-1/2 h-7 px-1.5 bg-white border border-slate-200 rounded text-[11px]"
                  >
                    {AVAILABLE_LOTS.map((lot) => (
                      <option key={lot.lotNumber} value={lot.lotNumber}>
                        {lot.lotNumber} ({lot.name} - {lot.available} {lot.unit})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 w-1/3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...selectedBOM];
                        updated[idx].quantity = Number(e.target.value);
                        setSelectedBOM(updated);
                      }}
                      className="w-2/3 h-7 px-2 bg-white border border-slate-200 rounded text-[11px] font-bold"
                    />
                    <span className="text-[11px] text-slate-500 font-bold">{item.unit}</span>
                  </div>

                  {selectedBOM.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="forest" size="sm" type="submit" disabled={isSubmitting} className="gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? "Recording..." : "Formulate & Record Batch"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
