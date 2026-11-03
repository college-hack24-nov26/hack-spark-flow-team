import { NextRequest, NextResponse } from "next/server";
import { ExtractedDocumentDataSchema } from "@/lib/extraction/schemas";
import { ConfirmDocumentRequest, ConfirmDocumentResponse } from "@/types/extraction";

// Persistent in-memory ledger representing verified database records committed in this session
const verifiedLedger = {
  documents: [] as any[],
  ingredientLots: [] as any[],
  productionBatches: [] as any[],
  batchIngredientUsages: [] as any[],
  dispatches: [] as any[],
};

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmDocumentRequest = await request.json();

    if (!body.documentId || !body.confirmedData) {
      return NextResponse.json(
        { success: false, error: "Invalid confirmation payload. Missing documentId or confirmedData." },
        { status: 400 }
      );
    }

    // 1. Strict validation of human-reviewed data
    const parseResult = ExtractedDocumentDataSchema.safeParse(body.confirmedData);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed on confirmed data. Please check required fields.",
          details: parseResult.error.format(),
        },
        { status: 422 }
      );
    }

    const data = parseResult.data;

    // 2. Commit Document Reference for Evidence & Audit Trails
    const docRecord = {
      id: body.documentId,
      fileName: body.fileName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      issuerName: data.issuerName,
      confidenceScore: data.confidenceScore,
      extractionSource: data.extractionSource,
      confirmedAt: new Date().toISOString(),
    };
    verifiedLedger.documents.push(docRecord);

    let lotsRecorded = 0;
    let batchesRecorded = 0;
    let usagesRecorded = 0;
    let dispatchesRecorded = 0;

    // 3. Commit Ingredient Lots (with Document FK)
    for (const lot of data.ingredientLots) {
      verifiedLedger.ingredientLots.push({
        lotNumber: lot.lotNumber,
        ingredientName: lot.ingredientName,
        quantity: lot.quantity,
        unit: lot.unit,
        receivedDate: lot.receivedDate,
        expiryDate: lot.expiryDate,
        sourceDocumentId: body.documentId,
        testResults: lot.testResults,
        status: lot.testResults.some((t) => t.status === "FAIL" || t.status === "FLAGGED")
          ? "RECALLED"
          : "RELEASED",
      });
      lotsRecorded++;
    }

    // 4. Commit Production Batches & Bill of Materials Usages
    for (const batch of data.productionBatches) {
      verifiedLedger.productionBatches.push({
        batchNumber: batch.batchNumber,
        productName: batch.productName,
        sku: batch.sku,
        productionDate: batch.productionDate,
        expiryDate: batch.expiryDate,
        yieldQuantity: batch.yieldQuantity,
        unit: batch.unit,
        lineIdentifier: batch.lineIdentifier,
        qaStatus: batch.qaStatus,
        sourceDocumentId: body.documentId,
      });
      batchesRecorded++;

      // Strict BOM usage recording: only connect if explicitly present in the verified record
      for (const usage of batch.consumedIngredients) {
        verifiedLedger.batchIngredientUsages.push({
          batchNumber: batch.batchNumber,
          ingredientLotNumber: usage.lotNumber,
          quantityUsed: usage.quantityUsed,
          unit: usage.unit,
          verifiedViaDocumentId: body.documentId,
        });
        usagesRecorded++;
      }
    }

    // 5. Commit Dispatch Records
    for (const dispatch of data.dispatches) {
      verifiedLedger.dispatches.push({
        dispatchNumber: dispatch.dispatchNumber,
        customerName: dispatch.customerName,
        customerAddress: dispatch.customerAddress,
        dispatchDate: dispatch.dispatchDate,
        carrier: dispatch.carrier,
        itemsShipped: dispatch.itemsShipped,
        sourceDocumentId: body.documentId,
      });
      dispatchesRecorded++;
    }

    const response: ConfirmDocumentResponse = {
      success: true,
      message: `Successfully verified and committed document ${body.fileName} to the relational traceability ledger.`,
      documentId: body.documentId,
      ledgerRecordCount: {
        lotsRecorded,
        batchesRecorded,
        usagesRecorded,
        dispatchesRecorded,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Document confirmation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to commit confirmed document records." },
      { status: 500 }
    );
  }
}
