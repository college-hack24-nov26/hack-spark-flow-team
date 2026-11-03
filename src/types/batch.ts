export type QAStatus = "PASSED" | "PENDING" | "QUARANTINED" | "RECALLED";

export interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  category: string;
  netWeight: string;
  standardPackSize: string;
  upcBarcode: string;
}

export interface BOMIngredientUsage {
  ingredientLotId: string;
  lotNumber: string;
  ingredientName: string;
  supplierName: string;
  plannedQuantity: number;
  actualQuantityUsed: number;
  unit: string;
  addedAt: string;
  isTainted: boolean;
  allergenProfiles: string[];
}

export interface DispatchedConsignment {
  dispatchId: string;
  dispatchNumber: string;
  customerName: string;
  destinationDC: string;
  quantityShipped: number;
  unit: string;
  dispatchDate: string;
  carrier: string;
  status: "DELIVERED" | "IN_TRANSIT" | "FLAGGED_RECALL";
}

export interface ContaminationExposure {
  isCompromised: boolean;
  taintedLotNumber?: string;
  contaminantName?: string;
  compromisedAt?: string;
  severityClass?: "CLASS_I" | "CLASS_II" | "CLASS_III";
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  workOrderId: string;
  product: ProductDetail;
  facility: {
    name: string;
    lineIdentifier: string;
    supervisorName: string;
    shift: "Morning (06:00 - 14:00)" | "Evening (14:00 - 22:00)" | "Night (22:00 - 06:00)";
  };
  productionDate: string;
  expiryDate: string;
  targetQuantity: number;
  yieldQuantity: number;
  yieldEfficiency: number; // percentage (e.g. 98.8%)
  scrapQuantity: number;
  unit: string; // jars, packs, tubs
  qaStatus: QAStatus;
  qaHoldReason?: string;
  qaReleaseSignature?: {
    signedBy: string;
    signedAt: string;
    labClearanceRef: string;
  };
  marketStatus: {
    dispatchedQuantity: number;
    warehouseQuarantineQuantity: number;
    isFullyDispatched: boolean;
  };
  billOfMaterials: BOMIngredientUsage[];
  sourceDocument: {
    id: string;
    fileName: string;
    documentType: string;
    verifiedAt: string;
  };
  downstreamDispatches: DispatchedConsignment[];
  contaminationExposure: ContaminationExposure;
}

export interface BatchFilterParams {
  searchTerm?: string;
  qaStatus?: string;
  lineIdentifier?: string;
  compromisedOnly?: boolean;
}
