import { IngredientService } from "../ingredient-service";

async function runIngredientServiceTests() {
  console.log("==================================================");
  console.log("MODULE 3: INGREDIENT LOT MANAGEMENT VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Test 1: Fetch all lots
  console.log("\n[Test 1] Testing getAllLots()...");
  const allLots = IngredientService.getAllLots();
  if (allLots.length >= 6) {
    console.log(`✓ PASS: Retrieved ${allLots.length} initial ground-truth lots.`);
    passed++;
  } else {
    console.error(`✗ FAIL: Expected >= 6 lots, got ${allLots.length}`);
    failed++;
  }

  // Test 2: Filter by status
  console.log("\n[Test 2] Testing status filtering...");
  const recalledLots = IngredientService.getAllLots({ status: "RECALLED" });
  const quarantinedLots = IngredientService.getAllLots({ status: "QUARANTINE" });
  if (recalledLots.length === 1 && recalledLots[0].lotNumber === "LOT-PNUT-2026-081" && quarantinedLots.length === 1) {
    console.log(`✓ PASS: Filtered ${recalledLots.length} recalled lot (Salmonella trigger) and ${quarantinedLots.length} quarantined lot.`);
    passed++;
  } else {
    console.error("✗ FAIL: Status filter did not return expected count.");
    failed++;
  }

  // Test 3: Allergen & CoA Filter
  console.log("\n[Test 3] Testing allergen and CoA filters...");
  const peanutLots = IngredientService.getAllLots({ allergen: "PEANUTS" });
  const missingCoaLots = IngredientService.getAllLots({ coaStatus: "MISSING_COA" });
  if (peanutLots.length === 1 && missingCoaLots.length === 1 && missingCoaLots[0].lotNumber === "LOT-OAT-9102") {
    console.log(`✓ PASS: Allergen and Missing CoA filters work correctly.`);
    passed++;
  } else {
    console.error("✗ FAIL: Allergen/CoA filter error.");
    failed++;
  }

  // Test 4: Mass Balance Validation
  console.log("\n[Test 4] Testing Mass Balance reconciliation...");
  const pnutLot = IngredientService.getLotByNumber("LOT-PNUT-2026-081");
  if (
    pnutLot &&
    pnutLot.massBalance.totalReceived === 5000 &&
    pnutLot.massBalance.totalConsumed === 3750 &&
    pnutLot.massBalance.remainingRecorded === 1250 &&
    pnutLot.massBalance.variance === 0 &&
    pnutLot.massBalance.isBalanced
  ) {
    console.log("✓ PASS: Mass balance is 100% reconciled (5,000 received - 3,750 consumed = 1,250 remaining).");
    passed++;
  } else {
    console.error("✗ FAIL: Mass balance equation failed.");
    failed++;
  }

  // Test 5: Dynamic Disposition Update
  console.log("\n[Test 5] Testing updateLotStatus()...");
  const updateRes = IngredientService.updateLotStatus("LOT-ALMD-2026-033", "QUARANTINE", "Microbial verification re-test");
  if (updateRes.success && updateRes.lot?.status === "QUARANTINE" && updateRes.lot?.quarantineReason?.includes("Microbial")) {
    console.log("✓ PASS: Successfully updated status to QUARANTINE with audit justification.");
    // Revert back for clean state
    IngredientService.updateLotStatus("LOT-ALMD-2026-033", "RELEASED");
    passed++;
  } else {
    console.error("✗ FAIL: updateLotStatus failed.");
    failed++;
  }

  // Test 6: Attach CoA to resolve MISSING_COA gap
  console.log("\n[Test 6] Testing attachCoAToLot() to resolve MISSING_COA gap...");
  const attachRes = IngredientService.attachCoAToLot("LOT-OAT-9102", {
    labName: "National Cereal Inspection Service",
    testDate: "2026-11-03",
    parameters: [
      { parameter: "Moisture", value: "9.8%", specLimit: "< 12.0%", status: "PASS" },
      { parameter: "Salmonella", value: "NEGATIVE", specLimit: "Absence / 25g", status: "PASS" },
    ],
    fileName: "COA-OAT-9102-VERIFIED.pdf",
  });

  if (attachRes.success && attachRes.lot?.coaVerification.status === "VERIFIED" && attachRes.lot?.status === "RELEASED") {
    console.log("✓ PASS: CoA attached and verified. Compliance gap resolved and lot released.");
    passed++;
  } else {
    console.error("✗ FAIL: attachCoAToLot failed.");
    failed++;
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runIngredientServiceTests().catch((err) => {
  console.error("Test threw error:", err);
  process.exit(1);
});
