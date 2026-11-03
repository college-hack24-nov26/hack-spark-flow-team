import { NextRequest, NextResponse } from "next/server";
import { GraphEngine } from "@/services/graph-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const direction = (searchParams.get("direction") || "forward") as "forward" | "backward" | "full";
    const rootId = searchParams.get("rootId") || "lot-pnut-081";
    const layout = (searchParams.get("layout") || "LR") as "LR" | "TB";

    let result;
    if (direction === "backward") {
      result = GraphEngine.buildBackwardGraph(rootId, layout);
    } else if (direction === "full") {
      result = GraphEngine.buildFullGraph(layout);
    } else {
      result = GraphEngine.buildForwardGraph(rootId, layout);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate supply chain graph",
      },
      { status: 500 }
    );
  }
}
