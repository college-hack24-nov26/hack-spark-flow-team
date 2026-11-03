export type DocumentType =
  | "SUPPLIER_INVOICE"
  | "CERTIFICATE_OF_ANALYSIS"
  | "BATCH_PRODUCTION_RECORD"
  | "DISPATCH_NOTE";

export type ExtractionStatus =
  | "PENDING"
  | "EXTRACTING"
  | "READY_FOR_REVIEW"
  | "CONFIRMED"
  | "FAILED";

export interface LabTestItem {
  parameter: string;
  resultValue: string;
  specLimit: string;
  status: "PASS" | "FAIL" | "FLAGGED";
}

export interface InwardLotExtraction {
  lotNumber: string;
  ingredientName: string;
  quantity: number | null;
  unit: string;
  receivedDate: string | null;
  expiryDate: string | null;
  allergenDeclarations: string[];
  testResults: LabTestItem[];
}

export interface ConsumedIngredientItem {
  lotNumber: string;
  quantityUsed: number | null;
  unit: string;
}

export interface BatchExtraction {
  batchNumber: string;
  productName: string;
  sku: string;
  productionDate: string | null;
  expiryDate: string | null;
  yieldQuantity: number | null;
  unit: string;
  lineIdentifier: string;
  qaStatus: "PASSED" | "PENDING" | "QUARANTINE" | "RECALLED";
  consumedIngredients: ConsumedIngredientItem[];
}

export interface DispatchItemDetail {
  batchNumber: string;
  quantityShipped: number | null;
  unit: string;
}

export interface DispatchExtraction {
  dispatchNumber: string;
  customerName: string;
  customerAddress: string;
  customerContactEmail: string;
  dispatchDate: string | null;
  carrier: string;
  itemsShipped: DispatchItemDetail[];
}

export interface ExtractedDocumentData {
  documentType: DocumentType;
  documentNumber: string;
  issueDate: string | null;
  issuerName: string;
  supplierCode?: string;
  supplierEmail?: string;
  supplierAddress?: string;

  // Extracted entities depending on document type
  ingredientLots: InwardLotExtraction[];
  productionBatches: BatchExtraction[];
  dispatches: DispatchExtraction[];

  // Deterministic validation & audit metadata
  confidenceScore: number;
  extractionSource: "GEMINI_API" | "STRUCTURED_HEURISTIC_PARSER";
  missingFields: string[];
  ambiguities: string[];
  evidenceSnippets: { field: string; snippet: string }[];
  rawTextPreview: string;
}

export interface ExtractionResponse {
  success: boolean;
  documentId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  data: ExtractedDocumentData;
  error?: string;
}

export interface ConfirmDocumentRequest {
  documentId: string;
  fileName: string;
  confirmedData: ExtractedDocumentData;
}

export interface ConfirmDocumentResponse {
  success: boolean;
  message: string;
  documentId: string;
  ledgerRecordCount: {
    lotsRecorded: number;
    batchesRecorded: number;
    usagesRecorded: number;
    dispatchesRecorded: number;
  };
}
