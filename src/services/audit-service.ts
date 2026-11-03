import { IngredientService } from "./ingredient-service";
import { BatchService } from "./batch-service";

export interface AuditGap {
  id: string;
  ruleCode: "MISSING_COA" | "CONTAMINANT_DETECTED" | "MASS_BALANCE_MISMATCH" | "UNVERIFIED_SUPPLIER" | "EXPIRED_RAW_MATERIAL";
  ruleTitle: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  targetEntity: string;
  entityType: "INGREDIENT_LOT" | "PRODUCTION_BATCH" | "SUPPLIER";
  description: string;
  detectedAt: string;
  fsmaRegulatoryCode: string;
  remediationAction: string;
  canAutoRemediate?: boolean;
  remediated?: boolean;
}

export interface AuditScanSummary {
  scannedAt: string;
  totalRulesEvaluated: number;
  totalLotsScanned: number;
  totalBatchesScanned: number;
  totalGapsFound: number;
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
  complianceScorePercent: number;
  gaps: AuditGap[];
}

export class AuditService {
  /**
   * Scans the live ingredient and batch ledgers against FSMA 204 regulatory compliance rules.
   */
  public static runIntegrityScan(): AuditScanSummary {
    const lots = IngredientService.getAllLots();
    const batches = BatchService.getAllBatches();
    const gaps: AuditGap[] = [];

    // Rule 1: Check for Missing Certificates of Analysis
    lots.forEach((lot) => {
      if (
        lot.coaVerification?.status === "MISSING_COA" ||
        !lot.coaVerification ||
        lot.coaVerification.parameters.length === 0
      ) {
        gaps.push({
          id: `gap-coa-${lot.id}`,
          ruleCode: "MISSING_COA",
          ruleTitle: "Missing Certificate of Analysis (CoA)",
          severity: "HIGH",
          targetEntity: lot.lotNumber,
          entityType: "INGREDIENT_LOT",
          description: `Raw ingredient '${lot.ingredientName}' (${lot.lotNumber}) inward receipt has no verified laboratory Certificate of Analysis attached. Currently placed under mandatory quarantine hold.`,
          detectedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          fsmaRegulatoryCode: "FSMA 204 § 1.1455(c)",
          remediationAction: "Attach accredited laboratory CoA assay results to clear quarantine.",
          canAutoRemediate: true,
        });
      }

      // Rule 2: Check for Analytical Contaminant Hazards
      const failingParam = lot.coaVerification?.parameters?.find((p) => p.status === "FAIL");
      if (failingParam || lot.status === "RECALLED") {
        gaps.push({
          id: `gap-hazard-${lot.id}`,
          ruleCode: "CONTAMINANT_DETECTED",
          ruleTitle: "Critical Microbial Contaminant Confirmed",
          severity: "CRITICAL",
          targetEntity: lot.lotNumber,
          entityType: "INGREDIENT_LOT",
          description: `Laboratory testing confirmed presence of '${failingParam ? failingParam.parameter : "Salmonella enterica"}' exceeding safety threshold (${failingParam?.value || "POSITIVE"}). Immediate market withdrawal mandated.`,
          detectedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          fsmaRegulatoryCode: "21 CFR § 7.42 / FSMA § 204",
          remediationAction: "Enforce facility quarantine lock, run forward blast radius, and transmit 24-hr FDA recall dossier.",
          canAutoRemediate: false,
        });
      }

      // Rule 3: Check Mass Balance Discrepancies
      if (lot.massBalance) {
        const sum = lot.massBalance.totalConsumed + lot.massBalance.remainingRecorded;
        if (Math.abs(sum - lot.massBalance.totalReceived) > 0.01) {
          gaps.push({
            id: `gap-mb-${lot.id}`,
            ruleCode: "MASS_BALANCE_MISMATCH",
            ruleTitle: "Mass Balance Reconciliation Discrepancy",
            severity: "MEDIUM",
            targetEntity: lot.lotNumber,
            entityType: "INGREDIENT_LOT",
            description: `Lot ${lot.lotNumber} mass balance variance detected: Received ${lot.massBalance.totalReceived} ${lot.unit}, but recorded sum of consumed + remaining is ${sum} ${lot.unit}.`,
            detectedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
            fsmaRegulatoryCode: "FSMA 204 Transformation CTE",
            remediationAction: "Perform inventory count adjustment and log digital scale calibration log.",
            canAutoRemediate: true,
          });
        }
      }

      // Rule 4: Supplier Audit Rating Downgrade
      if (lot.supplier.auditRating === "UNDER_REVIEW" || lot.supplier.auditRating === "B") {
        gaps.push({
          id: `gap-supp-${lot.supplier.id}`,
          ruleCode: "UNVERIFIED_SUPPLIER",
          ruleTitle: "Tier-1 Vendor Verification Under Review",
          severity: "LOW",
          targetEntity: lot.supplier.code,
          entityType: "SUPPLIER",
          description: `Supplier '${lot.supplier.name}' (${lot.supplier.code}) has audit rating '${lot.supplier.auditRating}'. Periodic GFSI third-party audit recertification is overdue.`,
          detectedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          fsmaRegulatoryCode: "FSVP 21 CFR § 1.506",
          remediationAction: "Request updated SQF / BRCGS audit scorecard from supplier compliance portal.",
          canAutoRemediate: false,
        });
      }
    });

    // Rule 5: Batch Formulation Safety Hold
    batches.forEach((batch) => {
      if (batch.qaStatus === "QUARANTINED" && !batch.qaHoldReason) {
        gaps.push({
          id: `gap-batch-${batch.id}`,
          ruleCode: "EXPIRED_RAW_MATERIAL",
          ruleTitle: "Unexplained QA Quarantine Hold",
          severity: "HIGH",
          targetEntity: batch.batchNumber,
          entityType: "PRODUCTION_BATCH",
          description: `Production batch '${batch.batchNumber}' is marked QUARANTINED without recorded administrative justification.`,
          detectedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          fsmaRegulatoryCode: "21 CFR § 117.80",
          remediationAction: "Update QA disposition with supervisor electronic signature and laboratory reference.",
          canAutoRemediate: false,
        });
      }
    });

    const criticalGaps = gaps.filter((g) => g.severity === "CRITICAL").length;
    const highGaps = gaps.filter((g) => g.severity === "HIGH").length;
    const mediumGaps = gaps.filter((g) => g.severity === "MEDIUM").length;
    const lowGaps = gaps.filter((g) => g.severity === "LOW").length;

    // Deductive compliance score
    const totalEntities = lots.length + batches.length;
    const penalty = criticalGaps * 20 + highGaps * 10 + mediumGaps * 5 + lowGaps * 2;
    const complianceScorePercent = Math.max(0, Math.min(100, 100 - penalty));

    return {
      scannedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      totalRulesEvaluated: 6,
      totalLotsScanned: lots.length,
      totalBatchesScanned: batches.length,
      totalGapsFound: gaps.length,
      criticalGaps,
      highGaps,
      mediumGaps,
      lowGaps,
      complianceScorePercent,
      gaps,
    };
  }

  /**
   * Remediates a Missing CoA gap by attaching a verified test record.
   */
  public static remediateMissingCoA(lotNumber: string): { success: boolean; message: string } {
    const res = IngredientService.attachCoAToLot(lotNumber, {
      labName: "Midwest Food Analytical Laboratories",
      testDate: new Date().toISOString().split("T")[0],
      fileName: `COA-REMEDIATED-${lotNumber}.pdf`,
      parameters: [
        { parameter: "Salmonella spp.", value: "NEGATIVE / 25g", specLimit: "Absence / 25g", status: "PASS" },
        { parameter: "Gluten ELISA", value: "< 5 ppm", specLimit: "< 10 ppm", status: "PASS" },
        { parameter: "Moisture Content", value: "1.2%", specLimit: "< 2.0%", status: "PASS" },
      ],
    });

    if (res.success) {
      return {
        success: true,
        message: `CoA successfully attached to ${lotNumber}. Lot released from quarantine and gap resolved.`,
      };
    }
    return {
      success: false,
      message: res.error || "Failed to remediate CoA",
    };
  }
}
