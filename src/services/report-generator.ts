import { IngredientService } from "./ingredient-service";
import { BatchService } from "./batch-service";
import { RecallService } from "./recall-service";

export interface FSMA204SpreadsheetRow {
  cteType: "RECEIVING" | "TRANSFORMATION" | "SHIPPING";
  traceabilityLotCode: string;
  itemDescription: string;
  sourceEntity: string;
  destinationEntity: string;
  transactionDate: string;
  quantity: number;
  unit: string;
  referenceDocumentType: string;
  referenceDocumentFile: string;
  qaVerificationStatus: string;
  facilityLocation: string;
}

export class ReportGenerator {
  /**
   * Generates the official FDA FSMA 204 Electronic Sortable Spreadsheet dataset
   * linking all Receiving, Transformation, and Shipping Critical Tracking Events.
   */
  public static generateFSMA204Dataset(): FSMA204SpreadsheetRow[] {
    const rows: FSMA204SpreadsheetRow[] = [];
    const lots = IngredientService.getAllLots();
    const batches = BatchService.getAllBatches();

    // 1. Receiving CTEs
    lots.forEach((lot) => {
      rows.push({
        cteType: "RECEIVING",
        traceabilityLotCode: lot.lotNumber,
        itemDescription: lot.ingredientName,
        sourceEntity: `${lot.supplier.name} (${lot.supplier.code})`,
        destinationEntity: "Austin Processing Facility #1 - Inward Receiving Dock",
        transactionDate: lot.receivedDate,
        quantity: lot.initialQuantity,
        unit: lot.unit,
        referenceDocumentType: lot.sourceDocument.documentType,
        referenceDocumentFile: lot.sourceDocument.fileName,
        qaVerificationStatus: lot.coaVerification?.status || "PENDING",
        facilityLocation: lot.supplier.facilityAddress,
      });
    });

    // 2. Transformation CTEs
    batches.forEach((batch) => {
      rows.push({
        cteType: "TRANSFORMATION",
        traceabilityLotCode: batch.batchNumber,
        itemDescription: batch.product.name,
        sourceEntity: batch.billOfMaterials.map((b) => `${b.lotNumber} (${b.actualQuantityUsed} ${b.unit})`).join("; "),
        destinationEntity: `Plant Line: ${batch.facility.lineIdentifier}`,
        transactionDate: batch.productionDate,
        quantity: batch.yieldQuantity,
        unit: batch.unit,
        referenceDocumentType: batch.sourceDocument.documentType,
        referenceDocumentFile: batch.sourceDocument.fileName,
        qaVerificationStatus: batch.qaStatus,
        facilityLocation: batch.facility.name,
      });

      // 3. Shipping CTEs
      batch.downstreamDispatches.forEach((dsp) => {
        rows.push({
          cteType: "SHIPPING",
          traceabilityLotCode: batch.batchNumber,
          itemDescription: batch.product.name,
          sourceEntity: "Austin Processing Facility #1 - Shipping Bay 4",
          destinationEntity: `${dsp.customerName} - ${dsp.destinationDC}`,
          transactionDate: dsp.dispatchDate.split("T")[0],
          quantity: dsp.quantityShipped,
          unit: dsp.unit,
          referenceDocumentType: "DISPATCH_MANIFEST",
          referenceDocumentFile: `BOL-${dsp.dispatchNumber}.pdf`,
          qaVerificationStatus: dsp.status,
          facilityLocation: dsp.destinationDC,
        });
      });
    });

    return rows;
  }

  /**
   * Formats the dataset into raw CSV content suitable for FDA 24-hr electronic submission.
   */
  public static generateCSV(rows: FSMA204SpreadsheetRow[]): string {
    const headers = [
      "CTE_TYPE",
      "TRACEABILITY_LOT_CODE",
      "ITEM_DESCRIPTION",
      "SOURCE_ORIGIN",
      "DESTINATION_ENTITY",
      "TRANSACTION_DATE",
      "QUANTITY",
      "UNIT",
      "REFERENCE_DOC_TYPE",
      "REFERENCE_DOC_FILE",
      "QA_VERIFICATION_STATUS",
      "FACILITY_LOCATION",
    ];

    const csvLines = [headers.join(",")];

    rows.forEach((row) => {
      const line = [
        `"${row.cteType}"`,
        `"${row.traceabilityLotCode}"`,
        `"${row.itemDescription.replace(/"/g, '""')}"`,
        `"${row.sourceEntity.replace(/"/g, '""')}"`,
        `"${row.destinationEntity.replace(/"/g, '""')}"`,
        `"${row.transactionDate}"`,
        row.quantity,
        `"${row.unit}"`,
        `"${row.referenceDocumentType}"`,
        `"${row.referenceDocumentFile}"`,
        `"${row.qaVerificationStatus}"`,
        `"${row.facilityLocation.replace(/"/g, '""')}"`,
      ];
      csvLines.push(line.join(","));
    });

    return csvLines.join("\n");
  }
}
