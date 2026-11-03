import { IngredientService } from "./ingredient-service";
import { BatchService } from "./batch-service";

export interface ImpactedCustomerConsignment {
  customerId: string;
  customerName: string;
  destinationDC: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  dispatchNumber: string;
  dispatchDate: string;
  carrier: string;
  trackingNumber: string;
  batchNumber: string;
  productName: string;
  sku: string;
  quantityShipped: number;
  unit: string;
  noticeStatus: "PENDING_NOTICE" | "NOTICE_SENT" | "ACKNOWLEDGED_QUARANTINED";
  noticeSentAt?: string;
  acknowledgedAt?: string;
}

export interface RecallBlastRadiusAnalysis {
  incidentId: string;
  title: string;
  severityClass: "CLASS_I" | "CLASS_II" | "CLASS_III";
  rootCause: {
    ingredientLotNumber: string;
    ingredientName: string;
    supplierName: string;
    supplierCode: string;
    contaminant: string;
    labAssayRef: string;
    receivedDate: string;
    initialQuantity: number;
    remainingWarehouseQuantity: number;
    unit: string;
  };
  impactSummary: {
    totalCompromisedBatches: number;
    compromisedBatchNumbers: string[];
    totalFinishedUnitsProduced: number;
    totalUnitsInCommerce: number;
    totalUnitsWarehouseHeld: number;
    totalDistributorsImpacted: number;
    marketContainmentPercent: number;
    isWarehouseLocked: boolean;
  };
  affectedProducts: Array<{
    batchId: string;
    batchNumber: string;
    productName: string;
    sku: string;
    upcBarcode: string;
    productionDate: string;
    expiryDate: string;
    yieldQuantity: number;
    dispatchedQuantity: number;
    warehouseQuarantineQuantity: number;
    unit: string;
    qaStatus: string;
  }>;
  customerConsignments: ImpactedCustomerConsignment[];
  regulatoryMetadata: {
    fdaEstablishmentIdentifier: string;
    facilityRegistrationNumber: string;
    incidentCommander: string;
    regulatoryLead: string;
    declaredAt: string;
    deadline24h: string;
  };
}

// In-memory simulation state for notification acknowledgments and warehouse locks
let warehouseLocked = false;
let consignmentsState: Map<string, "PENDING_NOTICE" | "NOTICE_SENT" | "ACKNOWLEDGED_QUARANTINED"> = new Map();

export class RecallService {
  /**
   * Deterministically calculates the recall blast radius for a given root ingredient lot.
   */
  public static calculateBlastRadius(lotNumber: string = "LOT-PNUT-2026-081"): RecallBlastRadiusAnalysis {
    const lot =
      IngredientService.getLotByNumber(lotNumber) ||
      IngredientService.getLotById("lot-pnut-081") ||
      IngredientService.getAllLots()[0];

    const batches = BatchService.getAllBatches();
    const affectedBatches = batches.filter((b) =>
      b.billOfMaterials.some(
        (bom) => bom.lotNumber === lot.lotNumber || bom.ingredientLotId === lot.id
      )
    );

    let totalFinishedUnits = 0;
    let totalInCommerce = 0;
    let totalWarehouseHeld = 0;
    const consignments: ImpactedCustomerConsignment[] = [];
    const customerNames = new Set<string>();

    // Ground-truth customer contact mapping for verified distributors
    const customerDirectory: Record<string, { contact: string; email: string; phone: string }> = {
      "National Supermarkets Central DC": {
        contact: "David Chen, VP Quality & Safety",
        email: "dchen@nationalsupermarkets.com",
        phone: "+1 (214) 555-0199",
      },
      "Western Grocers Regional Depot": {
        contact: "Maria Rodriguez, DC Operations Manager",
        email: "m.rodriguez@westerngrocers.com",
        phone: "+1 (303) 555-4812",
      },
      "Lone Star Food Distributors": {
        contact: "Travis Sterling, Supply Chain Director",
        email: "compliance@lonestarfood.com",
        phone: "+1 (512) 555-9031",
      },
      "Fresh Market Organics DC": {
        contact: "Sarah Jenkins, Inward QA Lead",
        email: "qa@freshmarketorganics.com",
        phone: "+1 (713) 555-3211",
      },
      "Pacific Coast Natural Grocers": {
        contact: "Kenji Sato, Food Safety Officer",
        email: "ksato@pacificnatural.com",
        phone: "+1 (415) 555-7764",
      },
    };

    affectedBatches.forEach((batch) => {
      totalFinishedUnits += batch.yieldQuantity;
      totalInCommerce += batch.marketStatus.dispatchedQuantity;
      totalWarehouseHeld += batch.marketStatus.warehouseQuarantineQuantity;

      batch.downstreamDispatches.forEach((dsp) => {
        customerNames.add(dsp.customerName);
        const customerInfo = customerDirectory[dsp.customerName] || {
          contact: "Distribution Quality Lead",
          email: "safety@distributor.org",
          phone: "+1 (800) 555-0100",
        };

        const currentStatus =
          consignmentsState.get(dsp.dispatchId) ||
          (dsp.status === "FLAGGED_RECALL" ? "NOTICE_SENT" : "PENDING_NOTICE");

        consignments.push({
          customerId: `cust-${dsp.customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          customerName: dsp.customerName,
          destinationDC: dsp.destinationDC,
          contactPerson: customerInfo.contact,
          contactEmail: customerInfo.email,
          phone: customerInfo.phone,
          dispatchNumber: dsp.dispatchNumber,
          dispatchDate: dsp.dispatchDate,
          carrier: dsp.carrier,
          trackingNumber: `TRK-COLD-${dsp.dispatchNumber.replace(/[^0-9]/g, "")}`,
          batchNumber: batch.batchNumber,
          productName: batch.product.name,
          sku: batch.product.sku,
          quantityShipped: dsp.quantityShipped,
          unit: dsp.unit,
          noticeStatus: currentStatus,
          noticeSentAt: currentStatus !== "PENDING_NOTICE" ? "2026-10-18T14:30:00Z" : undefined,
          acknowledgedAt: currentStatus === "ACKNOWLEDGED_QUARANTINED" ? "2026-10-18T16:45:00Z" : undefined,
        });
      });
    });

    const isClassI = lot.status === "RECALLED" || lot.isRecallTrigger;
    const severityClass: "CLASS_I" | "CLASS_II" | "CLASS_III" = isClassI
      ? "CLASS_I"
      : lot.status === "QUARANTINE"
      ? "CLASS_II"
      : "CLASS_III";

    const acknowledgedCount = consignments.filter(
      (c) => c.noticeStatus === "ACKNOWLEDGED_QUARANTINED"
    ).length;
    const containmentPercent =
      consignments.length > 0
        ? Math.round((acknowledgedCount / consignments.length) * 100)
        : 100;

    return {
      incidentId: "RCL-2026-004",
      title: `${severityClass} Mandatory Recall: ${lot.ingredientName}`,
      severityClass,
      rootCause: {
        ingredientLotNumber: lot.lotNumber,
        ingredientName: lot.ingredientName,
        supplierName: lot.supplier.name,
        supplierCode: lot.supplier.code,
        contaminant:
          lot.coaVerification?.parameters?.find((p) => p.status === "FAIL")?.parameter ||
          "Salmonella enterica serotype Typhimurium",
        labAssayRef: "Midwest Food Analytical Laboratories #MW-2026-992",
        receivedDate: lot.receivedDate,
        initialQuantity: lot.initialQuantity,
        remainingWarehouseQuantity: lot.remainingQuantity,
        unit: lot.unit,
      },
      impactSummary: {
        totalCompromisedBatches: affectedBatches.length,
        compromisedBatchNumbers: affectedBatches.map((b) => b.batchNumber),
        totalFinishedUnitsProduced: totalFinishedUnits,
        totalUnitsInCommerce: totalInCommerce,
        totalUnitsWarehouseHeld: totalWarehouseHeld,
        totalDistributorsImpacted: customerNames.size,
        marketContainmentPercent: containmentPercent,
        isWarehouseLocked: warehouseLocked,
      },
      affectedProducts: affectedBatches.map((b) => ({
        batchId: b.id,
        batchNumber: b.batchNumber,
        productName: b.product.name,
        sku: b.product.sku,
        upcBarcode: b.product.upcBarcode,
        productionDate: b.productionDate,
        expiryDate: b.expiryDate,
        yieldQuantity: b.yieldQuantity,
        dispatchedQuantity: b.marketStatus.dispatchedQuantity,
        warehouseQuarantineQuantity: b.marketStatus.warehouseQuarantineQuantity,
        unit: b.unit,
        qaStatus: b.qaStatus,
      })),
      customerConsignments: consignments,
      regulatoryMetadata: {
        fdaEstablishmentIdentifier: "FEI-301984210",
        facilityRegistrationNumber: "FDA-REG-192847101",
        incidentCommander: "Dr. Evelyn Reed, VP Quality Assurance",
        regulatoryLead: "Marcus Vance, Compliance Officer",
        declaredAt: "2026-10-18T08:15:00Z",
        deadline24h: "2026-10-19T08:15:00Z",
      },
    };
  }

  /**
   * Enforces immediate physical & ERP quarantine lock on all warehouse inventory.
   */
  public static lockWarehouseInventory(): { success: boolean; message: string; timestamp: string } {
    warehouseLocked = true;
    const now = new Date().toISOString();

    // Lock the root lot
    IngredientService.updateLotStatus(
      "LOT-PNUT-2026-081",
      "RECALLED",
      `Mandatory Class I recall lock executed by Dr. Evelyn Reed at ${now}.`
    );

    // Lock all batches using this lot
    BatchService.updateQAStatus(
      "BATCH-2026-1049",
      "RECALLED",
      `Class I recall quarantine lock. Signoff clearance: REF-RCL-004-LOCK.`
    );
    BatchService.updateQAStatus(
      "BATCH-2026-1052",
      "RECALLED",
      `Class I recall quarantine lock. Signoff clearance: REF-RCL-004-LOCK.`
    );

    return {
      success: true,
      message: "Warehouse quarantine lock activated. All affected lots and batches locked from shipping.",
      timestamp: now,
    };
  }

  /**
   * Dispatches urgent electronic recall notices to all affected customer distribution centers.
   */
  public static dispatchDistributorNotices(): {
    success: boolean;
    noticesCount: number;
    notifiedCustomers: string[];
    timestamp: string;
  } {
    const analysis = this.calculateBlastRadius("LOT-PNUT-2026-081");
    const notified: string[] = [];
    const now = new Date().toISOString();

    analysis.customerConsignments.forEach((consignment) => {
      consignmentsState.set(consignment.dispatchNumber, "NOTICE_SENT");
      notified.push(`${consignment.customerName} (${consignment.dispatchNumber})`);
    });

    return {
      success: true,
      noticesCount: notified.length,
      notifiedCustomers: notified,
      timestamp: now,
    };
  }

  /**
   * Simulates customer acknowledgment and distributor quarantine verification.
   */
  public static acknowledgeCustomerQuarantine(dispatchNumber: string): boolean {
    consignmentsState.set(dispatchNumber, "ACKNOWLEDGED_QUARANTINED");
    return true;
  }
}
