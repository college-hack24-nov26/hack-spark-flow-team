"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Factory, AlertOctagon, CheckCircle2 } from "lucide-react";
import { NodeData } from "@/types/graph";

export const BatchNode = memo(({ data, selected }: NodeProps & { data: NodeData }) => {
  const isRecalled = data.status === "RECALLED" || data.isTainted;
  const isQuarantine = data.status === "QUARANTINED";

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border text-xs shadow-md transition-all w-[250px] relative overflow-hidden ${
        selected
          ? "ring-2 ring-emerald-500 border-emerald-400 bg-slate-900"
          : isRecalled
          ? "border-rose-500 bg-rose-950/60 shadow-rose-950/50"
          : isQuarantine
          ? "border-amber-500 bg-amber-950/40"
          : "border-slate-700 bg-slate-900 hover:border-slate-500"
      }`}
    >
      {/* Visual top indicator */}
      {isRecalled && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 truncate">
          {isRecalled ? (
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <Factory className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span className="font-mono font-bold text-xs text-white truncate">
            {data.label}
          </span>
        </div>

        <span
          className={`px-1.5 py-0.2 font-mono text-[9px] font-bold rounded uppercase shrink-0 ${
            isRecalled
              ? "bg-rose-900 text-rose-200 border border-rose-600"
              : isQuarantine
              ? "bg-amber-900 text-amber-200 border border-amber-600"
              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
          }`}
        >
          {data.status}
        </span>
      </div>

      <div className="text-[11px] font-medium text-slate-200 truncate mb-1">
        {data.subtitle}
      </div>

      {data.quantityInfo && (
        <div className="text-[9.5px] font-mono text-slate-400 truncate mb-1.5">
          {data.quantityInfo}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] font-mono">
        <span className="text-slate-400">{data.extraInfo || "Production"}</span>
        <span className={isRecalled ? "text-rose-400 font-bold" : "text-emerald-400"}>
          {isRecalled ? "BLAST RADIUS" : "QA CLEARED"}
        </span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className={`!w-2.5 !h-2.5 ${isRecalled ? "!bg-rose-500" : "!bg-emerald-500"} !border-slate-900`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-2.5 !h-2.5 ${isRecalled ? "!bg-rose-500" : "!bg-emerald-500"} !border-slate-900`}
      />
    </div>
  );
});

BatchNode.displayName = "BatchNode";
