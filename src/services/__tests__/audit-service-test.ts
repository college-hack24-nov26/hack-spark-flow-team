import { AuditService } from "../audit-service";

console.log("==================================================");
console.log("MODULE 7: TRACEABILITY GAP AUDIT VERIFICATION");
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

// Test 1: Run Integrity Scan
console.log("\n[Test 1] Running full integrity scan across database ledgers...");
const scan = AuditService.runIntegrityScan();

assert(scan.totalRulesEvaluated === 6, `Rules evaluated: ${scan.totalRulesEvaluated}`);
assert(scan.totalLotsScanned >= 5, `Lots scanned: ${scan.totalLotsScanned}`);
assert(scan.totalGapsFound >= 2, `Gaps found: ${scan.totalGapsFound}`);

// Test 2: Check Critical and High Gaps
console.log("\n[Test 2] Checking specific detected gap rules...");
const missingCoaGap = scan.gaps.find((g) => g.ruleCode === "MISSING_COA");
assert(Boolean(missingCoaGap && missingCoaGap.targetEntity === "LOT-OAT-9102"), "Detected MISSING_COA gap on LOT-OAT-9102.");

const contaminantGap = scan.gaps.find((g) => g.ruleCode === "CONTAMINANT_DETECTED");
assert(Boolean(contaminantGap && contaminantGap.targetEntity === "LOT-PNUT-2026-081"), "Detected CONTAMINANT_DETECTED gap on LOT-PNUT-2026-081.");

// Test 3: Remediate Missing CoA Gap
console.log("\n[Test 3] Testing Remediation of Missing CoA for LOT-OAT-9102...");
const remRes = AuditService.remediateMissingCoA("LOT-OAT-9102");
assert(remRes.success, "Remediation executed successfully.");

// Re-scan
const postScan = AuditService.runIntegrityScan();
const stillMissing = postScan.gaps.some((g) => g.ruleCode === "MISSING_COA" && g.targetEntity === "LOT-OAT-9102");
assert(!stillMissing, "LOT-OAT-9102 no longer appears in MISSING_COA gap list.");

console.log("\n==================================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
