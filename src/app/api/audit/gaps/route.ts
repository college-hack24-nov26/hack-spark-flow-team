import { NextRequest, NextResponse } from "next/server";
import { AuditService } from "@/services/audit-service";

export async function GET() {
  try {
    const scan = AuditService.runIntegrityScan();
    return NextResponse.json({ success: true, data: scan });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run audit scan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "REMEDIATE_COA") {
      const lotNumber = body.lotNumber;
      if (!lotNumber) {
        return NextResponse.json({ success: false, error: "Missing lotNumber" }, { status: 400 });
      }
      const result = AuditService.remediateMissingCoA(lotNumber);
      return NextResponse.json({ success: result.success, message: result.message });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute audit remediation" },
      { status: 500 }
    );
  }
}
