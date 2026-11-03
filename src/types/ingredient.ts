export type LotStatus = "RELEASED" | "QUARANTINE" | "EXHAUSTED" | "RECALLED";

export type CoAStatus = "VERIFIED" | "MISSING_COA" | "FLAGGED_FAIL" | "PENDING_LAB";

export interface LabParameter {
  parameter: string;
  value: string;
  specLimit: string;
  status: "PASS" | "FAIL" | "FLAGGED";
}

export interface SupplierDetail {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  country: string;
  facilityAddress: string;
  auditRating: "A+" | "A" | "B" | "UNDER_REVIEW";
}

export interface SourceDocumentReference {
  id: string;
  fileName: string;
  documentType: string;
  verifiedAt: string;
}

export interface BatchUsageRecord {
  batchId: string;
  batchNumber: string;
  productName: string;
  sku: string;
  quantityUsed: number;
  unit: string;
  usedAt: string;
  lineIdentifier: string;
}

export interface MassBalanceCalculation {
  totalReceived: number;
  totalConsumed: number;
  remainingRecorded: number;
  variance: number; // Discrepancy (Received - Consumed - Remaining)
  isBalanced: boolean;
}

export interface IngredientLot {
  id: string;
  lotNumber: string;
  ingredientName: string;
  category: "Nuts & Nut Pastes" | "Grains & Cereals" | "Sweeteners" | "Oils & Fats" | "Flavorings" | "Other";
  supplier: SupplierDetail;
  sourceDocument: SourceDocumentReference;
  receivedDate: string;
  expiryDate: string;
  initialQuantity: number;
  remainingQuantity: number;
  quarantinedQuantity: number;
  unit: string;
  status: LotStatus;
  quarantineReason?: string;
  allergenProfiles: string[];
  storageConditions: string;
  coaVerification: {
    status: CoAStatus;
    labName?: string;
    testDate?: string;
    parameters: LabParameter[];
  };
  consumptionHistory: BatchUsageRecord[];
  massBalance: MassBalanceCalculation;
  isRecallTrigger?: boolean;
}

export interface IngredientFilterParams {
  searchTerm?: string;
  status?: string;
  allergen?: string;
  coaStatus?: string;
  supplier?: string;
}
