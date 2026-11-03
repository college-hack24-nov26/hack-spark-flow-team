import { RecallService } from "../recall-service";

console.log("==================================================");
console.log("MODULE 6: RECALL INTELLIGENCE ENGINE VERIFICATION");
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

// Test 1: Calculate Blast Radius for LOT-PNUT-2026-081
console.log("\n[Test 1] Testing calculateBlastRadius for LOT-PNUT-2026-081...");
const analysis = RecallService.calculateBlastRadius("LOT-PNUT-2026-081");

assert(analysis.severityClass === "CLASS_I", `Severity class is ${analysis.severityClass} (Expected CLASS_I).`);
assert(analysis.impactSummary.totalCompromisedBatches === 2, `Compromised batches count: ${analysis.impactSummary.totalCompromisedBatches} (Expected 2).`);
assert(analysis.impactSummary.totalFinishedUnitsProduced === 14200, `Total finished units: ${analysis.impactSummary.totalFinishedUnitsProduced} (Expected 14,200).`);
assert(analysis.impactSummary.totalUnitsInCommerce === 10000, `Units in commerce: ${analysis.impactSummary.totalUnitsInCommerce} (Expected 10,000).`);
assert(analysis.customerConsignments.length >= 3, `Customer consignments mapped: ${analysis.customerConsignments.length} (Expected >= 3).`);

// Test 2: Check Customer DC Consignment Details
console.log("\n[Test 2] Checking distributor notification contacts...");
const national = analysis.customerConsignments.find((c) => c.customerName.includes("National Supermarkets"));
assert(Boolean(national && national.contactPerson.includes("David Chen")), "Verified National Supermarkets contact David Chen.");
assert(Boolean(national && national.contactEmail.includes("@nationalsupermarkets.com")), "Verified email channel for urgent notice.");

// Test 3: Lock Warehouse Inventory
console.log("\n[Test 3] Testing Lock Warehouse Inventory action...");
const lockResult = RecallService.lockWarehouseInventory();
assert(lockResult.success, "Warehouse quarantine lock successfully executed.");

const updatedAnalysis = RecallService.calculateBlastRadius("LOT-PNUT-2026-081");
assert(updatedAnalysis.impactSummary.isWarehouseLocked, "State updated: Warehouse inventory locked.");

// Test 4: Dispatch Notices & Acknowledge Quarantine
console.log("\n[Test 4] Testing Distributor Notice Dispatch & Quarantine Acknowledgment...");
const dispatchResult = RecallService.dispatchDistributorNotices();
assert(dispatchResult.noticesCount >= 3, `Dispatched notices count: ${dispatchResult.noticesCount} (Expected >= 3).`);

const firstDispatch = analysis.customerConsignments[0].dispatchNumber;
const ackResult = RecallService.acknowledgeCustomerQuarantine(firstDispatch);
assert(ackResult, `Successfully acknowledged distributor quarantine for ${firstDispatch}.`);

console.log("\n==================================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
