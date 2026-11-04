import { InboundService } from "../inbound-service";

console.log("==================================================");
console.log("MODULE: INBOUND RISK INTELLIGENCE VERIFICATION");
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

// Test 1: Demonstration Scenario Screening
console.log("\n[Test 1] Testing Mandated Demonstration Scenarios (LOT-101 to LOT-104)...");
const lots = InboundService.getAllInboundLots();

const lot101 = lots.find((l) => l.lotId === "LOT-101");
const lot102 = lots.find((l) => l.lotId === "LOT-102");
const lot103 = lots.find((l) => l.lotId === "LOT-103");
const lot104 = lots.find((l) => l.lotId === "LOT-104");

assert(Boolean(lot101 && lot101.riskLevel === "GREEN"), "LOT-101 classified as GREEN (No warning in available records).");
assert(Boolean(lot102 && lot102.riskLevel === "RED" && lot102.dispositionStatus === "HOLD"), "LOT-102 classified as RED & placed on HOLD due to failed Chlorpyrifos test.");
assert(Boolean(lot103 && lot103.riskLevel === "GREEN"), "LOT-103 classified as GREEN (Clean Organic Basmati Rice).");
assert(Boolean(lot104 && lot104.riskLevel === "AMBER" && lot104.dispositionStatus === "VERIFICATION_REQUESTED"), "LOT-104 classified as AMBER & VERIFICATION_REQUESTED due to missing CoA.");

// Test 2: Dashboard KPIs Calculation
console.log("\n[Test 2] Testing Dashboard KPIs calculation from records...");
const kpis = InboundService.getDashboardKPIs();
assert(kpis.totalIncomingLots >= 4, `Total incoming lots: ${kpis.totalIncomingLots} (Expected >= 4)`);
assert(kpis.highRiskLots >= 1, `High risk lots: ${kpis.highRiskLots} (Expected >= 1)`);
assert(kpis.lotsOnHold >= 1, `Lots on hold: ${kpis.lotsOnHold} (Expected >= 1)`);
assert(kpis.totalVolumeKg > 50000, `Total agricultural volume: ${kpis.totalVolumeKg.toLocaleString()} kg`);

// Test 3: Safety Guard on Releasing High-Risk (RED) Lot
console.log("\n[Test 3] Testing Safety Guard: Unauthorized release of RED lot...");
const unauthorizedRelease = InboundService.releaseLot("LOT-102");
assert(!unauthorizedRelease.success, "Safety guard blocked unauthorized release of RED lot without authorized review.");

// Test 4: Authorized Release with Electronic Sign-Off
console.log("\n[Test 4] Testing Authorized Release with review credentials...");
const authorizedRelease = InboundService.releaseLot(
  "LOT-102",
  "Dr. Evelyn Reed (Chief Quality Officer)",
  "Re-tested via gas chromatography mass spec. Initial false positive cleared by secondary assay MW-9921."
);
assert(authorizedRelease.success, "Authorized human review override accepted with cryptographic signature ref.");
assert(Boolean(authorizedRelease.lot?.authorizedReview?.reviewedBy.includes("Evelyn Reed")), "Electronic sign-off persisted in record.");

// Test 5: Registering New Inbound Lot with Dynamic Screening
console.log("\n[Test 5] Testing New Inbound Lot Registration...");
const newReg = InboundService.registerInboundLot({
  lotId: "LOT-999-TEST",
  farmerId: "FARM-001",
  ingredient: "Organic Durum Wheat",
  cropType: "Wheat",
  quantity: 5000,
  harvestDate: "2026-10-05",
  labReportStatus: "AVAILABLE",
  coaStatus: "VERIFIED",
  labParameters: [
    { parameter: "Moisture", value: "11.0%", specLimit: "< 13.0%", status: "PASS" },
  ],
});
assert(newReg.success && newReg.lot?.riskLevel === "GREEN", "New lot registered and screened as GREEN.");

// Test 6: Traceability Integration (Promote to L3 Manufacturer Inventory)
console.log("\n[Test 6] Testing Traceability Integration: Promote L2 Inbound Lot to L3 Manufacturer...");
const promotion = InboundService.promoteToManufacturerLot("LOT-101");
assert(promotion.success, "Successfully promoted LOT-101 to Manufacturer Ingredient Lot.");
assert(Boolean(promotion.ingredientLot?.farmerOrigin?.farmerId === "FARM-001"), "Farmer origin (FARM-001, Harpreet Singh) preserved in manufacturer lot.");

console.log("\n==================================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
