"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Boxes,
  Factory,
  Truck,
  Store,
  FileText,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DemoBadge } from "@/components/ui/demo-badge";
import { NodeData } from "@/types/graph";

interface TraceInspectorDrawerProps {
  nodeData: NodeData | null;
  onClose: () => void;
}

export function TraceInspectorDrawer({
  nodeData,
  onClose,
}: TraceInspectorDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!nodeData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(nodeData.code || nodeData.label);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (nodeData.type) {
      case "supplier":
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case "ingredientLot":
        return <Boxes className="w-5 h-5 text-emerald-400" />;
      case "productionBatch":
        return <Factory className="w-5 h-5 text-emerald-400" />;
      case "dispatch":
        return <Truck className="w-5 h-5 text-amber-400" />;
      case "customer":
        return <Store className="w-5 h-5 text-sky-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeTitle = () => {
    switch (nodeData.type) {
      case "supplier":
        return "Tier-1 Ingredient Supplier";
      case "ingredientLot":
        return "Inward Raw Ingredient Lot";
      case "productionBatch":
        return "Manufacturing Production Batch";
      case "dispatch":
        return "Outbound Consignment Dispatch";
      case "customer":
        return "Retail Customer / Distribution Center";
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 text-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
            {getIcon()}
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              {getTypeTitle()}
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{nodeData.label}</span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy Identifier"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
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

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Status Callout */}
        {nodeData.isTainted || nodeData.status === "RECALLED" ? (
          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-600/80 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>COMPROMISED IN LINEAGE - CLASS I RECALL</span>
            </div>
            <p className="text-[11px] text-rose-200 leading-relaxed">
              This node has been confirmed in the contamination propagation path of Salmonella enterica serotype Typhimurium.
              Mandatory hold and market withdrawal notice required under 21 CFR § 7.42.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Custody Chain Integrity</span>
            </div>
            <StatusBadge status="PASSED" />
          </div>
        )}

        {/* Primary Attributes Card */}
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80 space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-700/60 pb-1.5 flex items-center justify-between">
            <span>Operational Attributes</span>
            <DemoBadge label="FSMA 204 CTE" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Reference Code</span>
              <span className="font-mono font-medium text-slate-200">{nodeData.code || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status</span>
              <span className="font-mono font-bold text-slate-200">{nodeData.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Timestamp / Date</span>
              <span className="font-mono text-slate-300">{nodeData.date || "2026-10-16"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Quantity Record</span>
              <span className="font-mono text-slate-300">{nodeData.quantityInfo || "Verified"}</span>
            </div>
          </div>

          {nodeData.extraInfo && (
            <div className="pt-2 border-t border-slate-700/60">
              <span className="text-slate-400 block text-[10px]">Facility / Context</span>
              <span className="text-slate-200 text-[11px]">{nodeData.extraInfo}</span>
            </div>
          )}
        </div>

        {/* Source Document Reference */}
        {nodeData.details?.sourceDocument && (
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-700/60 pb-1.5 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Source Evidence</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">File Name:</span>
                <span className="text-emerald-300">{nodeData.details.sourceDocument.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document Type:</span>
                <span className="text-slate-200">{nodeData.details.sourceDocument.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Audit Timestamp:</span>
                <span className="text-slate-400">{nodeData.details.sourceDocument.verifiedAt?.split("T")[0]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Lab CoA Parameters if Lot */}
        {nodeData.type === "ingredientLot" && nodeData.details?.coaVerification?.parameters && (
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 border-b border-slate-700/60 pb-1.5 flex items-center justify-between">
              <span>Analytical Lab Assays</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {nodeData.details.coaVerification.labName || "Midwest Lab"}
              </span>
            </div>
            <div className="space-y-1.5">
              {nodeData.details.coaVerification.parameters.map((param: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono"
                >
                  <span className="text-slate-300">{param.parameter}</span>
                  <div className="flex items-center gap-2">
                    <span className={param.status === "FAIL" ? "text-rose-400 font-bold" : "text-emerald-300"}>
                      {param.value}
                    </span>
                    <span
                      className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                        param.status === "FAIL"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {param.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <Link href={`/recall`} className="w-full block">
          <Button variant="destructive" className="w-full gap-2 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Blast Radius & Recall Letter</span>
          </Button>
        </Link>

        {nodeData.type === "ingredientLot" ? (
          <Link href="/inventory/ingredients" className="w-full block">
            <Button variant="outline" className="w-full gap-2 text-xs border-slate-700 text-slate-300 hover:text-white">
              <Boxes className="w-3.5 h-3.5" />
              <span>Inspect Ingredient Ledger</span>
            </Button>
          </Link>
        ) : (
          <Link href="/inventory/batches" className="w-full block">
            <Button variant="outline" className="w-full gap-2 text-xs border-slate-700 text-slate-300 hover:text-white">
              <Factory className="w-3.5 h-3.5" />
              <span>Inspect Production Batch Ledger</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
