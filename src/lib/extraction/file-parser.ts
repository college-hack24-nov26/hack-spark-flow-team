import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedFileResult {
  text: string;
  fileType: "pdf" | "csv" | "xlsx" | "xls" | "unknown";
  isScannedPdf?: boolean;
  pageCount?: number;
  sheetCount?: number;
  rowCount?: number;
  base64Data?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const ALLOWED_EXTENSIONS = [".pdf", ".csv", ".xlsx", ".xls"];

export function validateUploadedFile(
  fileName: string,
  fileSize: number,
  mimeType?: string
): { isValid: boolean; error?: string } {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the 10MB limit. Current size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Unsupported file format '${ext}'. TraceX Ai currently supports PDF, CSV, and XLSX files.`,
    };
  }

  return { isValid: true };
}

export async function parseFileContent(
  buffer: Buffer,
  fileName: string
): Promise<ParsedFileResult> {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));

  // 1. CSV Parsing
  if (ext === ".csv") {
    const csvString = buffer.toString("utf-8");
    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    const headers = parsed.meta.fields || [];
    const rows = parsed.data as Record<string, any>[];

    let formattedText = `CSV FILENAME: ${fileName}\nCOLUMN HEADERS: ${headers.join(" | ")}\n\nROWS:\n`;
    rows.slice(0, 100).forEach((row, idx) => {
      const line = Object.entries(row)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" ; ");
      formattedText += `[Row ${idx + 1}] ${line}\n`;
    });

    return {
      text: formattedText,
      fileType: "csv",
      rowCount: rows.length,
    };
  }

  // 2. Excel (XLSX / XLS) Parsing
  if (ext === ".xlsx" || ext === ".xls") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    let combinedText = `EXCEL WORKBOOK: ${fileName}\nSHEETS: ${workbook.SheetNames.join(", ")}\n\n`;

    let totalRows = 0;
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, any>[];
      totalRows += rows.length;

      combinedText += `--- SHEET: ${sheetName} (${rows.length} rows) ---\n`;
      rows.slice(0, 80).forEach((row, idx) => {
        const line = Object.entries(row)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" ; ");
        combinedText += `[Row ${idx + 1}] ${line}\n`;
      });
      combinedText += "\n";
    });

    return {
      text: combinedText,
      fileType: ext === ".xlsx" ? "xlsx" : "xls",
      sheetCount: workbook.SheetNames.length,
      rowCount: totalRows,
    };
  }

  // 3. PDF Parsing (Text-based & Scanned Detection)
  if (ext === ".pdf") {
    const base64Data = buffer.toString("base64");
    try {
      // Dynamic import to prevent SSR bundling issues
      const pdfModule = await import("pdf-parse");
      const PDFParseClass = (pdfModule as any).PDFParse || (pdfModule as any).default?.PDFParse || (pdfModule as any).default;

      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buffer });
        const textResult = await parser.getText();
        if (typeof parser.destroy === "function") {
          await parser.destroy();
        }

        const rawText = typeof textResult === "string" ? textResult : (textResult?.text || "");
        const isScanned = rawText.trim().length < 30;

        return {
          text: rawText,
          fileType: "pdf",
          isScannedPdf: isScanned,
          base64Data,
        };
      }
    } catch (pdfErr) {
      console.warn("Local PDF text extraction warning:", pdfErr);
    }

    // Fallback if local parser returns minimal text (scanned PDF)
    return {
      text: `PDF Document: ${fileName} [Scanned or Encrypted PDF]`,
      fileType: "pdf",
      isScannedPdf: true,
      base64Data,
    };
  }

  return {
    text: buffer.toString("utf-8"),
    fileType: "unknown",
  };
}
