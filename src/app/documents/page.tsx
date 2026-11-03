"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  FileCheck2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExtractionReviewModal } from "@/components/documents/ExtractionReviewModal";
import { ExtractedDocumentData } from "@/types/extraction";

interface IngestedDocItem {
  id: string;
  name: string;
  type: string;
  supplier: string;
  lotTarget: string;
  status: "CONFIRMED" | "READY_FOR_REVIEW" | "FAILED";
  confidence: string;
  date: string;
  source: string;
}

const initialLedger: IngestedDocItem[] = [
  {
    id: "doc-gvo-081",
    name: "sample_coa_peanut_paste.csv",
    type: "CERTIFICATE_OF_ANALYSIS",
    supplier: "Golden Valley Organics",
    lotTarget: "LOT-PNUT-2026-081",
    status: "CONFIRMED",
    confidence: "98.2%",
    date: "2026-10-12",
    source: "GEMINI_API",
  },
  {
    id: "doc-wo-1049",
    name: "sample_batch_production_log.csv",
    type: "BATCH_PRODUCTION_RECORD",
    supplier: "Plant 1 Internal (Line 3)",
    lotTarget: "BATCH-2026-1049",
    status: "CONFIRMED",
    confidence: "95.8%",
    date: "2026-10-16",
    source: "STRUCTURED_HEURISTIC_PARSER",
  },
  {
    id: "doc-dsp-4402",
    name: "sample_dispatch_manifest.csv",
    type: "DISPATCH_NOTE",
    supplier: "National Supermarkets DC",
    lotTarget: "DSP-2026-4402",
    status: "CONFIRMED",
    confidence: "96.4%",
    date: "2026-10-18",
    source: "GEMINI_API",
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<IngestedDocItem[]>(initialLedger);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDocId, setReviewDocId] = useState("");
  const [reviewFileName, setReviewFileName] = useState("");
  const [extractedPayload, setExtractedPayload] = useState<ExtractedDocumentData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage({
      type: "info",
      text: `Processing '${file.name}' (${(file.size / 1024).toFixed(1)} KB)... Running text extraction & schema validation.`,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload-and-extract", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Document extraction failed.");
      }

      setReviewDocId(result.documentId);
      setReviewFileName(result.fileName);
      setExtractedPayload(result.data);
      setReviewModalOpen(true);

      setStatusMessage({
        type: "success",
        text: `Extracted '${result.fileName}' with ${(result.data.confidenceScore * 100).toFixed(1)}% confidence. Review extracted records below.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to extract document.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // One-click Sample Test Loader
  const handleLoadSample = async (sampleFileName: string) => {
    setIsProcessing(true);
    setStatusMessage({
      type: "info",
      text: `Fetching test sample '${sampleFileName}' from verified repository...`,
    });

    try {
      const res = await fetch(`/api/documents/samples?name=${encodeURIComponent(sampleFileName)}`);
      if (!res.ok) throw new Error("Could not retrieve sample document.");

      const blob = await res.blob();
      const file = new File([blob], sampleFileName, { type: blob.type });
      await handleFileUpload(file);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load sample document.",
      });
      setIsProcessing(false);
    }
  };

  // Called when user confirms edits in the review modal
  const handleConfirmSuccess = (result: any) => {
    if (!extractedPayload) return;

    const newDoc: IngestedDocItem = {
      id: reviewDocId,
      name: reviewFileName,
      type: extractedPayload.documentType,
      supplier: extractedPayload.issuerName,
      lotTarget: extractedPayload.ingredientLots[0]?.lotNumber ||
        extractedPayload.productionBatches[0]?.batchNumber ||
        extractedPayload.dispatches[0]?.dispatchNumber || "DOC-REF",
      status: "CONFIRMED",
      confidence: `${(extractedPayload.confidenceScore * 100).toFixed(1)}%`,
      date: extractedPayload.issueDate || new Date().toISOString().split("T")[0],
      source: extractedPayload.extractionSource,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setStatusMessage({
      type: "success",
      text: `Document committed to ledger! Saved ${result.ledgerRecordCount.lotsRecorded} lots, ${result.ledgerRecordCount.batchesRecorded} batches, and ${result.ledgerRecordCount.usagesRecorded} BOM usages.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Review & Edit Modal */}
      {extractedPayload && (
        <ExtractionReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          documentId={reviewDocId}
          fileName={reviewFileName}
          initialData={extractedPayload}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Document Ingestion &amp; Structured Extraction
            </h1>
            <DemoBadge label="FSMA 204 OCR" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multimodal LLM-powered extraction for supplier invoices, laboratory CoAs, batch manufacturing sheets, and shipping manifests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.csv,.xlsx,.xls"
            className="hidden"
          />
          <Button
            size="sm"
            variant="forest"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="gap-1.5"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isProcessing ? "Extracting..." : "Upload New File"}</span>
          </Button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : statusMessage.type === "error"
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : "bg-blue-50 text-blue-900 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {statusMessage.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {statusMessage.type === "info" && <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Zone & Quick Sample Triggers */}
      <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-white/80 hover:bg-white transition-all text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
          <Upload className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Drag &amp; Drop Supply Chain Files or Click to Browse
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Supports <strong>PDF (Digital &amp; Scanned)</strong>, <strong>CSV</strong>, and <strong>Excel (XLSX)</strong> up to 10MB.
            Extracted records are validated with Zod schemas and require human confirmation before saving.
          </p>
        </div>

        {/* Quick Sample Action Buttons */}
        <div className="pt-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-2 font-semibold">
            One-Click Test Samples (Pre-Curated Golden Dataset)
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleLoadSample("sample_coa_peanut_paste.csv")}
              className="gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Sample 1: Tainted Peanut Paste CoA (CSV)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleLoadSample("sample_batch_production_log.csv")}
              className="gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sample 2: Line 3 Batch Log &amp; BOM (CSV)</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => handleLoadSample("sample_dispatch_manifest.csv")}
              className="gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Sample 3: Supermarket Dispatch Slip (CSV)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Ingested Documents Ledger Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs uppercase tracking-wider text-slate-800">
              Verified Ingested Document Ledger
            </CardTitle>
            <CardDescription>
              {documents.length} source documents extracted and linked to relational lots, batches, and dispatches
            </CardDescription>
          </div>
          <DemoBadge label="RELATIONAL AUDIT TRAIL" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Source File</th>
                  <th className="py-2.5 px-4 font-medium">Classification</th>
                  <th className="py-2.5 px-4 font-medium">Issuer / Vendor</th>
                  <th className="py-2.5 px-4 font-medium">Extracted Entity Target</th>
                  <th className="py-2.5 px-4 font-medium">Confidence &amp; Engine</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[200px]" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800">
                      {doc.supplier}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {doc.lotTarget}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">{doc.confidence}</span>
                        <span className="text-[10px] text-slate-400">({doc.source === "GEMINI_API" ? "Gemini" : "Parser"})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStatusMessage({
                            type: "info",
                            text: `Viewing audit evidence bundle for ${doc.name}. Document reference verified in ledger.`,
                          });
                        }}
                        className="h-6 px-2 text-slate-600 hover:text-slate-900"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Evidence</span>
                      </Button>
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
