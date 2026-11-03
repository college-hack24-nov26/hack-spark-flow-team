import { NextRequest, NextResponse } from "next/server";
import { validateUploadedFile, parseFileContent } from "@/lib/extraction/file-parser";
import { extractStructuredData } from "@/lib/extraction/llm-extractor";
import { ExtractionResponse } from "@/types/extraction";

// Temporary in-memory ledger store for extraction drafts during the session
const globalDocumentDrafts = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No document file was uploaded in request." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;

    // 1. File Type and Size Validation
    const validation = validateUploadedFile(fileName, fileSize);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 2. Read bytes into Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text content (PDF, CSV, XLSX)
    const parsedFile = await parseFileContent(buffer, fileName);

    // 4. Run LLM Structured Extraction (with Schema Validation & Heuristic Fallback)
    const extractedData = await extractStructuredData(parsedFile, fileName);

    const documentId = `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Store draft for human review and confirmation
    const draftPayload = {
      documentId,
      fileName,
      fileType: parsedFile.fileType,
      fileSizeBytes: fileSize,
      data: extractedData,
      rawTextPreview: parsedFile.text.slice(0, 1000),
      createdAt: new Date().toISOString(),
    };

    globalDocumentDrafts.set(documentId, draftPayload);

    const response: ExtractionResponse = {
      success: true,
      documentId,
      fileName,
      fileType: parsedFile.fileType,
      fileSizeBytes: fileSize,
      data: extractedData,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Document ingestion pipeline error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during document extraction.",
      },
      { status: 500 }
    );
  }
}
