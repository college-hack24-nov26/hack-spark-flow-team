import {
  ProductionBatch,
  BatchFilterParams,
  QAStatus,
} from "@/types/batch";
import { IngredientService } from "./ingredient-service";

const initialBatches: ProductionBatch[] = [
  {
    id: "batch-1049",
    batchNumber: "BATCH-2026-1049",
    workOrderId: "WO-LINE3-2026-991",
    product: {
      id: "prod-pb-crunch",
      name: "Crunchy Peanut Butter 400g",
      sku: "SKU-PB-CRUNCH-400G",
      category: "Spreads & Nut Butters",
      netWeight: "400g",
      standardPackSize: "12 jars / case",
      upcBarcode: "850021948102",
    },
    facility: {
      name: "Austin Processing Facility #1",
      lineIdentifier: "Packaging Line 3",
      supervisorName: "Carlos Mendez",
      shift: "Morning (06:00 - 14:00)",
    },
    productionDate: "2026-10-16",
    expiryDate: "2027-10-16",
    targetQuantity: 8500,
    yieldQuantity: 8400,
    yieldEfficiency: 98.8,
    scrapQuantity: 100,
    unit: "jars",
    qaStatus: "RECALLED",
    qaHoldReason: "Contaminated by raw ingredient LOT-PNUT-2026-081 (Salmonella enterica confirmed). Mandatory Class I recall.",
    marketStatus: {
      dispatchedQuantity: 4200,
      warehouseQuarantineQuantity: 4200,
      isFullyDispatched: false,
    },
    billOfMaterials: [
      {
        ingredientLotId: "lot-pnut-081",
        lotNumber: "LOT-PNUT-2026-081",
        ingredientName: "Roasted Peanut Paste",
        supplierName: "Golden Valley Organics",
        plannedQuantity: 2500,
        actualQuantityUsed: 2500,
        unit: "kg",
        addedAt: "2026-10-16T08:30:00Z",
        isTainted: true,
        allergenProfiles: ["PEANUTS"],
      },
      {
        ingredientLotId: "lot-sugr-112",
        lotNumber: "LOT-SUGR-2026-112",
        ingredientName: "Cane Sugar Granules",
        supplierName: "Gulf Coast Refineries",
        plannedQuantity: 300,
        actualQuantityUsed: 300,
        unit: "kg",
        addedAt: "2026-10-16T08:45:00Z",
        isTainted: false,
        allergenProfiles: ["NONE"],
      },
    ],
    sourceDocument: {
      id: "doc-wo-1049",
      fileName: "sample_batch_production_log.csv",
      documentType: "BATCH_PRODUCTION_RECORD",
      verifiedAt: "2026-10-16T12:00:00Z",
    },
    downstreamDispatches: [
      {
        dispatchId: "dsp-4402",
        dispatchNumber: "DSP-2026-4402",
        customerName: "National Supermarkets Central DC",
        destinationDC: "440 Logistics Blvd, Dallas, TX 75201",
        quantityShipped: 4200,
        unit: "jars",
        dispatchDate: "2026-10-18T10:00:00Z",
        carrier: "ColdChain Logistics Fleet 4",
        status: "FLAGGED_RECALL",
      },
    ],
    contaminationExposure: {
      isCompromised: true,
      taintedLotNumber: "LOT-PNUT-2026-081",
      contaminantName: "Salmonella enterica serotype Typhimurium",
      compromisedAt: "2026-10-16T08:30:00Z",
      severityClass: "CLASS_I",
    },
  },
  {
    id: "batch-1052",
    batchNumber: "BATCH-2026-1052",
    workOrderId: "WO-LINE3-2026-995",
    product: {
      id: "prod-pb-creamy",
      name: "Creamy Peanut Spread 500g",
      sku: "SKU-PB-CREAMY-500G",
      category: "Spreads & Nut Butters",
      netWeight: "500g",
      standardPackSize: "12 jars / case",
      upcBarcode: "850021948126",
    },
    facility: {
      name: "Austin Processing Facility #1",
      lineIdentifier: "Packaging Line 3",
      supervisorName: "Carlos Mendez",
      shift: "Evening (14:00 - 22:00)",
    },
    productionDate: "2026-10-17",
    expiryDate: "2027-10-17",
    targetQuantity: 6000,
    yieldQuantity: 5800,
    yieldEfficiency: 96.7,
    scrapQuantity: 200,
    unit: "jars",
    qaStatus: "RECALLED",
    qaHoldReason: "Contaminated by raw ingredient LOT-PNUT-2026-081 (Salmonella enterica confirmed). Mandatory Class I recall.",
    marketStatus: {
      dispatchedQuantity: 5800,
      warehouseQuarantineQuantity: 0,
      isFullyDispatched: true,
    },
    billOfMaterials: [
      {
        ingredientLotId: "lot-pnut-081",
        lotNumber: "LOT-PNUT-2026-081",
        ingredientName: "Roasted Peanut Paste",
        supplierName: "Golden Valley Organics",
        plannedQuantity: 1250,
        actualQuantityUsed: 1250,
        unit: "kg",
        addedAt: "2026-10-17T09:15:00Z",
        isTainted: true,
        allergenProfiles: ["PEANUTS"],
      },
      {
        ingredientLotId: "lot-sugr-112",
        lotNumber: "LOT-SUGR-2026-112",
        ingredientName: "Cane Sugar Granules",
        supplierName: "Gulf Coast Refineries",
        plannedQuantity: 250,
        actualQuantityUsed: 250,
        unit: "kg",
        addedAt: "2026-10-17T09:30:00Z",
        isTainted: false,
        allergenProfiles: ["NONE"],
      },
    ],
    sourceDocument: {
      id: "doc-wo-1052",
      fileName: "BATCH-SHEET-LINE3-1052.pdf",
      documentType: "BATCH_PRODUCTION_RECORD",
      verifiedAt: "2026-10-17T18:00:00Z",
    },
    downstreamDispatches: [
      {
        dispatchId: "dsp-4405",
        dispatchNumber: "DSP-2026-4405",
        customerName: "Western Grocers Regional Depot",
        destinationDC: "880 Pacific Logistics Way, Phoenix, AZ 85043",
        quantityShipped: 4000,
        unit: "jars",
        dispatchDate: "2026-10-19T06:00:00Z",
        carrier: "Southwest Freight Express",
        status: "FLAGGED_RECALL",
      },
      {
        dispatchId: "dsp-4411",
        dispatchNumber: "DSP-2026-4411",
        customerName: "Lone Star Food Distributors",
        destinationDC: "1200 San Jacinto St, Houston, TX 77002",
        quantityShipped: 1800,
        unit: "jars",
        dispatchDate: "2026-10-20T08:00:00Z",
        carrier: "Lone Star Logistics Fleet 1",
        status: "FLAGGED_RECALL",
      },
    ],
    contaminationExposure: {
      isCompromised: true,
      taintedLotNumber: "LOT-PNUT-2026-081",
      contaminantName: "Salmonella enterica serotype Typhimurium",
      compromisedAt: "2026-10-17T09:15:00Z",
      severityClass: "CLASS_I",
    },
  },
  {
    id: "batch-1044",
    batchNumber: "BATCH-2026-1044",
    workOrderId: "WO-LINE2-2026-880",
    product: {
      id: "prod-almd-butter",
      name: "Organic Almond Butter 350g",
      sku: "SKU-ALMD-BUTTER-350G",
      category: "Spreads & Nut Butters",
      netWeight: "350g",
      standardPackSize: "12 jars / case",
      upcBarcode: "850021948140",
    },
    facility: {
      name: "Austin Processing Facility #1",
      lineIdentifier: "Packaging Line 2",
      supervisorName: "Sarah Jenkins",
      shift: "Morning (06:00 - 14:00)",
    },
    productionDate: "2026-10-14",
    expiryDate: "2027-10-14",
    targetQuantity: 4300,
    yieldQuantity: 4200,
    yieldEfficiency: 97.7,
    scrapQuantity: 100,
    unit: "jars",
    qaStatus: "PASSED",
    qaReleaseSignature: {
      signedBy: "Dr. Evelyn Reed (QA Director)",
      signedAt: "2026-10-15T09:00:00Z",
      labClearanceRef: "LAB-CLR-ALMD-1044",
    },
    marketStatus: {
      dispatchedQuantity: 3000,
      warehouseQuarantineQuantity: 1200,
      isFullyDispatched: false,
    },
    billOfMaterials: [
      {
        ingredientLotId: "lot-almd-033",
        lotNumber: "LOT-ALMD-2026-033",
        ingredientName: "California Almond Paste",
        supplierName: "Pacific Nut Growers Co.",
        plannedQuantity: 1800,
        actualQuantityUsed: 1800,
        unit: "kg",
        addedAt: "2026-10-14T11:00:00Z",
        isTainted: false,
        allergenProfiles: ["TREE_NUTS"],
      },
    ],
    sourceDocument: {
      id: "doc-wo-1044",
      fileName: "BATCH-SHEET-LINE2-1044.pdf",
      documentType: "BATCH_PRODUCTION_RECORD",
      verifiedAt: "2026-10-14T17:00:00Z",
    },
    downstreamDispatches: [
      {
        dispatchId: "dsp-4390",
        dispatchNumber: "DSP-2026-4390",
        customerName: "National Supermarkets Central DC",
        destinationDC: "440 Logistics Blvd, Dallas, TX 75201",
        quantityShipped: 3000,
        unit: "jars",
        dispatchDate: "2026-10-17T08:00:00Z",
        carrier: "National DC Transport",
        status: "DELIVERED",
      },
    ],
    contaminationExposure: {
      isCompromised: false,
    },
  },
  {
    id: "batch-1038",
    batchNumber: "BATCH-2026-1038",
    workOrderId: "WO-LINE1-2026-772",
    product: {
      id: "prod-oat-quick",
      name: "Rolled Oats Quick Cook 1kg",
      sku: "SKU-OAT-QUICK-1KG",
      category: "Grains & Cereals",
      netWeight: "1kg",
      standardPackSize: "8 packs / case",
      upcBarcode: "850021948195",
    },
    facility: {
      name: "Austin Processing Facility #1",
      lineIdentifier: "Packaging Line 1",
      supervisorName: "Mark Kowalski",
      shift: "Morning (06:00 - 14:00)",
    },
    productionDate: "2026-10-11",
    expiryDate: "2027-10-11",
    targetQuantity: 6200,
    yieldQuantity: 6100,
    yieldEfficiency: 98.4,
    scrapQuantity: 100,
    unit: "packs",
    qaStatus: "PASSED",
    qaReleaseSignature: {
      signedBy: "Dr. Evelyn Reed (QA Director)",
      signedAt: "2026-10-12T11:30:00Z",
      labClearanceRef: "LAB-CLR-OAT-1038",
    },
    marketStatus: {
      dispatchedQuantity: 5000,
      warehouseQuarantineQuantity: 1100,
      isFullyDispatched: false,
    },
    billOfMaterials: [
      {
        ingredientLotId: "lot-oat-019",
        lotNumber: "LOT-OAT-2026-019",
        ingredientName: "Gluten-Free Rolled Oats",
        supplierName: "Prairie Mills Ltd.",
        plannedQuantity: 6100,
        actualQuantityUsed: 6100,
        unit: "kg",
        addedAt: "2026-10-11T07:45:00Z",
        isTainted: false,
        allergenProfiles: ["NONE"],
      },
    ],
    sourceDocument: {
      id: "doc-wo-1038",
      fileName: "BATCH-SHEET-LINE1-1038.pdf",
      documentType: "BATCH_PRODUCTION_RECORD",
      verifiedAt: "2026-10-11T16:00:00Z",
    },
    downstreamDispatches: [
      {
        dispatchId: "dsp-4382",
        dispatchNumber: "DSP-2026-4382",
        customerName: "Heartland Wholesale Grocers",
        destinationDC: "500 Commerce Way, Kansas City, MO 64106",
        quantityShipped: 5000,
        unit: "packs",
        dispatchDate: "2026-10-14T09:00:00Z",
        carrier: "Midwest Logistics Group",
        status: "DELIVERED",
      },
    ],
    contaminationExposure: {
      isCompromised: false,
    },
  },
  {
    id: "batch-1055",
    batchNumber: "BATCH-2026-1055",
    workOrderId: "WO-LINE2-2026-892",
    product: {
      id: "prod-choco-almd",
      name: "Organic Dark Chocolate Almond Spread 300g",
      sku: "SKU-CHOCO-ALMD-300G",
      category: "Spreads & Nut Butters",
      netWeight: "300g",
      standardPackSize: "12 jars / case",
      upcBarcode: "850021948171",
    },
    facility: {
      name: "Austin Processing Facility #1",
      lineIdentifier: "Packaging Line 2",
      supervisorName: "Sarah Jenkins",
      shift: "Evening (14:00 - 22:00)",
    },
    productionDate: "2026-10-21",
    expiryDate: "2027-10-21",
    targetQuantity: 3300,
    yieldQuantity: 3200,
    yieldEfficiency: 96.9,
    scrapQuantity: 100,
    unit: "jars",
    qaStatus: "PENDING",
    qaHoldReason: "Awaiting final 48-hour microbial incubation assay results before warehouse release.",
    marketStatus: {
      dispatchedQuantity: 0,
      warehouseQuarantineQuantity: 3200,
      isFullyDispatched: false,
    },
    billOfMaterials: [
      {
        ingredientLotId: "lot-almd-033",
        lotNumber: "LOT-ALMD-2026-033",
        ingredientName: "California Almond Paste",
        supplierName: "Pacific Nut Growers Co.",
        plannedQuantity: 1200,
        actualQuantityUsed: 1200,
        unit: "kg",
        addedAt: "2026-10-21T15:00:00Z",
        isTainted: false,
        allergenProfiles: ["TREE_NUTS"],
      },
      {
        ingredientLotId: "lot-cocoa-045",
        lotNumber: "LOT-COCOA-2026-045",
        ingredientName: "Organic Dutch Cocoa Powder",
        supplierName: "Andean Organics S.A.",
        plannedQuantity: 400,
        actualQuantityUsed: 400,
        unit: "kg",
        addedAt: "2026-10-21T15:30:00Z",
        isTainted: false,
        allergenProfiles: ["NONE"],
      },
    ],
    sourceDocument: {
      id: "doc-wo-1055",
      fileName: "BATCH-SHEET-LINE2-1055.pdf",
      documentType: "BATCH_PRODUCTION_RECORD",
      verifiedAt: "2026-10-21T21:00:00Z",
    },
    downstreamDispatches: [],
    contaminationExposure: {
      isCompromised: false,
    },
  },
];

let batchesLedger: ProductionBatch[] = [...initialBatches];

export class BatchService {
  /**
   * Retrieves all production batches with multi-criteria filtering
   */
  static getAllBatches(filters?: BatchFilterParams): ProductionBatch[] {
    let result = [...batchesLedger];

    if (!filters) return result;

    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.batchNumber.toLowerCase().includes(term) ||
          b.product.name.toLowerCase().includes(term) ||
          b.product.sku.toLowerCase().includes(term) ||
          b.workOrderId.toLowerCase().includes(term) ||
          b.billOfMaterials.some((ing) => ing.lotNumber.toLowerCase().includes(term))
      );
    }

    if (filters.qaStatus && filters.qaStatus !== "ALL") {
      result = result.filter((b) => b.qaStatus === filters.qaStatus);
    }

    if (filters.lineIdentifier && filters.lineIdentifier !== "ALL") {
      result = result.filter((b) => b.facility.lineIdentifier === filters.lineIdentifier);
    }

    if (filters.compromisedOnly) {
      result = result.filter((b) => b.contaminationExposure.isCompromised);
    }

    return result;
  }

  /**
   * Retrieves an individual batch by exact batchNumber
   */
  static getBatchByNumber(batchNumber: string): ProductionBatch | null {
    const batch = batchesLedger.find(
      (b) => b.batchNumber.toLowerCase() === batchNumber.toLowerCase()
    );
    return batch || null;
  }

  /**
   * Retrieves an individual batch by id or batchNumber
   */
  static getBatchById(idOrNumber: string): ProductionBatch | null {
    const term = idOrNumber.toLowerCase();
    const batch = batchesLedger.find(
      (b) => b.id.toLowerCase() === term || b.batchNumber.toLowerCase() === term
    );
    return batch || null;
  }

  /**
   * Formulates and records a new production batch (Transformation CTE)
   * Validates raw ingredients, decrements inventory from IngredientService, and establishes BOM linkages
   */
  static formulateBatch(newBatchData: Partial<ProductionBatch>): {
    success: boolean;
    batch?: ProductionBatch;
    error?: string;
  } {
    if (!newBatchData.batchNumber || !newBatchData.product?.name) {
      return { success: false, error: "Batch number and product details are required." };
    }

    // Verify raw ingredients from BOM
    const bom = newBatchData.billOfMaterials || [];
    let hasTaintedIngredient = false;
    let taintedLot = "";

    for (const item of bom) {
      const lot = IngredientService.getLotByNumber(item.lotNumber);
      if (!lot) {
        return { success: false, error: `Referenced ingredient lot '${item.lotNumber}' does not exist in the ledger.` };
      }

      if (lot.remainingQuantity < item.actualQuantityUsed) {
        return {
          success: false,
          error: `Insufficient inventory for lot '${item.lotNumber}'. Required: ${item.actualQuantityUsed} ${item.unit}, Available: ${lot.remainingQuantity} ${lot.unit}.`,
        };
      }

      if (lot.status === "RECALLED" || lot.status === "QUARANTINE") {
        hasTaintedIngredient = true;
        taintedLot = lot.lotNumber;
      }
    }

    const targetQty = newBatchData.targetQuantity || 5000;
    const yieldQty = newBatchData.yieldQuantity || targetQty;
    const efficiency = Number(((yieldQty / targetQty) * 100).toFixed(1));

    const finalBatch: ProductionBatch = {
      id: `batch-${Date.now().toString(36)}`,
      batchNumber: newBatchData.batchNumber.toUpperCase().trim(),
      workOrderId: newBatchData.workOrderId || `WO-FORM-${Date.now().toString(36).toUpperCase()}`,
      product: newBatchData.product!,
      facility: newBatchData.facility || {
        name: "Austin Processing Facility #1",
        lineIdentifier: "Packaging Line 1",
        supervisorName: "Quality Supervisor",
        shift: "Morning (06:00 - 14:00)",
      },
      productionDate: newBatchData.productionDate || "2026-11-03",
      expiryDate: newBatchData.expiryDate || "2027-11-03",
      targetQuantity: targetQty,
      yieldQuantity: yieldQty,
      yieldEfficiency: efficiency,
      scrapQuantity: Math.max(0, targetQty - yieldQty),
      unit: newBatchData.unit || "jars",
      qaStatus: hasTaintedIngredient ? "QUARANTINED" : (newBatchData.qaStatus || "PENDING"),
      qaHoldReason: hasTaintedIngredient ? `Quarantined at formulation: Composed using restricted lot ${taintedLot}.` : undefined,
      marketStatus: {
        dispatchedQuantity: 0,
        warehouseQuarantineQuantity: yieldQty,
        isFullyDispatched: false,
      },
      billOfMaterials: bom,
      sourceDocument: {
        id: `doc-${Date.now().toString(36)}`,
        fileName: `BATCH-LOG-${newBatchData.batchNumber}.pdf`,
        documentType: "BATCH_PRODUCTION_RECORD",
        verifiedAt: new Date().toISOString(),
      },
      downstreamDispatches: [],
      contaminationExposure: {
        isCompromised: hasTaintedIngredient,
        taintedLotNumber: hasTaintedIngredient ? taintedLot : undefined,
      },
    };

    // Deduct ingredient inventory
    for (const item of bom) {
      const lot = IngredientService.getLotByNumber(item.lotNumber);
      if (lot) {
        lot.remainingQuantity = Math.max(0, lot.remainingQuantity - item.actualQuantityUsed);
        lot.consumptionHistory.push({
          batchId: finalBatch.id,
          batchNumber: finalBatch.batchNumber,
          productName: finalBatch.product.name,
          sku: finalBatch.product.sku,
          quantityUsed: item.actualQuantityUsed,
          unit: item.unit,
          usedAt: new Date().toISOString(),
          lineIdentifier: finalBatch.facility.lineIdentifier,
        });
      }
    }

    batchesLedger = [finalBatch, ...batchesLedger];
    return { success: true, batch: finalBatch };
  }

  /**
   * Updates QA Disposition status with required signature / justification
   */
  static updateQAStatus(
    batchNumber: string,
    status: QAStatus,
    reason?: string,
    signature?: { signedBy: string; labClearanceRef: string }
  ): { success: boolean; batch?: ProductionBatch; error?: string } {
    const idx = batchesLedger.findIndex(
      (b) => b.batchNumber.toLowerCase() === batchNumber.toLowerCase()
    );

    if (idx === -1) {
      return { success: false, error: `Batch '${batchNumber}' not found.` };
    }

    const current = batchesLedger[idx];
    const isQuarantined = status === "QUARANTINED" || status === "RECALLED";

    const updatedBatch: ProductionBatch = {
      ...current,
      qaStatus: status,
      qaHoldReason: isQuarantined ? (reason || "QA hold enacted.") : undefined,
      qaReleaseSignature: signature
        ? {
            signedBy: signature.signedBy,
            signedAt: new Date().toISOString(),
            labClearanceRef: signature.labClearanceRef,
          }
        : current.qaReleaseSignature,
    };

    batchesLedger[idx] = updatedBatch;
    return { success: true, batch: updatedBatch };
  }

  /**
   * Identifies all compromised batches that consumed a specific tainted lot (Forward Trace)
   */
  static getCompromisedBatches(taintedLotNumber: string): ProductionBatch[] {
    return batchesLedger.filter((b) =>
      b.billOfMaterials.some(
        (ing) => ing.lotNumber.toLowerCase() === taintedLotNumber.toLowerCase()
      )
    );
  }
}
