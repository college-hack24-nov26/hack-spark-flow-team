"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Truck, AlertTriangle, ArrowRight } from "lucide-react";
import { NodeData } from "@/types/graph";

export const DispatchNode = memo(({ data, selected }: NodeProps & { data: NodeData }) => {
  const isRecalled = data.isTainted || data.status === "RECALLED";

  return (
    <div
      className={`px-3 py-2.5 rounded-lg border text-xs shadow-md transition-all w-[240px] relative overflow-hidden ${
        selected
          ? "ring-2 ring-emerald-500 border-emerald-400 bg-slate-900"
          : isRecalled
          ? "border-rose-500 bg-rose-950/50"
          : "border-slate-700 bg-slate-900 hover:border-slate-500"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 truncate">
          <Truck className={`w-3.5 h-3.5 shrink-0 ${isRecalled ? "text-rose-400" : "text-amber-400"}`} />
          <span className="font-mono font-bold text-xs text-white truncate">
            {data.label}
          </span>
        </div>

        <span
          className={`px-1.5 py-0.2 font-mono text-[9px] font-bold rounded uppercase shrink-0 ${
            isRecalled
              ? "bg-rose-900 text-rose-200 border border-rose-600"
              : "bg-slate-800 text-slate-300 border border-slate-700"
          }`}
        >
          {isRecalled ? "INTERCEPT" : "IN TRANSIT"}
        </span>
      </div>

      <div className="text-[11px] font-medium text-slate-300 truncate mb-1">
        {data.subtitle}
      </div>

      {data.quantityInfo && (
        <div className="text-[9.5px] font-mono text-slate-400 truncate mb-1.5">
          Shipped: {data.quantityInfo}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] font-mono">
        <span className="text-slate-400">Date: {data.date || "N/A"}</span>
        <span className={isRecalled ? "text-rose-400 font-bold" : "text-amber-400"}>
          {isRecalled ? "HOLD SHIPMENT" : "LOGISTICS OK"}
        </span>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className={`!w-2.5 !h-2.5 ${isRecalled ? "!bg-rose-500" : "!bg-slate-400"} !border-slate-900`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-2.5 !h-2.5 ${isRecalled ? "!bg-rose-500" : "!bg-emerald-500"} !border-slate-900`}
      />
    </div>
  );
});

DispatchNode.displayName = "DispatchNode";
