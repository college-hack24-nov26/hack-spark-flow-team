import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sampleName = searchParams.get("name") || "sample_coa_peanut_paste.csv";

  try {
    const filePath = path.join(process.cwd(), "public", "sample-docs", sampleName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `Sample document '${sampleName}' not found.` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${sampleName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
