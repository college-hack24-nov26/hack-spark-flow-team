"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Building2, ShieldCheck, AlertCircle } from "lucide-react";
import { NodeData } from "@/types/graph";

export const SupplierNode = memo(({ data, selected }: NodeProps & { data: NodeData }) => {
  const isTainted = data.isTainted;

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border text-xs shadow-md transition-all w-[240px] bg-slate-900 ${
        selected
          ? "ring-2 ring-emerald-500 border-emerald-400"
          : isTainted
          ? "border-rose-600/80 hover:border-rose-400 shadow-rose-950/40"
          : "border-slate-700 hover:border-slate-500"
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
          <Building2 className={`w-3.5 h-3.5 shrink-0 ${isTainted ? "text-rose-400" : "text-emerald-400"}`} />
          <span className="truncate text-[11px] font-semibold text-white">{data.label}</span>
        </div>
        <span
          className={`px-1.5 py-0.2 font-mono text-[9px] font-bold rounded uppercase shrink-0 ${
            isTainted
              ? "bg-rose-950/90 text-rose-300 border border-rose-800"
              : "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
          }`}
        >
          {data.code}
        </span>
      </div>

      <div className="text-[10px] text-slate-400 truncate mb-1">
        {data.subtitle}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] font-mono">
        <span className="text-slate-500">Tier-1 Inward Origin</span>
        <span className={isTainted ? "text-rose-400 font-bold" : "text-emerald-400 font-semibold"}>
          {isTainted ? "AUDIT FLAGGED" : "CERTIFIED OK"}
        </span>
      </div>

      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-400 !border-slate-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-2.5 !h-2.5 ${isTainted ? "!bg-rose-500" : "!bg-emerald-500"} !border-slate-900`}
      />
    </div>
  );
});

SupplierNode.displayName = "SupplierNode";
