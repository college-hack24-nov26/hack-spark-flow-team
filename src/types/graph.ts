export type NodeType = "supplier" | "ingredientLot" | "productionBatch" | "dispatch" | "customer";

export type TraceDirection = "forward" | "backward" | "full";

export interface NodeData extends Record<string, unknown> {
  id: string;
  type: NodeType;
  label: string;
  subtitle: string;
  code: string;
  status: "PASSED" | "PENDING" | "QUARANTINED" | "QUARANTINE" | "RELEASED" | "RECALLED" | "COMPROMISED" | "CLEARED" | "EXHAUSTED";
  isTainted?: boolean;
  isRecallTrigger?: boolean;
  date?: string;
  quantityInfo?: string;
  extraInfo?: string;
  details: Record<string, any>;
}

export interface GraphSummary {
  direction: TraceDirection;
  rootIdentifier: string;
  rootType: NodeType;
  totalNodes: number;
  totalEdges: number;
  compromisedBatchesCount: number;
  totalFinishedUnitsImpacted: number;
  totalUnitsInMarket: number;
  affectedCustomersCount: number;
  affectedCustomers: string[];
  severityClass?: "CLASS_I" | "CLASS_II" | "CLASS_III";
  rootCauseFindings?: string[];
}

export interface TraceGraphResponse {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: NodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: {
      stroke?: string;
      strokeWidth?: number;
      strokeDasharray?: string;
    };
  }>;
  summary: GraphSummary;
}
