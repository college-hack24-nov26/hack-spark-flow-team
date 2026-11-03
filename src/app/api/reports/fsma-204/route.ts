import { NextRequest, NextResponse } from "next/server";
import { ReportGenerator } from "@/services/report-generator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const rows = ReportGenerator.generateFSMA204Dataset();

    if (format === "csv") {
      const csv = ReportGenerator.generateCSV(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="FSMA-204-ELECTRONIC-SPREADSHEET-24HR.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      meta: {
        totalRows: rows.length,
        regulation: "FSMA Section 204 (21 CFR § 1.1455)",
        generatedAt: new Date().toISOString(),
        sha256Checksum: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      },
      data: rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
