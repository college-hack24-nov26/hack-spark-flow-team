"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Calendar,
  Building,
} from "lucide-react";
import { ExtractedDocumentData, DocumentType } from "@/types/extraction";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  fileName: string;
  initialData: ExtractedDocumentData;
  onConfirmSuccess: (result: any) => void;
}

export function ExtractionReviewModal({
  isOpen,
  onClose,
  documentId,
  fileName,
  initialData,
  onConfirmSuccess,
}: ExtractionReviewModalProps) {
  const [data, setData] = useState<ExtractedDocumentData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/documents/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          fileName,
          confirmedData: data,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to commit confirmed document.");
      }

      onConfirmSuccess(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving the records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper updater for top-level fields
  const updateField = (field: keyof ExtractedDocumentData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-mono">
                  VERIFY &amp; CONFIRM EXTRACTION
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {(data.confidenceScore * 100).toFixed(1)}% Confidence
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Source: {data.extractionSource}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-md">
                File: {fileName} • Ref: {documentId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Missing Fields Warning Banner */}
          {data.missingFields && data.missingFields.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-900">
                  Missing Fields Detected in Document:
                </span>{" "}
                <span className="text-amber-800 font-mono">
                  {data.missingFields.join(", ")}
                </span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Values were not silently invented. Please supply missing data manually before confirming, or leave as null.
                </p>
              </div>
            </div>
          )}

          {/* Top Document Metadata Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 font-mono">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Document Classification
              </label>
              <select
                value={data.documentType}
                onChange={(e) => updateField("documentType", e.target.value as DocumentType)}
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="CERTIFICATE_OF_ANALYSIS">CERTIFICATE_OF_ANALYSIS</option>
                <option value="SUPPLIER_INVOICE">SUPPLIER_INVOICE</option>
                <option value="BATCH_PRODUCTION_RECORD">BATCH_PRODUCTION_RECORD</option>
                <option value="DISPATCH_NOTE">DISPATCH_NOTE</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Document / Invoice / CoA #
              </label>
              <input
                type="text"
                value={data.documentNumber}
                onChange={(e) => updateField("documentNumber", e.target.value)}
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Issuer / Vendor Name
              </label>
              <input
                type="text"
                value={data.issuerName}
                onChange={(e) => updateField("issuerName", e.target.value)}
                className="w-full h-8 px-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>

          {/* Section 1: Inward Ingredient Lots Table */}
          {data.ingredientLots && data.ingredientLots.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800">
                  Extracted Ingredient Lots ({data.ingredientLots.length})
                </h3>
              </div>

              {data.ingredientLots.map((lot, lIdx) => (
                <div key={lIdx} className="p-4 bg-white rounded-lg border border-slate-200 space-y-3 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
                    <div>
                      <label className="block text-[10px] text-slate-500">Lot Identifier</label>
                      <input
                        type="text"
                        value={lot.lotNumber}
                        onChange={(e) => {
                          const updated = [...data.ingredientLots];
                          updated[lIdx].lotNumber = e.target.value;
                          setData({ ...data, ingredientLots: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Ingredient Name</label>
                      <input
                        type="text"
                        value={lot.ingredientName}
                        onChange={(e) => {
                          const updated = [...data.ingredientLots];
                          updated[lIdx].ingredientName = e.target.value;
                          setData({ ...data, ingredientLots: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-sans text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Quantity &amp; Unit</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={lot.quantity ?? ""}
                          onChange={(e) => {
                            const updated = [...data.ingredientLots];
                            updated[lIdx].quantity = e.target.value ? parseFloat(e.target.value) : null;
                            setData({ ...data, ingredientLots: updated });
                          }}
                          className="w-2/3 h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
                        />
                        <input
                          type="text"
                          value={lot.unit}
                          onChange={(e) => {
                            const updated = [...data.ingredientLots];
                            updated[lIdx].unit = e.target.value;
                            setData({ ...data, ingredientLots: updated });
                          }}
                          className="w-1/3 h-7 px-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Received Date</label>
                      <input
                        type="date"
                        value={lot.receivedDate || ""}
                        onChange={(e) => {
                          const updated = [...data.ingredientLots];
                          updated[lIdx].receivedDate = e.target.value;
                          setData({ ...data, ingredientLots: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>

                  {/* Lab Test Results */}
                  {lot.testResults && lot.testResults.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-mono text-slate-500 block mb-1.5 font-semibold">
                        LABORATORY TEST ASSAYS ({lot.testResults.length})
                      </span>
                      <table className="w-full text-left font-mono text-[11px]">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="p-1.5">Assay Parameter</th>
                            <th className="p-1.5">Observed Result</th>
                            <th className="p-1.5">Specification Limit</th>
                            <th className="p-1.5">Result Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lot.testResults.map((t, tIdx) => (
                            <tr key={tIdx} className={t.status === "FAIL" || t.status === "FLAGGED" ? "bg-rose-50/50" : ""}>
                              <td className="p-1.5 font-sans font-medium text-slate-800">{t.parameter}</td>
                              <td className="p-1.5 font-bold">{t.resultValue}</td>
                              <td className="p-1.5 text-slate-500">{t.specLimit}</td>
                              <td className="p-1.5">
                                <select
                                  value={t.status}
                                  onChange={(e) => {
                                    const updated = [...data.ingredientLots];
                                    updated[lIdx].testResults[tIdx].status = e.target.value as any;
                                    setData({ ...data, ingredientLots: updated });
                                  }}
                                  className={`h-6 px-1.5 rounded text-[10px] font-bold border ${
                                    t.status === "FAIL" || t.status === "FLAGGED"
                                      ? "bg-rose-100 text-rose-800 border-rose-300"
                                      : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  }`}
                                >
                                  <option value="PASS">PASS</option>
                                  <option value="FAIL">FAIL</option>
                                  <option value="FLAGGED">FLAGGED</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 2: Production Batches Table */}
          {data.productionBatches && data.productionBatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800">
                Extracted Production Batches &amp; BOM Usage
              </h3>

              {data.productionBatches.map((batch, bIdx) => (
                <div key={bIdx} className="p-4 bg-white rounded-lg border border-slate-200 space-y-3 font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500">Batch Code</label>
                      <input
                        type="text"
                        value={batch.batchNumber}
                        onChange={(e) => {
                          const updated = [...data.productionBatches];
                          updated[bIdx].batchNumber = e.target.value;
                          setData({ ...data, productionBatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Product Title</label>
                      <input
                        type="text"
                        value={batch.productName}
                        onChange={(e) => {
                          const updated = [...data.productionBatches];
                          updated[bIdx].productName = e.target.value;
                          setData({ ...data, productionBatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-sans text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Yield Jars / Units</label>
                      <input
                        type="number"
                        value={batch.yieldQuantity ?? ""}
                        onChange={(e) => {
                          const updated = [...data.productionBatches];
                          updated[bIdx].yieldQuantity = e.target.value ? parseInt(e.target.value) : null;
                          setData({ ...data, productionBatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">QA Disposition</label>
                      <select
                        value={batch.qaStatus}
                        onChange={(e) => {
                          const updated = [...data.productionBatches];
                          updated[bIdx].qaStatus = e.target.value as any;
                          setData({ ...data, productionBatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                      >
                        <option value="PASSED">PASSED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="QUARANTINE">QUARANTINE</option>
                        <option value="RECALLED">RECALLED</option>
                      </select>
                    </div>
                  </div>

                  {/* Consumed Ingredients BOM */}
                  {batch.consumedIngredients && (
                    <div className="pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                        Ingredients Consumed (BOM Lineage)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {batch.consumedIngredients.map((ing, iIdx) => (
                          <div key={iIdx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded border border-slate-200">
                            <span className="font-bold text-slate-900">{ing.lotNumber}</span>
                            <span className="text-slate-500">({ing.quantityUsed} {ing.unit})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 3: Dispatches */}
          {data.dispatches && data.dispatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800">
                Extracted Outward Dispatch
              </h3>

              {data.dispatches.map((disp, dIdx) => (
                <div key={dIdx} className="p-4 bg-white rounded-lg border border-slate-200 space-y-3 font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500">Dispatch Manifest #</label>
                      <input
                        type="text"
                        value={disp.dispatchNumber}
                        onChange={(e) => {
                          const updated = [...data.dispatches];
                          updated[dIdx].dispatchNumber = e.target.value;
                          setData({ ...data, dispatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Customer Consignee</label>
                      <input
                        type="text"
                        value={disp.customerName}
                        onChange={(e) => {
                          const updated = [...data.dispatches];
                          updated[dIdx].customerName = e.target.value;
                          setData({ ...data, dispatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500">Safety Email</label>
                      <input
                        type="email"
                        value={disp.customerContactEmail}
                        onChange={(e) => {
                          const updated = [...data.dispatches];
                          updated[dIdx].customerContactEmail = e.target.value;
                          setData({ ...data, dispatches: updated });
                        }}
                        className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded text-xs font-sans"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Raw Text Evidence Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Source Document Text Preview (Audit Proof)
            </span>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-36 leading-relaxed">
              {data.rawTextPreview || "No raw text available."}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-[11px] text-slate-500 font-sans">
            Committed records will update the deterministic traceability graph and ledger.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Discard Draft
            </Button>
            <Button
              size="sm"
              variant="forest"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? "Committing Records..." : "Confirm & Commit to Ledger"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
