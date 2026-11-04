import { NextRequest, NextResponse } from "next/server";
import { InboundService } from "@/services/inbound-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lotId: string }> }
) {
  try {
    const { lotId } = await params;
    const body = await request.json();
    const action = body.action; // "HOLD" | "RELEASE" | "REQUEST_VERIFICATION" | "PROMOTE_TO_MFG"

    if (action === "HOLD") {
      const reason = body.reason || "Manual hold applied by merchant inspection officer.";
      const result = InboundService.holdLot(lotId, reason);
      return NextResponse.json(result);
    }

    if (action === "REQUEST_VERIFICATION") {
      const notes = body.notes || "Requested official accredited laboratory CoA report.";
      const result = InboundService.requestVerification(lotId, notes);
      return NextResponse.json(result);
    }

    if (action === "RELEASE") {
      const authorizedBy = body.authorizedBy;
      const justification = body.justification;
      const result = InboundService.releaseLot(lotId, authorizedBy, justification);
      
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    if (action === "PROMOTE_TO_MFG") {
      const result = InboundService.promoteToManufacturerLot(lotId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update disposition" },
      { status: 500 }
    );
  }
}
