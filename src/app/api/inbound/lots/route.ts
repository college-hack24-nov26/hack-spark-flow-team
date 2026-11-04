import { NextRequest, NextResponse } from "next/server";
import { InboundService } from "@/services/inbound-service";
import { InboundFilterParams } from "@/types/inbound";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: InboundFilterParams = {
      searchTerm: searchParams.get("searchTerm") || undefined,
      riskLevel: searchParams.get("riskLevel") || undefined,
      dispositionStatus: searchParams.get("dispositionStatus") || undefined,
      cropType: searchParams.get("cropType") || undefined,
    };

    const lots = InboundService.getAllInboundLots(filters);
    const kpis = InboundService.getDashboardKPIs();

    return NextResponse.json({
      success: true,
      data: {
        lots,
        kpis,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch inbound lots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = InboundService.registerInboundLot(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      lot: result.lot,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register inbound lot" },
      { status: 500 }
    );
  }
}
