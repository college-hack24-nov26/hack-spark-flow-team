import { NextRequest, NextResponse } from "next/server";
import { InboundService } from "@/services/inbound-service";

export async function GET() {
  try {
    const farmers = InboundService.getAllFarmers();
    return NextResponse.json({
      success: true,
      data: farmers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch farmers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = InboundService.registerFarmer(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      farmer: result.farmer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register farmer" },
      { status: 500 }
    );
  }
}
