import { NextRequest, NextResponse } from "next/server";
import { IngredientService } from "@/services/ingredient-service";
import { IngredientFilterParams, IngredientLot } from "@/types/ingredient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: IngredientFilterParams = {
      searchTerm: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      allergen: searchParams.get("allergen") || undefined,
      coaStatus: searchParams.get("coaStatus") || undefined,
    };

    const lots = IngredientService.getAllLots(filters);

    // Compute aggregated operational KPIs
    const totalInventoryKg = lots.reduce((acc, curr) => acc + curr.remainingQuantity, 0);
    const activeReleasedCount = lots.filter((l) => l.status === "RELEASED").length;
    const quarantinedCount = lots.filter((l) => l.status === "QUARANTINE" || l.status === "RECALLED").length;
    const missingCoaCount = lots.filter((l) => l.coaVerification.status === "MISSING_COA").length;

    return NextResponse.json({
      success: true,
      data: lots,
      metrics: {
        totalLots: lots.length,
        totalInventoryKg,
        activeReleasedCount,
        quarantinedCount,
        missingCoaCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch ingredient lots." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: IngredientLot = await request.json();

    if (!body.lotNumber || !body.ingredientName || !body.supplier?.name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: lotNumber, ingredientName, and supplier.name are mandatory." },
        { status: 400 }
      );
    }

    const registered = IngredientService.registerNewLot(body);
    return NextResponse.json({
      success: true,
      message: `Ingredient Lot ${registered.lotNumber} registered successfully.`,
      data: registered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register ingredient lot." },
      { status: 500 }
    );
  }
}
