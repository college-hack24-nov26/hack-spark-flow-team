import { NextRequest, NextResponse } from "next/server";
import { BatchService } from "@/services/batch-service";
import { BatchFilterParams, ProductionBatch } from "@/types/batch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: BatchFilterParams = {
      searchTerm: searchParams.get("search") || undefined,
      qaStatus: searchParams.get("qaStatus") || undefined,
      lineIdentifier: searchParams.get("line") || undefined,
      compromisedOnly: searchParams.get("compromised") === "true",
    };

    const batches = BatchService.getAllBatches(filters);

    // Compute aggregated operational KPIs
    const totalProducedUnits = batches.reduce((acc, b) => acc + b.yieldQuantity, 0);
    const totalDispatchedUnits = batches.reduce((acc, b) => acc + b.marketStatus.dispatchedQuantity, 0);
    const totalQuarantinedUnits = batches.reduce((acc, b) => acc + b.marketStatus.warehouseQuarantineQuantity, 0);
    const compromisedBatchesCount = batches.filter((b) => b.contaminationExposure.isCompromised).length;
    const recalledBatchesCount = batches.filter((b) => b.qaStatus === "RECALLED").length;
    const passedBatchesCount = batches.filter((b) => b.qaStatus === "PASSED").length;

    return NextResponse.json({
      success: true,
      data: batches,
      metrics: {
        totalBatches: batches.length,
        totalProducedUnits,
        totalDispatchedUnits,
        totalQuarantinedUnits,
        compromisedBatchesCount,
        recalledBatchesCount,
        passedBatchesCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch production batches." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Partial<ProductionBatch> = await request.json();

    if (!body.batchNumber || !body.product?.name) {
      return NextResponse.json(
        { success: false, error: "Batch number and product information are required." },
        { status: 400 }
      );
    }

    const result = BatchService.formulateBatch(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Production batch ${result.batch?.batchNumber} successfully recorded and formulated.`,
      data: result.batch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to formulate production batch." },
      { status: 500 }
    );
  }
}
