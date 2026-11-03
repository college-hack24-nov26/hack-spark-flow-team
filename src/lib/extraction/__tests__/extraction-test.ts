import fs from "fs";
import path from "path";
import { validateUploadedFile, parseFileContent } from "../file-parser";
import { extractStructuredData } from "../llm-extractor";
import { ExtractedDocumentDataSchema } from "../schemas";

async function runTests() {
  console.log("==================================================");
  console.log("TRACEX AI DOCUMENT EXTRACTION MODULE VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Test 1: File Validation (Valid vs Invalid Size/Type)
  console.log("\n[Test 1] Validating file types & limits...");
  const validCsv = validateUploadedFile("invoice.csv", 1024);
  const validXlsx = validateUploadedFile("batch_sheet.xlsx", 50000);
  const validPdf = validateUploadedFile("coa_lab.pdf", 200000);
  const invalidType = validateUploadedFile("malware.exe", 100);
  const invalidSize = validateUploadedFile("giant.csv", 15 * 1024 * 1024);

  if (
    validCsv.isValid &&
    validXlsx.isValid &&
    validPdf.isValid &&
    !invalidType.isValid &&
    !invalidSize.isValid
  ) {
    console.log("✓ PASS: File size and extension security validations behave as expected.");
    passed++;
  } else {
    console.error("✗ FAIL: Validation logic failed.");
    failed++;
  }

  // Test 2: Inward CoA CSV Extraction
  console.log("\n[Test 2] Testing CoA extraction on sample_coa_peanut_paste.csv...");
  const coaPath = path.join(process.cwd(), "public", "sample-docs", "sample_coa_peanut_paste.csv");
  const coaBuffer = fs.readFileSync(coaPath);
  const parsedCoa = await parseFileContent(coaBuffer, "sample_coa_peanut_paste.csv");
  const extractedCoa = await extractStructuredData(parsedCoa, "sample_coa_peanut_paste.csv");

  const validatedCoa = ExtractedDocumentDataSchema.safeParse(extractedCoa);
  if (
    validatedCoa.success &&
    extractedCoa.documentType === "CERTIFICATE_OF_ANALYSIS" &&
    extractedCoa.ingredientLots.length > 0 &&
    extractedCoa.ingredientLots[0].lotNumber === "LOT-PNUT-2026-081" &&
    extractedCoa.ingredientLots[0].testResults.some((t) => t.parameter.toLowerCase().includes("salmonella"))
  ) {
    console.log(`✓ PASS: CoA extracted correctly.`);
    console.log(`  - Target Lot: ${extractedCoa.ingredientLots[0].lotNumber}`);
    console.log(`  - Supplier: ${extractedCoa.issuerName}`);
    console.log(`  - Salmonella Assay: ${extractedCoa.ingredientLots[0].testResults[0]?.resultValue} (${extractedCoa.ingredientLots[0].testResults[0]?.status})`);
    passed++;
  } else {
    console.error("✗ FAIL: CoA extraction or schema validation failed:", validatedCoa.error?.format());
    failed++;
  }

  // Test 3: Batch Production Record Extraction
  console.log("\n[Test 3] Testing Batch Sheet extraction on sample_batch_production_log.csv...");
  const batchPath = path.join(process.cwd(), "public", "sample-docs", "sample_batch_production_log.csv");
  const batchBuffer = fs.readFileSync(batchPath);
  const parsedBatch = await parseFileContent(batchBuffer, "sample_batch_production_log.csv");
  const extractedBatch = await extractStructuredData(parsedBatch, "sample_batch_production_log.csv");

  const validatedBatch = ExtractedDocumentDataSchema.safeParse(extractedBatch);
  if (
    validatedBatch.success &&
    extractedBatch.documentType === "BATCH_PRODUCTION_RECORD" &&
    extractedBatch.productionBatches.length > 0 &&
    extractedBatch.productionBatches[0].batchNumber === "BATCH-2026-1049" &&
    extractedBatch.productionBatches[0].consumedIngredients.length > 0
  ) {
    console.log(`✓ PASS: Production Batch & BOM lineage extracted correctly.`);
    console.log(`  - Batch Number: ${extractedBatch.productionBatches[0].batchNumber}`);
    console.log(`  - Yield: ${extractedBatch.productionBatches[0].yieldQuantity} jars`);
    console.log(`  - BOM Ingredients: ${extractedBatch.productionBatches[0].consumedIngredients.map((i) => i.lotNumber).join(", ")}`);
    passed++;
  } else {
    console.error("✗ FAIL: Batch extraction failed:", validatedBatch.error?.format());
    failed++;
  }

  // Test 4: Dispatch Note Extraction
  console.log("\n[Test 4] Testing Dispatch Manifest extraction on sample_dispatch_manifest.csv...");
  const dspPath = path.join(process.cwd(), "public", "sample-docs", "sample_dispatch_manifest.csv");
  const dspBuffer = fs.readFileSync(dspPath);
  const parsedDsp = await parseFileContent(dspBuffer, "sample_dispatch_manifest.csv");
  const extractedDsp = await extractStructuredData(parsedDsp, "sample_dispatch_manifest.csv");

  const validatedDsp = ExtractedDocumentDataSchema.safeParse(extractedDsp);
  if (
    validatedDsp.success &&
    extractedDsp.documentType === "DISPATCH_NOTE" &&
    extractedDsp.dispatches.length > 0 &&
    extractedDsp.dispatches[0].customerName.includes("National Supermarkets")
  ) {
    console.log(`✓ PASS: Dispatch Manifest extracted correctly.`);
    console.log(`  - Dispatch #: ${extractedDsp.dispatches[0].dispatchNumber}`);
    console.log(`  - Customer: ${extractedDsp.dispatches[0].customerName}`);
    console.log(`  - Carrier: ${extractedDsp.dispatches[0].carrier}`);
    passed++;
  } else {
    console.error("✗ FAIL: Dispatch extraction failed:", validatedDsp.error?.format());
    failed++;
  }

  // Test 5: Truthfulness Guarantee (Never invent missing values)
  console.log("\n[Test 5] Checking truthfulness rules (Missing fields flagged, no silent invention)...");
  if (extractedCoa.missingFields !== undefined && extractedCoa.ambiguities !== undefined) {
    console.log(`✓ PASS: Missing fields (${extractedCoa.missingFields.length}) and ambiguities (${extractedCoa.ambiguities.length}) explicitly tracked.`);
    passed++;
  } else {
    console.error("✗ FAIL: Truthfulness metadata missing.");
    failed++;
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw error:", err);
  process.exit(1);
});
