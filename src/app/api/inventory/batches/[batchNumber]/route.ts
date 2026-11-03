import { NextRequest, NextResponse } from "next/server";
import { BatchService } from "@/services/batch-service";
import { QAStatus } from "@/types/batch";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchNumber: string }> }
) {
  try {
    const { batchNumber } = await params;
    const batch = BatchService.getBatchByNumber(batchNumber);

    if (!batch) {
      return NextResponse.json(
        { success: false, error: `Production batch '${batchNumber}' was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: batch });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ batchNumber: string }> }
) {
  try {
    const { batchNumber } = await params;
    const body = await request.json();
    const { status, reason, signature } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "QA status field is required (PASSED, PENDING, QUARANTINED, RECALLED)." },
        { status: 400 }
      );
    }

    const result = BatchService.updateQAStatus(
      batchNumber,
      status as QAStatus,
      reason,
      signature
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Batch ${batchNumber} disposition updated to ${status}.`,
      data: result.batch,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
