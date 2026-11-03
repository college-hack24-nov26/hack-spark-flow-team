import { z } from "zod";

export const LabTestItemSchema = z.object({
  parameter: z.string().default("Unknown Parameter"),
  resultValue: z.string().default("N/A"),
  specLimit: z.string().default("N/A"),
  status: z.enum(["PASS", "FAIL", "FLAGGED"]).default("PASS"),
});

export const InwardLotExtractionSchema = z.object({
  lotNumber: z.string().min(1, "Lot number is required"),
  ingredientName: z.string().default("Unspecified Raw Material"),
  quantity: z.number().nullable().default(null),
  unit: z.string().default("kg"),
  receivedDate: z.string().nullable().default(null),
  expiryDate: z.string().nullable().default(null),
  allergenDeclarations: z.array(z.string()).default([]),
  testResults: z.array(LabTestItemSchema).default([]),
});

export const ConsumedIngredientItemSchema = z.object({
  lotNumber: z.string().min(1, "Ingredient lot number is required"),
  quantityUsed: z.number().nullable().default(null),
  unit: z.string().default("kg"),
});

export const BatchExtractionSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  productName: z.string().default("Unspecified Finished Product"),
  sku: z.string().default(""),
  productionDate: z.string().nullable().default(null),
  expiryDate: z.string().nullable().default(null),
  yieldQuantity: z.number().nullable().default(null),
  unit: z.string().default("units"),
  lineIdentifier: z.string().default("Packaging Line 1"),
  qaStatus: z.enum(["PASSED", "PENDING", "QUARANTINE", "RECALLED"]).default("PASSED"),
  consumedIngredients: z.array(ConsumedIngredientItemSchema).default([]),
});

export const DispatchItemDetailSchema = z.object({
  batchNumber: z.string().min(1, "Batch number is required"),
  quantityShipped: z.number().nullable().default(null),
  unit: z.string().default("units"),
});

export const DispatchExtractionSchema = z.object({
  dispatchNumber: z.string().min(1, "Dispatch number is required"),
  customerName: z.string().default("Unspecified Consignee"),
  customerAddress: z.string().default(""),
  customerContactEmail: z.string().default(""),
  dispatchDate: z.string().nullable().default(null),
  carrier: z.string().default("Standard Freight"),
  itemsShipped: z.array(DispatchItemDetailSchema).default([]),
});

export const ExtractedDocumentDataSchema = z.object({
  documentType: z.enum([
    "SUPPLIER_INVOICE",
    "CERTIFICATE_OF_ANALYSIS",
    "BATCH_PRODUCTION_RECORD",
    "DISPATCH_NOTE",
  ]),
  documentNumber: z.string().default(""),
  issueDate: z.string().nullable().default(null),
  issuerName: z.string().default("Unknown Entity"),
  supplierCode: z.string().optional().default(""),
  supplierEmail: z.string().optional().default(""),
  supplierAddress: z.string().optional().default(""),

  ingredientLots: z.array(InwardLotExtractionSchema).default([]),
  productionBatches: z.array(BatchExtractionSchema).default([]),
  dispatches: z.array(DispatchExtractionSchema).default([]),

  confidenceScore: z.number().min(0).max(1).default(0.85),
  extractionSource: z.enum(["GEMINI_API", "STRUCTURED_HEURISTIC_PARSER"]).default("STRUCTURED_HEURISTIC_PARSER"),
  missingFields: z.array(z.string()).default([]),
  ambiguities: z.array(z.string()).default([]),
  evidenceSnippets: z.array(
    z.object({
      field: z.string(),
      snippet: z.string(),
    })
  ).default([]),
  rawTextPreview: z.string().default(""),
});

export type ExtractedDocumentDataValidated = z.infer<typeof ExtractedDocumentDataSchema>;
