"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitFork,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Building,
  Boxes,
  Factory,
  Truck,
  ShieldCheck,
  Info,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { TraceabilityCanvas } from "@/components/traceability/TraceabilityCanvas";
import { TraceInspectorDrawer } from "@/components/traceability/TraceInspectorDrawer";
import { GraphEngine } from "@/services/graph-engine";
import { IngredientService } from "@/services/ingredient-service";
import { BatchService } from "@/services/batch-service";
import { TraceGraphResponse, NodeData, TraceDirection } from "@/types/graph";
import { Node, Edge } from "@xyflow/react";

export default function TraceabilityGraphPage() {
  const [direction, setDirection] = useState<TraceDirection>("forward");
  const [selectedRootId, setSelectedRootId] = useState<string>("lot-pnut-081");
  const [layoutDir, setLayoutDir] = useState<"LR" | "TB">("LR");
  const [graphData, setGraphData] = useState<TraceGraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Available selectable root entities
  const [availableLots, setAvailableLots] = useState<Array<{ id: string; label: string; isTainted: boolean }>>([]);
  const [availableBatches, setAvailableBatches] = useState<Array<{ id: string; label: string; isTainted: boolean }>>([]);

  // Fetch initial ledger options
  useEffect(() => {
    const lots = IngredientService.getAllLots();
    const batches = BatchService.getAllBatches();

    setAvailableLots(
      lots.map((l) => ({
        id: l.id,
        label: `${l.lotNumber} (${l.ingredientName})`,
        isTainted: Boolean(l.status === "RECALLED" || l.isRecallTrigger),
      }))
    );

    setAvailableBatches(
      batches.map((b) => ({
        id: b.id,
        label: `${b.batchNumber} (${b.product.name})`,
        isTainted: Boolean(b.qaStatus === "RECALLED" || b.contaminationExposure.isCompromised),
      }))
    );
  }, []);

  // Compute graph deterministically on state changes
  useEffect(() => {
    setIsLoading(true);
    let result: TraceGraphResponse;

    if (direction === "backward") {
      // Backward trace from batch
      result = GraphEngine.buildBackwardGraph(selectedRootId, layoutDir);
    } else if (direction === "full") {
      result = GraphEngine.buildFullGraph(layoutDir);
    } else {
      // Forward trace from lot
      result = GraphEngine.buildForwardGraph(selectedRootId, layoutDir);
    }

    setGraphData(result);
    setIsLoading(false);
  }, [direction, selectedRootId, layoutDir]);

  // Focus active recall trigger
  const handleFocusIncident = () => {
    setDirection("forward");
    setSelectedRootId("lot-pnut-081");
  };

  const summary = graphData?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Interactive Traceability Graph
            </h1>
            <DemoBadge label="DETERMINISTIC GRAPH ENGINE" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing multi-echelon food custody lineage from supplier inward receipt through production to distributor dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/recall">
            <Button size="sm" variant="destructive" className="gap-1.5 font-semibold text-xs shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Recall Blast Radius</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Incident Alert Callout Bar */}
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-1.5 rounded-md bg-rose-100 text-rose-700 shrink-0">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-900">ACTIVE OUTBREAK TRACE: INCIDENT RCL-004</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-800">
                CLASS I RECALL
              </span>
            </div>
            <p className="text-rose-700 text-[11px] mt-0.5">
              Salmonella enterica serotype Typhimurium confirmed in <strong>LOT-PNUT-2026-081</strong>. Forward blast radius reveals 2 compromised batches and 3 distributor DCs.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleFocusIncident}
          className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0 text-xs font-semibold gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Focus Outbreak Root</span>
        </Button>
      </div>

      {/* Control Bar: Mode Toggle, Root Selector, Layout Toggle */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Direction Mode */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Trace Mode:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => {
                setDirection("forward");
                if (selectedRootId.startsWith("batch-")) {
                  setSelectedRootId("lot-pnut-081");
                }
              }}
              className={`px-3 py-1 rounded transition-all ${
                direction === "forward"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Forward (Blast Radius)
            </button>
            <button
              onClick={() => {
                setDirection("backward");
                if (selectedRootId.startsWith("lot-")) {
                  setSelectedRootId("batch-1049");
                }
              }}
              className={`px-3 py-1 rounded transition-all ${
                direction === "backward"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Backward (Root Cause)
            </button>
            <button
              onClick={() => setDirection("full")}
              className={`px-3 py-1 rounded transition-all ${
                direction === "full"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Full Ecosystem
            </button>
          </div>
        </div>

        {/* Center: Root Entity Selector */}
        {direction !== "full" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {direction === "forward" ? "Root Lot:" : "Root Batch:"}
            </span>
            <select
              value={selectedRootId}
              onChange={(e) => setSelectedRootId(e.target.value)}
              className="text-xs font-mono bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {direction === "forward" ? (
                availableLots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.isTainted ? "⚠️ [COMPROMISED] " : "✓ "} {lot.label}
                  </option>
                ))
              ) : (
                availableBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.isTainted ? "⚠️ [RECALLED] " : "✓ "} {batch.label}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Right: Layout & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setLayoutDir("LR")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                layoutDir === "LR" ? "bg-white font-semibold text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
              title="Horizontal Left-to-Right"
            >
              Horizontal (LR)
            </button>
            <button
              onClick={() => setLayoutDir("TB")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                layoutDir === "TB" ? "bg-white font-semibold text-slate-900 shadow-2xs" : "text-slate-600"
              }`}
              title="Vertical Top-to-Bottom"
            >
              Vertical (TB)
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedNode(null);
            }}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Executive Blast Radius Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="Graph Nodes & Lineage"
          value={`${summary?.totalNodes || 0} Nodes`}
          subtext={`${summary?.totalEdges || 0} Lineage Edges`}
          statusVariant="default"
        />
        <MetricCard
          title="Compromised Batches"
          value={`${summary?.compromisedBatchesCount || 0} Batches`}
          subtext="Direct transformation"
          statusVariant={summary?.compromisedBatchesCount ? "danger" : "success"}
        />
        <MetricCard
          title="Impacted Finished Units"
          value={`${(summary?.totalFinishedUnitsImpacted || 0).toLocaleString()} Jars`}
          subtext="Total finished packaging"
          statusVariant={summary?.totalFinishedUnitsImpacted ? "danger" : "default"}
        />
        <MetricCard
          title="Units In Commerce"
          value={`${(summary?.totalUnitsInMarket || 0).toLocaleString()} Units`}
          subtext="Already in distribution"
          statusVariant={summary?.totalUnitsInMarket ? "warning" : "default"}
        />
        <MetricCard
          title="Affected Customer DCs"
          value={`${summary?.affectedCustomersCount || 0} DCs`}
          subtext="Immediate notification required"
          statusVariant={summary?.affectedCustomersCount ? "danger" : "default"}
        />
      </div>

      {/* Main Interactive React Flow Canvas */}
      <div className="relative">
        {isLoading ? (
          <div className="w-full h-[620px] rounded-xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-mono">Computing topological supply chain DAG...</span>
          </div>
        ) : graphData ? (
          <TraceabilityCanvas
            initialNodes={(graphData.nodes as unknown) as Array<Node<NodeData>>}
            initialEdges={graphData.edges as unknown as Edge[]}
            onSelectNode={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />
        ) : null}

        {/* Slide-Over Technical Inspector Drawer */}
        <TraceInspectorDrawer
          nodeData={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* Custody Chain Step Breakdown */}
      <Card className="border border-slate-200">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Deterministic Critical Tracking Events (CTE) Chain
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Audit log of nodes present in current active trace path
            </CardDescription>
          </div>
          <DemoBadge label="FSMA 204 COMPLIANT" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Node Type</th>
                  <th className="py-2.5 px-4">Identifier / Reference</th>
                  <th className="py-2.5 px-4">Entity Description</th>
                  <th className="py-2.5 px-4">Volume / Quantity</th>
                  <th className="py-2.5 px-4">Status & Disposition</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {graphData?.nodes.map((node) => {
                  const data = node.data;
                  const isRecalled = data.isTainted || data.status === "RECALLED";
                  return (
                    <tr
                      key={node.id}
                      onClick={() => setSelectedNode(data)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        selectedNode?.id === data.id ? "bg-emerald-50/50" : ""
                      }`}
                    >
                      <td className="py-2 px-4 uppercase text-[10px] text-slate-500 font-sans font-semibold">
                        {data.type}
                      </td>
                      <td className="py-2 px-4 font-bold text-slate-900">
                        {data.label}
                      </td>
                      <td className="py-2 px-4 text-slate-700 font-sans">
                        {data.subtitle}
                      </td>
                      <td className="py-2 px-4 text-slate-600">
                        {data.quantityInfo || "Verified"}
                      </td>
                      <td className="py-2 px-4">
                        <StatusBadge
                          status={
                            isRecalled
                              ? "RECALLED"
                              : data.status === "QUARANTINED" || data.status === "QUARANTINE"
                              ? "QUARANTINED"
                              : "PASSED"
                          }
                        />
                      </td>
                      <td className="py-2 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(data);
                          }}
                          className="text-[10px] text-emerald-700 hover:text-emerald-900 h-7 px-2"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
