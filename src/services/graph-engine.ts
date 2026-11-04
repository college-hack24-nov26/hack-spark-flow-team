import dagre from "@dagrejs/dagre";
import { IngredientService } from "./ingredient-service";
import { BatchService } from "./batch-service";
import {
  TraceGraphResponse,
  GraphSummary,
  NodeData,
  NodeType,
} from "@/types/graph";

interface InternalGraphNode {
  id: string;
  type: NodeType;
  data: NodeData;
}

interface InternalGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  isTainted?: boolean;
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 110;

/**
 * Deterministic Supply Chain Lineage & Traceability Engine
 * Uses Dagre for hierarchical auto-layout without manual hardcoding.
 * Computes exact forward blast-radius and backward root-cause analysis from relational data.
 */
export class GraphEngine {
  /**
   * Applies Dagre hierarchical layout algorithm to nodes and edges.
   */
  private static applyLayout(
    nodes: InternalGraphNode[],
    edges: InternalGraphEdge[],
    direction: "LR" | "TB" = "LR"
  ) {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: direction,
      nodesep: 40,
      ranksep: direction === "LR" ? 70 : 60,
      marginx: 30,
      marginy: 30,
    });

    nodes.forEach((node) => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    return nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        id: node.id,
        type: node.type,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
        data: node.data,
      };
    });
  }

  /**
   * Style edges based on whether they carry tainted material or normal product flow.
   */
  private static formatEdges(edges: InternalGraphEdge[]) {
    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: !!edge.isTainted,
      style: {
        stroke: edge.isTainted ? "#ef4444" : "#64748b",
        strokeWidth: edge.isTainted ? 2.5 : 1.5,
        strokeDasharray: edge.isTainted ? "5 5" : undefined,
      },
    }));
  }

  /**
   * Forward Trace: Downstream blast radius explosion starting from an Inward Ingredient Lot.
   * Traverses: Supplier -> Tainted Lot -> Production Batches -> Dispatches -> Customer Distribution Centers.
   */
  public static buildForwardGraph(
    lotIdentifier: string,
    layoutDirection: "LR" | "TB" = "LR"
  ): TraceGraphResponse {
    const lot = IngredientService.getLotById(lotIdentifier);

    if (!lot) {
      // Fallback if not found: try getting first lot or contaminated lot
      const defaultLot =
        IngredientService.getLotById("lot-pnut-081") ||
        IngredientService.getAllLots()[0];
      if (defaultLot) {
        return this.buildForwardGraph(defaultLot.id, layoutDirection);
      }
      return {
        nodes: [],
        edges: [],
        summary: {
          direction: "forward",
          rootIdentifier: lotIdentifier,
          rootType: "ingredientLot",
          totalNodes: 0,
          totalEdges: 0,
          compromisedBatchesCount: 0,
          totalFinishedUnitsImpacted: 0,
          totalUnitsInMarket: 0,
          affectedCustomersCount: 0,
          affectedCustomers: [],
        },
      };
    }

    const nodesMap = new Map<string, InternalGraphNode>();
    const edgesList: InternalGraphEdge[] = [];

    // 1. Supplier Node
    const supplierId = `supp-${lot.supplier.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    nodesMap.set(supplierId, {
      id: supplierId,
      type: "supplier",
      data: {
        id: supplierId,
        type: "supplier",
        label: lot.supplier.name,
        subtitle: `Supplier Code: ${lot.supplier.code}`,
        code: lot.supplier.code,
        status: lot.status === "RECALLED" ? "COMPROMISED" : "PASSED",
        isTainted: lot.status === "RECALLED",
        details: lot.supplier,
      },
    });

    // 2. Root Lot Node
    const lotNodeId = `lot-${lot.id}`;
    nodesMap.set(lotNodeId, {
      id: lotNodeId,
      type: "ingredientLot",
      data: {
        id: lotNodeId,
        type: "ingredientLot",
        label: lot.lotNumber,
        subtitle: `${lot.ingredientName} (${lot.initialQuantity.toLocaleString()} ${lot.unit})`,
        code: lot.lotNumber,
        status: lot.status,
        isTainted: lot.status === "RECALLED" || lot.isRecallTrigger,
        isRecallTrigger: lot.isRecallTrigger,
        date: lot.receivedDate,
        quantityInfo: `Remaining: ${lot.remainingQuantity} ${lot.unit} | Quarantined: ${lot.quarantinedQuantity} ${lot.unit}`,
        extraInfo: lot.allergenProfiles.join(", "),
        details: lot,
      },
    });

    // Connect Supplier -> Lot
    edgesList.push({
      id: `e-${supplierId}-${lotNodeId}`,
      source: supplierId,
      target: lotNodeId,
      label: `Inward: ${lot.receivedDate}`,
      isTainted: lot.status === "RECALLED",
    });

    // 1b. L1 Farmer Origin Node if present
    if (lot.farmerOrigin) {
      const farmerId = `farmer-${lot.farmerOrigin.farmerId.toLowerCase()}`;
      nodesMap.set(farmerId, {
        id: farmerId,
        type: "supplier",
        data: {
          id: farmerId,
          type: "supplier",
          label: `${lot.farmerOrigin.farmerName} (L1 Farm)`,
          subtitle: `Farm: ${lot.farmerOrigin.farmLocation}`,
          code: lot.farmerOrigin.farmerId,
          status: lot.farmerOrigin.riskRating === "RED" ? "COMPROMISED" : "PASSED",
          isTainted: lot.farmerOrigin.riskRating === "RED",
          details: lot.farmerOrigin,
        },
      });

      edgesList.push({
        id: `e-${farmerId}-${supplierId}`,
        source: farmerId,
        target: supplierId,
        label: `Harvest: ${lot.farmerOrigin.harvestDate}`,
        isTainted: lot.farmerOrigin.riskRating === "RED",
      });
    }

    // 3. Find Downstream Production Batches
    const batches = BatchService.getAllBatches();
    const affectedBatches = batches.filter((b) =>
      b.billOfMaterials.some(
        (bom) =>
          bom.ingredientLotId === lot.id || bom.lotNumber === lot.lotNumber
      )
    );

    let totalFinishedUnitsImpacted = 0;
    let totalUnitsInMarket = 0;
    const affectedCustomerNames = new Set<string>();

    affectedBatches.forEach((batch) => {
      totalFinishedUnitsImpacted += batch.yieldQuantity;
      totalUnitsInMarket += batch.marketStatus.dispatchedQuantity;

      const batchNodeId = `batch-${batch.id}`;
      nodesMap.set(batchNodeId, {
        id: batchNodeId,
        type: "productionBatch",
        data: {
          id: batchNodeId,
          type: "productionBatch",
          label: batch.batchNumber,
          subtitle: `${batch.product.name}`,
          code: batch.batchNumber,
          status: batch.qaStatus,
          isTainted:
            batch.contaminationExposure.isCompromised ||
            batch.qaStatus === "RECALLED",
          date: batch.productionDate,
          quantityInfo: `Yield: ${batch.yieldQuantity.toLocaleString()} ${batch.unit} (${batch.yieldEfficiency}%)`,
          extraInfo: `Line: ${batch.facility.lineIdentifier}`,
          details: batch,
        },
      });

      // Connect Lot -> Batch
      const bomItem = batch.billOfMaterials.find(
        (bom) =>
          bom.ingredientLotId === lot.id || bom.lotNumber === lot.lotNumber
      );
      edgesList.push({
        id: `e-${lotNodeId}-${batchNodeId}`,
        source: lotNodeId,
        target: batchNodeId,
        label: bomItem
          ? `Used ${bomItem.actualQuantityUsed} ${bomItem.unit}`
          : "Formulation",
        isTainted: lot.status === "RECALLED" || bomItem?.isTainted,
      });

      // 4. Trace Dispatches and Customer DCs
      batch.downstreamDispatches.forEach((dsp) => {
        affectedCustomerNames.add(dsp.customerName);

        const dispatchNodeId = `dsp-${dsp.dispatchId}`;
        nodesMap.set(dispatchNodeId, {
          id: dispatchNodeId,
          type: "dispatch",
          data: {
            id: dispatchNodeId,
            type: "dispatch",
            label: dsp.dispatchNumber,
            subtitle: `Carrier: ${dsp.carrier}`,
            code: dsp.dispatchNumber,
            status:
              dsp.status === "FLAGGED_RECALL" ? "RECALLED" : "PASSED",
            isTainted: dsp.status === "FLAGGED_RECALL",
            date: dsp.dispatchDate.split("T")[0],
            quantityInfo: `${dsp.quantityShipped.toLocaleString()} ${dsp.unit}`,
            extraInfo: dsp.destinationDC,
            details: dsp,
          },
        });

        // Connect Batch -> Dispatch
        edgesList.push({
          id: `e-${batchNodeId}-${dispatchNodeId}`,
          source: batchNodeId,
          target: dispatchNodeId,
          label: `${dsp.quantityShipped.toLocaleString()} ${dsp.unit}`,
          isTainted:
            batch.qaStatus === "RECALLED" || dsp.status === "FLAGGED_RECALL",
        });

        // 5. Customer Node
        const customerSafeId = `cust-${dsp.customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        if (!nodesMap.has(customerSafeId)) {
          nodesMap.set(customerSafeId, {
            id: customerSafeId,
            type: "customer",
            data: {
              id: customerSafeId,
              type: "customer",
              label: dsp.customerName,
              subtitle: dsp.destinationDC,
              code: dsp.customerName.split(" ")[0].toUpperCase(),
              status:
                dsp.status === "FLAGGED_RECALL" ? "RECALLED" : "PASSED",
              isTainted: dsp.status === "FLAGGED_RECALL",
              quantityInfo: `Destination DC Hub`,
              details: {
                name: dsp.customerName,
                address: dsp.destinationDC,
              },
            },
          });
        }

        // Connect Dispatch -> Customer
        edgesList.push({
          id: `e-${dispatchNodeId}-${customerSafeId}`,
          source: dispatchNodeId,
          target: customerSafeId,
          label: `Delivered`,
          isTainted: dsp.status === "FLAGGED_RECALL",
        });
      });
    });

    const rawNodes = Array.from(nodesMap.values());
    const layoutedNodes = this.applyLayout(rawNodes, edgesList, layoutDirection);
    const formattedEdges = this.formatEdges(edgesList);

    const summary: GraphSummary = {
      direction: "forward",
      rootIdentifier: lot.lotNumber,
      rootType: "ingredientLot",
      totalNodes: layoutedNodes.length,
      totalEdges: formattedEdges.length,
      compromisedBatchesCount: affectedBatches.length,
      totalFinishedUnitsImpacted,
      totalUnitsInMarket,
      affectedCustomersCount: affectedCustomerNames.size,
      affectedCustomers: Array.from(affectedCustomerNames),
      severityClass:
        lot.status === "RECALLED" || lot.isRecallTrigger ? "CLASS_I" : undefined,
    };

    return {
      nodes: layoutedNodes,
      edges: formattedEdges,
      summary,
    };
  }

  /**
   * Backward Trace: Upstream Root-Cause Analysis starting from a finished Production Batch.
   * Traverses: Batch -> Inward Ingredient Lots -> Suppliers and Lab CoAs.
   */
  public static buildBackwardGraph(
    batchIdentifier: string,
    layoutDirection: "LR" | "TB" = "LR"
  ): TraceGraphResponse {
    const batch = BatchService.getBatchById(batchIdentifier);

    if (!batch) {
      const defaultBatch =
        BatchService.getBatchById("batch-1049") ||
        BatchService.getAllBatches()[0];
      if (defaultBatch) {
        return this.buildBackwardGraph(defaultBatch.id, layoutDirection);
      }
      return {
        nodes: [],
        edges: [],
        summary: {
          direction: "backward",
          rootIdentifier: batchIdentifier,
          rootType: "productionBatch",
          totalNodes: 0,
          totalEdges: 0,
          compromisedBatchesCount: 0,
          totalFinishedUnitsImpacted: 0,
          totalUnitsInMarket: 0,
          affectedCustomersCount: 0,
          affectedCustomers: [],
        },
      };
    }

    const nodesMap = new Map<string, InternalGraphNode>();
    const edgesList: InternalGraphEdge[] = [];
    const rootCauseFindings: string[] = [];

    // 1. Root Batch Node
    const batchNodeId = `batch-${batch.id}`;
    nodesMap.set(batchNodeId, {
      id: batchNodeId,
      type: "productionBatch",
      data: {
        id: batchNodeId,
        type: "productionBatch",
        label: batch.batchNumber,
        subtitle: batch.product.name,
        code: batch.batchNumber,
        status: batch.qaStatus,
        isTainted:
          batch.contaminationExposure.isCompromised ||
          batch.qaStatus === "RECALLED",
        date: batch.productionDate,
        quantityInfo: `Yield: ${batch.yieldQuantity.toLocaleString()} ${batch.unit}`,
        extraInfo: `Line: ${batch.facility.lineIdentifier}`,
        details: batch,
      },
    });

    // 2. Trace all Upstream Inward Ingredient Lots in BOM
    batch.billOfMaterials.forEach((bom) => {
      const lot = IngredientService.getLotById(bom.ingredientLotId);
      const lotNodeId = `lot-${bom.ingredientLotId}`;

      const isTainted = bom.isTainted || lot?.status === "RECALLED";
      if (isTainted) {
        rootCauseFindings.push(
          `Compromised ingredient: ${bom.ingredientName} (${bom.lotNumber}) supplied by ${bom.supplierName}.`
        );
      }

      nodesMap.set(lotNodeId, {
        id: lotNodeId,
        type: "ingredientLot",
        data: {
          id: lotNodeId,
          type: "ingredientLot",
          label: bom.lotNumber,
          subtitle: `${bom.ingredientName} (${bom.actualQuantityUsed} ${bom.unit} used)`,
          code: bom.lotNumber,
          status: lot ? lot.status : isTainted ? "RECALLED" : "PASSED",
          isTainted,
          isRecallTrigger: lot?.isRecallTrigger,
          date: lot?.receivedDate,
          quantityInfo: `Actual: ${bom.actualQuantityUsed} ${bom.unit} (Planned: ${bom.plannedQuantity} ${bom.unit})`,
          extraInfo: bom.allergenProfiles.join(", "),
          details: lot || bom,
        },
      });

      // Connect Lot -> Batch
      edgesList.push({
        id: `e-${lotNodeId}-${batchNodeId}`,
        source: lotNodeId,
        target: batchNodeId,
        label: `BOM: ${bom.actualQuantityUsed} ${bom.unit}`,
        isTainted,
      });

      // 3. Upstream Supplier for this Lot
      if (lot) {
        const supplierId = `supp-${lot.supplier.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        if (!nodesMap.has(supplierId)) {
          nodesMap.set(supplierId, {
            id: supplierId,
            type: "supplier",
            data: {
              id: supplierId,
              type: "supplier",
              label: lot.supplier.name,
              subtitle: `Supplier Code: ${lot.supplier.code}`,
              code: lot.supplier.code,
              status: isTainted ? "COMPROMISED" : "PASSED",
              isTainted,
              details: lot.supplier,
            },
          });
        }

        // Connect Supplier -> Lot
        edgesList.push({
          id: `e-${supplierId}-${lotNodeId}`,
          source: supplierId,
          target: lotNodeId,
          label: `Inward: ${lot.receivedDate}`,
          isTainted,
        });

        // Connect Farmer Origin if present
        if (lot.farmerOrigin) {
          const farmerId = `farmer-${lot.farmerOrigin.farmerId.toLowerCase()}`;
          if (!nodesMap.has(farmerId)) {
            nodesMap.set(farmerId, {
              id: farmerId,
              type: "supplier",
              data: {
                id: farmerId,
                type: "supplier",
                label: `${lot.farmerOrigin.farmerName} (L1 Farm)`,
                subtitle: `Farm: ${lot.farmerOrigin.farmLocation}`,
                code: lot.farmerOrigin.farmerId,
                status: lot.farmerOrigin.riskRating === "RED" ? "COMPROMISED" : "PASSED",
                isTainted: lot.farmerOrigin.riskRating === "RED",
                details: lot.farmerOrigin,
              },
            });
          }

          edgesList.push({
            id: `e-${farmerId}-${supplierId}`,
            source: farmerId,
            target: supplierId,
            label: `Harvest: ${lot.farmerOrigin.harvestDate}`,
            isTainted: lot.farmerOrigin.riskRating === "RED",
          });
        }
      }
    });

    // 4. Also include downstream dispatches to show total reach
    const affectedCustomerNames = new Set<string>();
    batch.downstreamDispatches.forEach((dsp) => {
      affectedCustomerNames.add(dsp.customerName);

      const dispatchNodeId = `dsp-${dsp.dispatchId}`;
      nodesMap.set(dispatchNodeId, {
        id: dispatchNodeId,
        type: "dispatch",
        data: {
          id: dispatchNodeId,
          type: "dispatch",
          label: dsp.dispatchNumber,
          subtitle: `Carrier: ${dsp.carrier}`,
          code: dsp.dispatchNumber,
          status: dsp.status === "FLAGGED_RECALL" ? "RECALLED" : "PASSED",
          isTainted: dsp.status === "FLAGGED_RECALL",
          date: dsp.dispatchDate.split("T")[0],
          quantityInfo: `${dsp.quantityShipped.toLocaleString()} ${dsp.unit}`,
          extraInfo: dsp.destinationDC,
          details: dsp,
        },
      });

      edgesList.push({
        id: `e-${batchNodeId}-${dispatchNodeId}`,
        source: batchNodeId,
        target: dispatchNodeId,
        label: `${dsp.quantityShipped.toLocaleString()} ${dsp.unit}`,
        isTainted: batch.qaStatus === "RECALLED" || dsp.status === "FLAGGED_RECALL",
      });

      const customerSafeId = `cust-${dsp.customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      if (!nodesMap.has(customerSafeId)) {
        nodesMap.set(customerSafeId, {
          id: customerSafeId,
          type: "customer",
          data: {
            id: customerSafeId,
            type: "customer",
            label: dsp.customerName,
            subtitle: dsp.destinationDC,
            code: dsp.customerName.split(" ")[0].toUpperCase(),
            status: dsp.status === "FLAGGED_RECALL" ? "RECALLED" : "PASSED",
            isTainted: dsp.status === "FLAGGED_RECALL",
            quantityInfo: `Destination DC Hub`,
            details: {
              name: dsp.customerName,
              address: dsp.destinationDC,
            },
          },
        });
      }

      edgesList.push({
        id: `e-${dispatchNodeId}-${customerSafeId}`,
        source: dispatchNodeId,
        target: customerSafeId,
        label: `Delivered`,
        isTainted: dsp.status === "FLAGGED_RECALL",
      });
    });

    const rawNodes = Array.from(nodesMap.values());
    const layoutedNodes = this.applyLayout(rawNodes, edgesList, layoutDirection);
    const formattedEdges = this.formatEdges(edgesList);

    const summary: GraphSummary = {
      direction: "backward",
      rootIdentifier: batch.batchNumber,
      rootType: "productionBatch",
      totalNodes: layoutedNodes.length,
      totalEdges: formattedEdges.length,
      compromisedBatchesCount: batch.qaStatus === "RECALLED" ? 1 : 0,
      totalFinishedUnitsImpacted: batch.yieldQuantity,
      totalUnitsInMarket: batch.marketStatus.dispatchedQuantity,
      affectedCustomersCount: affectedCustomerNames.size,
      affectedCustomers: Array.from(affectedCustomerNames),
      severityClass: batch.contaminationExposure.severityClass,
      rootCauseFindings,
    };

    return {
      nodes: layoutedNodes,
      edges: formattedEdges,
      summary,
    };
  }

  /**
   * Full Supply Chain Ecosystem Trace.
   */
  public static buildFullGraph(
    layoutDirection: "LR" | "TB" = "LR"
  ): TraceGraphResponse {
    const lots = IngredientService.getAllLots();
    const batches = BatchService.getAllBatches();

    const nodesMap = new Map<string, InternalGraphNode>();
    const edgesList: InternalGraphEdge[] = [];
    const affectedCustomers = new Set<string>();

    let totalFinishedUnitsImpacted = 0;
    let totalUnitsInMarket = 0;
    let compromisedBatchesCount = 0;

    // Suppliers & Lots
    lots.forEach((lot) => {
      const supplierId = `supp-${lot.supplier.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      if (!nodesMap.has(supplierId)) {
        nodesMap.set(supplierId, {
          id: supplierId,
          type: "supplier",
          data: {
            id: supplierId,
            type: "supplier",
            label: lot.supplier.name,
            subtitle: `Supplier Code: ${lot.supplier.code}`,
            code: lot.supplier.code,
            status: lot.status === "RECALLED" ? "COMPROMISED" : "PASSED",
            isTainted: lot.status === "RECALLED",
            details: lot.supplier,
          },
        });
      }

      const lotNodeId = `lot-${lot.id}`;
      nodesMap.set(lotNodeId, {
        id: lotNodeId,
        type: "ingredientLot",
        data: {
          id: lotNodeId,
          type: "ingredientLot",
          label: lot.lotNumber,
          subtitle: `${lot.ingredientName} (${lot.initialQuantity.toLocaleString()} ${lot.unit})`,
          code: lot.lotNumber,
          status: lot.status,
          isTainted: lot.status === "RECALLED" || lot.isRecallTrigger,
          isRecallTrigger: lot.isRecallTrigger,
          date: lot.receivedDate,
          quantityInfo: `Remaining: ${lot.remainingQuantity} ${lot.unit}`,
          extraInfo: lot.allergenProfiles.join(", "),
          details: lot,
        },
      });

      edgesList.push({
        id: `e-${supplierId}-${lotNodeId}`,
        source: supplierId,
        target: lotNodeId,
        label: `Inward: ${lot.receivedDate}`,
        isTainted: lot.status === "RECALLED",
      });
    });

    // Batches
    batches.forEach((batch) => {
      const batchNodeId = `batch-${batch.id}`;
      const isCompromised =
        batch.qaStatus === "RECALLED" ||
        batch.contaminationExposure.isCompromised;

      if (isCompromised) {
        compromisedBatchesCount++;
        totalFinishedUnitsImpacted += batch.yieldQuantity;
        totalUnitsInMarket += batch.marketStatus.dispatchedQuantity;
      }

      nodesMap.set(batchNodeId, {
        id: batchNodeId,
        type: "productionBatch",
        data: {
          id: batchNodeId,
          type: "productionBatch",
          label: batch.batchNumber,
          subtitle: batch.product.name,
          code: batch.batchNumber,
          status: batch.qaStatus,
          isTainted: isCompromised,
          date: batch.productionDate,
          quantityInfo: `Yield: ${batch.yieldQuantity.toLocaleString()} ${batch.unit}`,
          extraInfo: `Line: ${batch.facility.lineIdentifier}`,
          details: batch,
        },
      });

      // Connect each BOM lot
      batch.billOfMaterials.forEach((bom) => {
        const lotNodeId = `lot-${bom.ingredientLotId}`;
        if (nodesMap.has(lotNodeId)) {
          edgesList.push({
            id: `e-${lotNodeId}-${batchNodeId}`,
            source: lotNodeId,
            target: batchNodeId,
            label: `${bom.actualQuantityUsed} ${bom.unit}`,
            isTainted: bom.isTainted || isCompromised,
          });
        }
      });

      // Dispatches & Customers
      batch.downstreamDispatches.forEach((dsp) => {
        if (isCompromised) {
          affectedCustomers.add(dsp.customerName);
        }

        const dispatchNodeId = `dsp-${dsp.dispatchId}`;
        nodesMap.set(dispatchNodeId, {
          id: dispatchNodeId,
          type: "dispatch",
          data: {
            id: dispatchNodeId,
            type: "dispatch",
            label: dsp.dispatchNumber,
            subtitle: `Carrier: ${dsp.carrier}`,
            code: dsp.dispatchNumber,
            status: dsp.status === "FLAGGED_RECALL" ? "RECALLED" : "PASSED",
            isTainted: dsp.status === "FLAGGED_RECALL" || isCompromised,
            date: dsp.dispatchDate.split("T")[0],
            quantityInfo: `${dsp.quantityShipped.toLocaleString()} ${dsp.unit}`,
            extraInfo: dsp.destinationDC,
            details: dsp,
          },
        });

        edgesList.push({
          id: `e-${batchNodeId}-${dispatchNodeId}`,
          source: batchNodeId,
          target: dispatchNodeId,
          label: `${dsp.quantityShipped.toLocaleString()} ${dsp.unit}`,
          isTainted: isCompromised || dsp.status === "FLAGGED_RECALL",
        });

        const customerSafeId = `cust-${dsp.customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        if (!nodesMap.has(customerSafeId)) {
          nodesMap.set(customerSafeId, {
            id: customerSafeId,
            type: "customer",
            data: {
              id: customerSafeId,
              type: "customer",
              label: dsp.customerName,
              subtitle: dsp.destinationDC,
              code: dsp.customerName.split(" ")[0].toUpperCase(),
              status: isCompromised ? "RECALLED" : "PASSED",
              isTainted: isCompromised,
              quantityInfo: `Destination DC Hub`,
              details: {
                name: dsp.customerName,
                address: dsp.destinationDC,
              },
            },
          });
        }

        edgesList.push({
          id: `e-${dispatchNodeId}-${customerSafeId}`,
          source: dispatchNodeId,
          target: customerSafeId,
          label: `Delivered`,
          isTainted: isCompromised || dsp.status === "FLAGGED_RECALL",
        });
      });
    });

    const rawNodes = Array.from(nodesMap.values());
    const layoutedNodes = this.applyLayout(rawNodes, edgesList, layoutDirection);
    const formattedEdges = this.formatEdges(edgesList);

    return {
      nodes: layoutedNodes,
      edges: formattedEdges,
      summary: {
        direction: "full",
        rootIdentifier: "ALL_ACTIVE_NODES",
        rootType: "ingredientLot",
        totalNodes: layoutedNodes.length,
        totalEdges: formattedEdges.length,
        compromisedBatchesCount,
        totalFinishedUnitsImpacted,
        totalUnitsInMarket,
        affectedCustomersCount: affectedCustomers.size,
        affectedCustomers: Array.from(affectedCustomers),
        severityClass: compromisedBatchesCount > 0 ? "CLASS_I" : undefined,
      },
    };
  }
}
