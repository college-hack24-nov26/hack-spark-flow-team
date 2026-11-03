import { NextRequest, NextResponse } from "next/server";
import { RecallService } from "@/services/recall-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lotNumber = searchParams.get("lotNumber") || "LOT-PNUT-2026-081";

    const analysis = RecallService.calculateBlastRadius(lotNumber);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate recall blast radius" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "LOCK_WAREHOUSE") {
      const result = RecallService.lockWarehouseInventory();
      return NextResponse.json({ success: true, result });
    }

    if (action === "DISPATCH_NOTICES") {
      const result = RecallService.dispatchDistributorNotices();
      return NextResponse.json({ success: true, result });
    }

    if (action === "ACKNOWLEDGE_CUSTOMER") {
      const dispatchNumber = body.dispatchNumber;
      if (!dispatchNumber) {
        return NextResponse.json({ success: false, error: "Missing dispatchNumber" }, { status: 400 });
      }
      const success = RecallService.acknowledgeCustomerQuarantine(dispatchNumber);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute recall action" },
      { status: 500 }
    );
  }
}
