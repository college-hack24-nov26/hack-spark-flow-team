import { GraphEngine } from "../graph-engine";

console.log("==================================================");
console.log("MODULE 5: TRACEABILITY GRAPH ENGINE VERIFICATION");
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

// Test 1: Forward Blast-Radius Graph from Contaminated Peanut Paste LOT-PNUT-2026-081
console.log("\n[Test 1] Testing Forward Trace Graph from LOT-PNUT-2026-081...");
const fwdGraph = GraphEngine.buildForwardGraph("lot-pnut-081", "LR");

assert(fwdGraph.nodes.length >= 6, `Generated ${fwdGraph.nodes.length} nodes (Expected >= 6).`);
assert(fwdGraph.edges.length >= 5, `Generated ${fwdGraph.edges.length} edges (Expected >= 5).`);
assert(fwdGraph.summary.compromisedBatchesCount === 2, `Compromised batches count: ${fwdGraph.summary.compromisedBatchesCount} (Expected 2).`);
assert(fwdGraph.summary.totalFinishedUnitsImpacted === 14200, `Impacted units: ${fwdGraph.summary.totalFinishedUnitsImpacted} (Expected 14,200).`);
assert(fwdGraph.summary.affectedCustomersCount >= 2, `Affected customer DCs: ${fwdGraph.summary.affectedCustomersCount} (Expected >= 2).`);
assert(fwdGraph.summary.severityClass === "CLASS_I", `Severity class: ${fwdGraph.summary.severityClass} (Expected CLASS_I).`);

// Test 2: Check Dagre Layout coordinates
console.log("\n[Test 2] Checking Dagre positioning coordinates...");
const hasPositions = fwdGraph.nodes.every(
  (n) => typeof n.position.x === "number" && typeof n.position.y === "number" && !isNaN(n.position.x)
);
assert(hasPositions, "All nodes have valid finite (x, y) coordinates assigned by Dagre.");

// Test 3: Backward Root-Cause Graph from Compromised Batch BATCH-2026-1049
console.log("\n[Test 3] Testing Backward Trace Graph from BATCH-2026-1049...");
const bwdGraph = GraphEngine.buildBackwardGraph("batch-1049", "LR");

assert(bwdGraph.nodes.length >= 4, `Backward graph nodes: ${bwdGraph.nodes.length} (Expected >= 4).`);
assert(Boolean(bwdGraph.summary.rootCauseFindings && bwdGraph.summary.rootCauseFindings.length > 0), "Root cause findings identified tainted ingredient.");
assert(bwdGraph.summary.rootCauseFindings![0].includes("Roasted Peanut Paste"), `Identified culprit ingredient: ${bwdGraph.summary.rootCauseFindings![0]}`);

// Test 4: Full Ecosystem Graph
console.log("\n[Test 4] Testing Full Ecosystem Graph...");
const fullGraph = GraphEngine.buildFullGraph("LR");
assert(fullGraph.nodes.length >= 10, `Full graph nodes: ${fullGraph.nodes.length} (Expected >= 10).`);
assert(fullGraph.edges.length >= 10, `Full graph edges: ${fullGraph.edges.length} (Expected >= 10).`);

console.log("\n==================================================");
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
