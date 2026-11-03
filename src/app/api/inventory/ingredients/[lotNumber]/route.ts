import { NextRequest, NextResponse } from "next/server";
import { IngredientService } from "@/services/ingredient-service";
import { LotStatus } from "@/types/ingredient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lotNumber: string }> }
) {
  try {
    const { lotNumber } = await params;
    const lot = IngredientService.getLotByNumber(lotNumber);

    if (!lot) {
      return NextResponse.json(
        { success: false, error: `Ingredient lot '${lotNumber}' was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lot });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ lotNumber: string }> }
) {
  try {
    const { lotNumber } = await params;
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status field is required (RELEASED, QUARANTINE, EXHAUSTED, RECALLED)." },
        { status: 400 }
      );
    }

    const result = IngredientService.updateLotStatus(lotNumber, status as LotStatus, reason);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Lot ${lotNumber} status changed to ${status}.`,
      data: result.lot,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
