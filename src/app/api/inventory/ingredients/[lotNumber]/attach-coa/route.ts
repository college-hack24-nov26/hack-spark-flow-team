import { NextRequest, NextResponse } from "next/server";
import { IngredientService } from "@/services/ingredient-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lotNumber: string }> }
) {
  try {
    const { lotNumber } = await params;
    const body = await request.json();

    const { labName, testDate, parameters, fileName } = body;

    if (!labName || !parameters || !Array.isArray(parameters)) {
      return NextResponse.json(
        { success: false, error: "Missing required CoA fields (labName, parameters array)." },
        { status: 400 }
      );
    }

    const result = IngredientService.attachCoAToLot(lotNumber, {
      labName,
      testDate: testDate || new Date().toISOString().split("T")[0],
      parameters,
      fileName: fileName || `COA-${lotNumber}.pdf`,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Certificate of Analysis attached to Lot ${lotNumber}. CoA gap resolved.`,
      data: result.lot,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
