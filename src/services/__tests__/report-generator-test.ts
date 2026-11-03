import { ReportGenerator } from "../report-generator";

console.log("==================================================");
console.log("MODULE 8: EVIDENCE-BACKED REPORTS VERIFICATION");
console.log("==================================================");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Generate FSMA 204 Dataset
console.log("\n[Test 1] Generating FSMA 204 Electronic Sortable Spreadsheet rows...");
const rows = ReportGenerator.generateFSMA204Dataset();

assert(rows.length >= 12, `Total CTE rows generated: ${rows.length} (Expected >= 12).`);

const hasReceiving = rows.some((r) => r.cteType === "RECEIVING");
const hasTransformation = rows.some((r) => r.cteType === "TRANSFORMATION");
const hasShipping = rows.some((r) => r.cteType === "SHIPPING");

assert(hasReceiving, "Dataset contains Inward Receiving CTE rows.");
assert(hasTransformation, "Dataset contains Manufacturing Transformation CTE rows.");
assert(hasShipping, "Dataset contains Outbound Shipping CTE rows.");

// Test 2: Generate CSV text
console.log("\n[Test 2] Generating CSV string representation...");
const csv = ReportGenerator.generateCSV(rows);

assert(csv.includes("CTE_TYPE,TRACEABILITY_LOT_CODE"), "CSV contains mandatory FSMA 204 headers.");
assert(csv.includes("LOT-PNUT-2026-081"), "CSV contains raw ingredient lot LOT-PNUT-2026-081.");
assert(csv.includes("BATCH-2026-1049"), "CSV contains production batch BATCH-2026-1049.");

console.log("\n==================================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
