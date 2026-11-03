"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Store, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { NodeData } from "@/types/graph";

export const CustomerNode = memo(({ data, selected }: NodeProps & { data: NodeData }) => {
  const isRecalled = data.isTainted || data.status === "RECALLED";

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border text-xs shadow-md transition-all w-[240px] bg-slate-900 ${
        selected
          ? "ring-2 ring-emerald-500 border-emerald-400"
          : isRecalled
          ? "border-rose-600 bg-rose-950/40 hover:border-rose-400"
          : "border-slate-700 hover:border-slate-500"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 truncate">
          <Store className={`w-3.5 h-3.5 shrink-0 ${isRecalled ? "text-rose-400" : "text-sky-400"}`} />
          <span className="font-semibold text-xs text-white truncate">
            {data.label}
          </span>
        </div>

        <span
          className={`px-1.5 py-0.2 font-mono text-[9px] font-bold rounded uppercase shrink-0 ${
            isRecalled
              ? "bg-rose-900 text-rose-200 border border-rose-600 animate-pulse"
              : "bg-sky-950 text-sky-300 border border-sky-800"
          }`}
        >
          {isRecalled ? "NOTIFY DC" : "DESTINATION"}
        </span>
      </div>

      <div className="text-[10px] text-slate-300 flex items-center gap-1 truncate mb-1">
        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
        <span className="truncate">{data.subtitle}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] font-mono">
        <span className="text-slate-400">Retail Distribution</span>
        <span className={isRecalled ? "text-rose-400 font-bold" : "text-slate-400"}>
          {isRecalled ? "ACTION REQUIRED" : "IN MARKET"}
        </span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className={`!w-2.5 !h-2.5 ${isRecalled ? "!bg-rose-500" : "!bg-sky-400"} !border-slate-900`}
      />
    </div>
  );
});

CustomerNode.displayName = "CustomerNode";
