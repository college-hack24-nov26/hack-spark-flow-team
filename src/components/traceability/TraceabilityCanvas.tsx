"use client";

import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge,
  NodeMouseHandler,
} from "@xyflow/react";

import { SupplierNode } from "./nodes/SupplierNode";
import { LotNode } from "./nodes/LotNode";
import { BatchNode } from "./nodes/BatchNode";
import { DispatchNode } from "./nodes/DispatchNode";
import { CustomerNode } from "./nodes/CustomerNode";
import { NodeData } from "@/types/graph";

interface TraceabilityCanvasProps {
  initialNodes: Array<Node<NodeData>>;
  initialEdges: Edge[];
  onSelectNode: (nodeData: NodeData | null) => void;
  selectedNodeId?: string | null;
}

export function TraceabilityCanvas({
  initialNodes,
  initialEdges,
  onSelectNode,
  selectedNodeId,
}: TraceabilityCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync with prop updates
  React.useEffect(() => {
    setNodes(
      initialNodes.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId || n.data?.id === selectedNodeId,
      }))
    );
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, selectedNodeId, setNodes, setEdges]);

  // Register custom node components
  const nodeTypes = useMemo(
    () => ({
      supplier: SupplierNode,
      ingredientLot: LotNode,
      productionBatch: BatchNode,
      dispatch: DispatchNode,
      customer: CustomerNode,
    }),
    []
  );

  const handleNodeClick: NodeMouseHandler<Node<NodeData>> = useCallback(
    (_, node) => {
      onSelectNode((node.data as unknown) as NodeData);
    },
    [onSelectNode]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <div className="w-full h-[620px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          className="!bg-slate-900 !border-slate-800 !text-slate-300 [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = (node.data as unknown) as NodeData;
            if (data?.isTainted || data?.status === "RECALLED") return "#ef4444";
            if (data?.status === "QUARANTINED" || data?.status === "QUARANTINE") return "#f59e0b";
            if (data?.type === "customer") return "#38bdf8";
            return "#10b981";
          }}
          className="!bg-slate-900/90 !border-slate-800 rounded-lg !bottom-4 !right-4"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#334155"
        />
      </ReactFlow>

      {/* Canvas Watermark / Legend Pill */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Verified Relational Lineage</span>
        <span className="text-slate-600">|</span>
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span>Contaminated Flow</span>
        <span className="text-slate-600">|</span>
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span>Quarantine Hold</span>
      </div>
    </div>
  );
}
