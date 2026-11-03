"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Plus, Boxes } from "lucide-react";
import { IngredientLot, LotStatus } from "@/types/ingredient";
import { Button } from "@/components/ui/button";

interface RegisterLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLotCreated: (newLot: IngredientLot) => void;
}

export function RegisterLotModal({
  isOpen,
  onClose,
  onLotCreated,
}: RegisterLotModalProps) {
  const [lotNumber, setLotNumber] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [category, setCategory] = useState<IngredientLot["category"]>("Grains & Cereals");
  const [supplierName, setSupplierName] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [receivedDate, setReceivedDate] = useState("2026-11-03");
  const [expiryDate, setExpiryDate] = useState("");
  const [initialQuantity, setInitialQuantity] = useState<number>(5000);
  const [unit, setUnit] = useState("kg");
  const [status, setStatus] = useState<LotStatus>("RELEASED");
  const [allergens, setAllergens] = useState<string[]>(["NONE"]);
  const [storageConditions, setStorageConditions] = useState("Dry storage (<20°C, <60% RH)");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!lotNumber.trim() || !ingredientName.trim() || !supplierName.trim()) {
      setError("Please fill in the Lot Code, Ingredient Name, and Supplier Name.");
      return;
    }

    setIsSubmitting(true);

    const newLotPayload: IngredientLot = {
      id: `lot-${Date.now().toString(36)}`,
      lotNumber: lotNumber.toUpperCase().trim(),
      ingredientName: ingredientName.trim(),
      category,
      supplier: {
        id: `supp-${supplierCode.toLowerCase() || "ext"}`,
        name: supplierName.trim(),
        code: supplierCode.toUpperCase().trim() || "VND-GEN",
        contactEmail: `qa@${supplierName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        country: "United States",
        facilityAddress: "Supplier Regional Hub",
        auditRating: "A",
      },
      sourceDocument: {
        id: `doc-${Date.now().toString(36)}`,
        fileName: `INWARD-BOL-${lotNumber}.pdf`,
        documentType: "SUPPLIER_INVOICE",
        verifiedAt: new Date().toISOString(),
      },
      receivedDate,
      expiryDate: expiryDate || "2027-12-31",
      initialQuantity: Number(initialQuantity),
      remainingQuantity: Number(initialQuantity),
      quarantinedQuantity: status === "QUARANTINE" ? Number(initialQuantity) : 0,
      unit,
      status,
      allergenProfiles: allergens,
      storageConditions,
      coaVerification: {
        status: status === "RELEASED" ? "VERIFIED" : "PENDING_LAB",
        parameters: [],
      },
      consumptionHistory: [],
      massBalance: {
        totalReceived: Number(initialQuantity),
        totalConsumed: 0,
        remainingRecorded: Number(initialQuantity),
        variance: 0,
        isBalanced: true,
      },
    };

    try {
      const res = await fetch("/api/inventory/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLotPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to register lot.");

      onLotCreated(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                REGISTER INWARD INGREDIENT LOT
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                FDA FSMA 204 Inward Critical Tracking Event (CTE)
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Lot Code *
              </label>
              <input
                type="text"
                placeholder="e.g. LOT-FLOUR-2026-09"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="Nuts & Nut Pastes">Nuts &amp; Nut Pastes</option>
                <option value="Grains & Cereals">Grains &amp; Cereals</option>
                <option value="Sweeteners">Sweeteners</option>
                <option value="Oils & Fats">Oils &amp; Fats</option>
                <option value="Flavorings">Flavorings</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Ingredient Description *
            </label>
            <input
              type="text"
              placeholder="e.g. Whole Grain Wheat Flour (Non-GMO)"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              required
              className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-sans text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Great Plains Milling Co."
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded font-sans text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Supplier Code
              </label>
              <input
                type="text"
                placeholder="e.g. GPM-22"
                value={supplierCode}
                onChange={(e) => setSupplierCode(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Inward Received
              </label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Quantity &amp; Unit
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={initialQuantity}
                  onChange={(e) => setInitialQuantity(Number(e.target.value))}
                  className="w-2/3 h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/3 h-8 px-1 bg-slate-50 border border-slate-200 rounded text-xs text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Initial Disposition Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LotStatus)}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
              >
                <option value="RELEASED">RELEASED (CoA Verified)</option>
                <option value="QUARANTINE">QUARANTINE (Pending Lab)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Allergen Declaration
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "NONE") {
                    setAllergens(["NONE"]);
                  } else {
                    setAllergens([val]);
                  }
                }}
                className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="NONE">None (Allergen Free)</option>
                <option value="PEANUTS">Peanuts</option>
                <option value="TREE_NUTS">Tree Nuts (Almond/Walnut)</option>
                <option value="GLUTEN">Gluten / Wheat</option>
                <option value="DAIRY">Dairy / Milk</option>
                <option value="SOY">Soy</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="forest" size="sm" type="submit" disabled={isSubmitting} className="gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? "Registering..." : "Commit Inward Lot"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
