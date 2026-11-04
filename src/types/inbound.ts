export type RiskLevel = "GREEN" | "AMBER" | "RED";

export type LotDispositionStatus = "RELEASED" | "HOLD" | "VERIFICATION_REQUESTED";

export type LabReportStatus = "AVAILABLE" | "PENDING" | "FAILED" | "EXPIRED" | "UNAVAILABLE";

export type CoACertificateStatus = "VERIFIED" | "MISSING" | "EXPIRED" | "FLAGGED_FAIL";

export interface LabParameter {
  parameter: string;
  value: string;
  specLimit: string;
  status: "PASS" | "FAIL" | "FLAGGED";
}

export interface RiskFactor {
  ruleId: string;
  ruleName: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  description: string;
  parameterTested?: string;
  observedValue?: string;
  threshold?: string;
}

export interface Farmer {
  id: string;
  farmerId: string;
  name: string;
  farmLocation: string;
  region: string;
  coordinates?: string;
  cropType: string;
  harvestDate: string;
  contactPhone: string;
  contactEmail: string;
  farmSizeAcres: number;
  certificationStatus: "ORGANIC" | "GAP_CERTIFIED" | "STANDARD" | "UNDER_REVIEW";
  totalLotsSupplied: number;
}

export interface InboundLot {
  id: string;
  lotId: string;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  ingredient: string;
  cropType: string;
  quantity: number;
  unit: string; // kg, MT, quintals
  harvestDate: string;
  receivingDate: string;
  merchantHub: string;
  supplierInfo: {
    name: string;
    code: string;
    contact: string;
    facilityAddress: string;
  };
  labReportStatus: LabReportStatus;
  coaStatus: CoACertificateStatus;
  labParameters: LabParameter[];
  riskLevel: RiskLevel;
  dispositionStatus: LotDispositionStatus;
  riskExplanation: string;
  riskFactors: RiskFactor[];
  evidenceDocument?: {
    id: string;
    fileName: string;
    fileType: string;
    uploadedAt: string;
    labName?: string;
    documentRef: string;
  };
  authorizedReview?: {
    reviewedBy: string;
    reviewedAt: string;
    justification: string;
    signOffRef: string;
  };
  linkedIngredientLotId?: string;
  isDemoData: boolean;
}

export interface InboundFilterParams {
  searchTerm?: string;
  riskLevel?: string;
  dispositionStatus?: string;
  cropType?: string;
}

export interface InboundDashboardKPIs {
  totalIncomingLots: number;
  lowRiskLots: number; // GREEN
  mediumRiskLots: number; // AMBER
  highRiskLots: number; // RED
  lotsOnHold: number;
  lotsReleased: number;
  totalVolumeKg: number;
}
