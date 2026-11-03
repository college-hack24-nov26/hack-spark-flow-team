import { BatchService } from "../batch-service";
import { IngredientService } from "../ingredient-service";

async function runBatchServiceTests() {
  console.log("==================================================");
  console.log("MODULE 4: PRODUCTION BATCH MANAGEMENT VERIFICATION");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // Test 1: Fetch all production batches
  console.log("\n[Test 1] Testing getAllBatches()...");
  const allBatches = BatchService.getAllBatches();
  if (allBatches.length >= 5) {
    console.log(`✓ PASS: Retrieved ${allBatches.length} production batches.`);
    passed++;
  } else {
    console.error(`✗ FAIL: Expected >= 5 batches, got ${allBatches.length}`);
    failed++;
  }

  // Test 2: Filter by QA Status
  console.log("\n[Test 2] Testing QA Status filtering...");
  const recalledBatches = BatchService.getAllBatches({ qaStatus: "RECALLED" });
  const passedBatches = BatchService.getAllBatches({ qaStatus: "PASSED" });
  if (recalledBatches.length === 2 && passedBatches.length === 2) {
    console.log(`✓ PASS: Correctly filtered ${recalledBatches.length} recalled batches and ${passedBatches.length} passed batches.`);
    passed++;
  } else {
    console.error(`✗ FAIL: Expected 2 recalled and 2 passed, got ${recalledBatches.length} and ${passedBatches.length}`);
    failed++;
  }

  // Test 3: Contamination Exposure & Blast Radius Detection
  console.log("\n[Test 3] Testing contamination exposure detection for LOT-PNUT-2026-081...");
  const compromised = BatchService.getCompromisedBatches("LOT-PNUT-2026-081");
  if (
    compromised.length === 2 &&
    compromised.some((b) => b.batchNumber === "BATCH-2026-1049") &&
    compromised.some((b) => b.batchNumber === "BATCH-2026-1052")
  ) {
    console.log("✓ PASS: Forward trace correctly identified 2 compromised production batches:");
    compromised.forEach((b) => {
      console.log(`  - ${b.batchNumber}: ${b.product.name} (${b.yieldQuantity} units produced, ${b.marketStatus.dispatchedQuantity} in market)`);
    });
    passed++;
  } else {
    console.error("✗ FAIL: Compromised batch detection failed.");
    failed++;
  }

  // Test 4: Bill of Materials & Transformation CTE
  console.log("\n[Test 4] Testing BOM composition & inventory decrement during formulation...");
  const initialAlmondLot = IngredientService.getLotByNumber("LOT-ALMD-2026-033");
  const initialRemaining = initialAlmondLot ? initialAlmondLot.remainingQuantity : 0;

  const newBatchRes = BatchService.formulateBatch({
    batchNumber: "BATCH-TEST-2026-999",
    workOrderId: "WO-TEST-999",
    product: {
      id: "prod-test-almond",
      name: "Organic Test Almond Butter 350g",
      sku: "SKU-TEST-ALMD-350G",
      category: "Spreads & Nut Butters",
      netWeight: "350g",
      standardPackSize: "12 jars / case",
      upcBarcode: "850021949999",
    },
    facility: {
      name: "Austin Processing Facility #1",
      lineIdentifier: "Packaging Line 2",
      supervisorName: "Sarah Jenkins",
      shift: "Morning (06:00 - 14:00)",
    },
    productionDate: "2026-11-03",
    expiryDate: "2027-11-03",
    targetQuantity: 1000,
    yieldQuantity: 990,
    unit: "jars",
    qaStatus: "PASSED",
    billOfMaterials: [
      {
        ingredientLotId: "lot-almd-033",
        lotNumber: "LOT-ALMD-2026-033",
        ingredientName: "California Almond Paste",
        supplierName: "Pacific Nut Growers Co.",
        plannedQuantity: 400,
        actualQuantityUsed: 400,
        unit: "kg",
        addedAt: new Date().toISOString(),
        isTainted: false,
        allergenProfiles: ["TREE_NUTS"],
      },
    ],
  });

  const updatedAlmondLot = IngredientService.getLotByNumber("LOT-ALMD-2026-033");
  const updatedRemaining = updatedAlmondLot ? updatedAlmondLot.remainingQuantity : 0;

  if (
    newBatchRes.success &&
    newBatchRes.batch &&
    newBatchRes.batch.yieldEfficiency === 99 &&
    initialRemaining - updatedRemaining === 400
  ) {
    console.log(`✓ PASS: Batch formulated successfully. Raw ingredient balance decremented by 400 kg.`);
    console.log(`  - Initial: ${initialRemaining} kg -> Remaining: ${updatedRemaining} kg`);
    passed++;
  } else {
    console.error("✗ FAIL: Batch formulation or inventory deduction failed.");
    failed++;
  }

  // Test 5: Safety Guard (Auto-quarantine when formulated with a tainted lot)
  console.log("\n[Test 5] Testing Safety Guard: Auto-quarantine on tainted lot formulation...");
  const taintedBatchRes = BatchService.formulateBatch({
    batchNumber: "BATCH-TAINTED-CHECK-01",
    workOrderId: "WO-TAINTED-01",
    product: {
      id: "prod-tainted-pb",
      name: "Tainted Check Peanut Butter",
      sku: "SKU-TAINTED-PB",
      category: "Spreads",
      netWeight: "400g",
      standardPackSize: "12 jars / case",
      upcBarcode: "850021940001",
    },
    billOfMaterials: [
      {
        ingredientLotId: "lot-pnut-081",
        lotNumber: "LOT-PNUT-2026-081",
        ingredientName: "Roasted Peanut Paste",
        supplierName: "Golden Valley Organics",
        plannedQuantity: 100,
        actualQuantityUsed: 100,
        unit: "kg",
        addedAt: new Date().toISOString(),
        isTainted: true,
        allergenProfiles: ["PEANUTS"],
      },
    ],
  });

  if (
    taintedBatchRes.success &&
    taintedBatchRes.batch?.qaStatus === "QUARANTINED" &&
    taintedBatchRes.batch?.contaminationExposure.isCompromised
  ) {
    console.log("✓ PASS: Safety guard triggered. Batch using LOT-PNUT-2026-081 automatically locked in QUARANTINED status.");
    passed++;
  } else {
    console.error("✗ FAIL: Safety guard did not quarantine batch.");
    failed++;
  }

  // Test 6: QA Disposition State Transition
  console.log("\n[Test 6] Testing QA Disposition update and electronic signature...");
  const updateRes = BatchService.updateQAStatus(
    "BATCH-2026-1055",
    "PASSED",
    "Lab assay cleared after 48-hour incubation.",
    { signedBy: "Dr. Evelyn Reed", labClearanceRef: "LAB-CLR-CHOCO-1055" }
  );

  if (
    updateRes.success &&
    updateRes.batch?.qaStatus === "PASSED" &&
    updateRes.batch?.qaReleaseSignature?.labClearanceRef === "LAB-CLR-CHOCO-1055"
  ) {
    console.log("✓ PASS: QA status updated to PASSED with electronic signature and lab clearance reference.");
    passed++;
  } else {
    console.error("✗ FAIL: QA disposition update failed.");
    failed++;
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runBatchServiceTests().catch((err) => {
  console.error("Test threw error:", err);
  process.exit(1);
});
