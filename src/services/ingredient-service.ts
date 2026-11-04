import {
  IngredientLot,
  LotStatus,
  IngredientFilterParams,
  MassBalanceCalculation,
} from "@/types/ingredient";

// Initial ground-truth database seed for TraceX Ai
const initialLots: IngredientLot[] = [
  {
    id: "lot-pnut-081",
    lotNumber: "LOT-PNUT-2026-081",
    ingredientName: "Roasted Peanut Paste",
    category: "Nuts & Nut Pastes",
    supplier: {
      id: "supp-gvo",
      name: "Golden Valley Organics",
      code: "GVO-99",
      contactEmail: "safety@goldenvalleyorganics.com",
      country: "United States (Georgia)",
      facilityAddress: "1840 Cropway Rd, Albany, GA 31705",
      auditRating: "B",
    },
    sourceDocument: {
      id: "doc-gvo-081",
      fileName: "sample_coa_peanut_paste.csv",
      documentType: "CERTIFICATE_OF_ANALYSIS",
      verifiedAt: "2026-10-12T10:14:00Z",
    },
    receivedDate: "2026-10-12",
    expiryDate: "2027-04-12",
    initialQuantity: 5000,
    remainingQuantity: 1250,
    quarantinedQuantity: 1250,
    unit: "kg",
    status: "RECALLED",
    quarantineReason: "Contaminated lot: Confirmed presence of Salmonella enterica serotype Typhimurium.",
    allergenProfiles: ["PEANUTS"],
    storageConditions: "Store in ambient climate-controlled warehouse (15-20°C, <60% RH).",
    coaVerification: {
      status: "FLAGGED_FAIL",
      labName: "Midwest Food Analytical Laboratories",
      testDate: "2026-10-12",
      parameters: [
        { parameter: "Salmonella enterica", value: "POSITIVE", specLimit: "Absence / 25g", status: "FAIL" },
        { parameter: "Aflatoxin B1", value: "1.2 ppb", specLimit: "< 2.0 ppb", status: "PASS" },
        { parameter: "Total Aflatoxins (B1+B2+G1+G2)", value: "2.8 ppb", specLimit: "< 4.0 ppb", status: "PASS" },
        { parameter: "Moisture Content", value: "1.8%", specLimit: "< 2.5%", status: "PASS" },
        { parameter: "Aerobic Plate Count", value: "1,200 CFU/g", specLimit: "< 10,000 CFU/g", status: "PASS" },
      ],
    },
    consumptionHistory: [
      {
        batchId: "batch-1049",
        batchNumber: "BATCH-2026-1049",
        productName: "Crunchy Peanut Butter 400g",
        sku: "SKU-PB-CRUNCH-400G",
        quantityUsed: 2500,
        unit: "kg",
        usedAt: "2026-10-16T08:30:00Z",
        lineIdentifier: "Packaging Line 3",
      },
      {
        batchId: "batch-1052",
        batchNumber: "BATCH-2026-1052",
        productName: "Creamy Peanut Spread 500g",
        sku: "SKU-PB-CREAMY-500G",
        quantityUsed: 1250,
        unit: "kg",
        usedAt: "2026-10-17T09:15:00Z",
        lineIdentifier: "Packaging Line 3",
      },
    ],
    massBalance: {
      totalReceived: 5000,
      totalConsumed: 3750,
      remainingRecorded: 1250,
      variance: 0,
      isBalanced: true,
    },
    isRecallTrigger: true,
  },
  {
    id: "lot-almd-033",
    lotNumber: "LOT-ALMD-2026-033",
    ingredientName: "California Almond Paste",
    category: "Nuts & Nut Pastes",
    supplier: {
      id: "supp-png",
      name: "Pacific Nut Growers Co.",
      code: "PNG-12",
      contactEmail: "qa@pacificnutgrowers.com",
      country: "United States (California)",
      facilityAddress: "920 Orchard Ave, Modesto, CA 95351",
      auditRating: "A+",
    },
    sourceDocument: {
      id: "doc-png-033",
      fileName: "COA-PNG-ALMD-033.pdf",
      documentType: "CERTIFICATE_OF_ANALYSIS",
      verifiedAt: "2026-10-08T14:22:00Z",
    },
    receivedDate: "2026-10-08",
    expiryDate: "2027-03-30",
    initialQuantity: 4000,
    remainingQuantity: 2200,
    quarantinedQuantity: 0,
    unit: "kg",
    status: "RELEASED",
    allergenProfiles: ["TREE_NUTS"],
    storageConditions: "Store refrigerated at 2-6°C.",
    coaVerification: {
      status: "VERIFIED",
      labName: "Pacific BioAssay Laboratory",
      testDate: "2026-10-08",
      parameters: [
        { parameter: "Salmonella", value: "NEGATIVE", specLimit: "Absence / 25g", status: "PASS" },
        { parameter: "Aflatoxin Total", value: "0.8 ppb", specLimit: "< 4.0 ppb", status: "PASS" },
        { parameter: "Peroxide Value", value: "1.1 meq/kg", specLimit: "< 3.0 meq/kg", status: "PASS" },
        { parameter: "Moisture", value: "2.1%", specLimit: "< 3.0%", status: "PASS" },
      ],
    },
    consumptionHistory: [
      {
        batchId: "batch-1044",
        batchNumber: "BATCH-2026-1044",
        productName: "Organic Almond Butter 350g",
        sku: "SKU-ALMD-BUTTER-350G",
        quantityUsed: 1800,
        unit: "kg",
        usedAt: "2026-10-14T11:00:00Z",
        lineIdentifier: "Packaging Line 2",
      },
    ],
    massBalance: {
      totalReceived: 4000,
      totalConsumed: 1800,
      remainingRecorded: 2200,
      variance: 0,
      isBalanced: true,
    },
    isRecallTrigger: false,
  },
  {
    id: "lot-oat-019",
    lotNumber: "LOT-OAT-2026-019",
    ingredientName: "Gluten-Free Rolled Oats",
    category: "Grains & Cereals",
    supplier: {
      id: "supp-pml",
      name: "Prairie Mills Ltd.",
      code: "PML-44",
      contactEmail: "orders@prairiemills.ca",
      country: "Canada (Saskatchewan)",
      facilityAddress: "500 Grain Terminal Way, Regina, SK",
      auditRating: "A",
    },
    sourceDocument: {
      id: "doc-pml-019",
      fileName: "INV-PML-2026-9912.pdf",
      documentType: "SUPPLIER_INVOICE",
      verifiedAt: "2026-10-05T09:18:00Z",
    },
    receivedDate: "2026-10-05",
    expiryDate: "2027-10-05",
    initialQuantity: 10000,
    remainingQuantity: 3900,
    quarantinedQuantity: 0,
    unit: "kg",
    status: "RELEASED",
    allergenProfiles: ["NONE"],
    storageConditions: "Dry storage (<22°C, <55% RH).",
    coaVerification: {
      status: "VERIFIED",
      labName: "Saskatchewan Grain Quality Center",
      testDate: "2026-10-04",
      parameters: [
        { parameter: "Gluten ELISA Assay", value: "< 5 ppm", specLimit: "< 10 ppm (GF Standard)", status: "PASS" },
        { parameter: "Ochratoxin A", value: "0.4 ppb", specLimit: "< 3.0 ppb", status: "PASS" },
        { parameter: "Foreign Material", value: "0.00%", specLimit: "< 0.05%", status: "PASS" },
      ],
    },
    consumptionHistory: [
      {
        batchId: "batch-1038",
        batchNumber: "BATCH-2026-1038",
        productName: "Rolled Oats Quick Cook 1kg",
        sku: "SKU-OAT-QUICK-1KG",
        quantityUsed: 6100,
        unit: "kg",
        usedAt: "2026-10-11T07:45:00Z",
        lineIdentifier: "Packaging Line 1",
      },
    ],
    massBalance: {
      totalReceived: 10000,
      totalConsumed: 6100,
      remainingRecorded: 3900,
      variance: 0,
      isBalanced: true,
    },
    isRecallTrigger: false,
    farmerOrigin: {
      farmerId: "FARM-005",
      farmerName: "Suresh Kumar",
      farmLocation: "Karnal District, Haryana, India",
      cropType: "Milling Wheat & Oats",
      harvestDate: "2026-09-30",
      inboundLotId: "LOT-105",
      accreditation: "GAP_CERTIFIED",
      merchantHub: "Gharaunda Aggregation Terminal",
    },
  },
  {
    id: "lot-oat-9102",
    lotNumber: "LOT-OAT-9102",
    ingredientName: "Organic Steel-Cut Oats",
    category: "Grains & Cereals",
    supplier: {
      id: "supp-hgp",
      name: "Heartland Grain Partners",
      code: "HGP-08",
      contactEmail: "inward@heartlandgrain.com",
      country: "United States (Iowa)",
      facilityAddress: "320 Silo Dr, Des Moines, IA 50317",
      auditRating: "UNDER_REVIEW",
    },
    farmerOrigin: {
      farmerId: "FARM-004",
      farmerName: "Kulvinder Sandhu",
      farmLocation: "Moga District, Punjab, India",
      cropType: "Wheat & Oats",
      harvestDate: "2026-10-04",
      inboundLotId: "LOT-104",
      riskRating: "AMBER",
    },
    sourceDocument: {
      id: "doc-hgp-9102",
      fileName: "BOL-HGP-9102.pdf",
      documentType: "BILL_OF_LADING",
      verifiedAt: "2026-10-20T16:00:00Z",
    },
    receivedDate: "2026-10-20",
    expiryDate: "2027-10-20",
    initialQuantity: 3500,
    remainingQuantity: 3500,
    quarantinedQuantity: 3500,
    unit: "kg",
    status: "QUARANTINE",
    quarantineReason: "Missing Certificate of Analysis (CoA). Mandatory compliance hold per FSMA 204 QA guidelines.",
    allergenProfiles: ["NONE"],
    storageConditions: "Dry storage (<22°C, <55% RH).",
    coaVerification: {
      status: "MISSING_COA",
      parameters: [],
    },
    consumptionHistory: [],
    massBalance: {
      totalReceived: 3500,
      totalConsumed: 0,
      remainingRecorded: 3500,
      variance: 0,
      isBalanced: true,
    },
    isRecallTrigger: false,
  },
  {
    id: "lot-sugr-112",
    lotNumber: "LOT-SUGR-2026-112",
    ingredientName: "Cane Sugar Granules",
    category: "Sweeteners",
    supplier: {
      id: "supp-gcr",
      name: "Gulf Coast Refineries",
      code: "GCR-02",
      contactEmail: "sales@gulfcoastrefineries.com",
      country: "United States (Louisiana)",
      facilityAddress: "770 River Rd, New Orleans, LA 70118",
      auditRating: "A",
    },
    sourceDocument: {
      id: "doc-gcr-112",
      fileName: "COA-GCR-SUGR-112.pdf",
      documentType: "CERTIFICATE_OF_ANALYSIS",
      verifiedAt: "2026-09-28T11:15:00Z",
    },
    receivedDate: "2026-09-28",
    expiryDate: "2028-09-28",
    initialQuantity: 12000,
    remainingQuantity: 4500,
    quarantinedQuantity: 0,
    unit: "kg",
    status: "RELEASED",
    allergenProfiles: ["NONE"],
    storageConditions: "Climate-controlled dry silo (<25°C, <50% RH).",
    coaVerification: {
      status: "VERIFIED",
      labName: "Southern States Agricultural Testing",
      testDate: "2026-09-27",
      parameters: [
        { parameter: "Polarization (Purity)", value: "99.8° Z", specLimit: "> 99.5° Z", status: "PASS" },
        { parameter: "Invert Sugar", value: "0.04%", specLimit: "< 0.10%", status: "PASS" },
        { parameter: "Color (ICUMSA)", value: "45 IU", specLimit: "< 60 IU", status: "PASS" },
      ],
    },
    consumptionHistory: [
      {
        batchId: "batch-1049",
        batchNumber: "BATCH-2026-1049",
        productName: "Crunchy Peanut Butter 400g",
        sku: "SKU-PB-CRUNCH-400G",
        quantityUsed: 300,
        unit: "kg",
        usedAt: "2026-10-16T08:30:00Z",
        lineIdentifier: "Packaging Line 3",
      },
      {
        batchId: "batch-1052",
        batchNumber: "BATCH-2026-1052",
        productName: "Creamy Peanut Spread 500g",
        sku: "SKU-PB-CREAMY-500G",
        quantityUsed: 250,
        unit: "kg",
        usedAt: "2026-10-17T09:15:00Z",
        lineIdentifier: "Packaging Line 3",
      },
    ],
    massBalance: {
      totalReceived: 12000,
      totalConsumed: 550,
      remainingRecorded: 11450,
      variance: 0,
      isBalanced: true,
    },
    isRecallTrigger: false,
  },
  {
    id: "lot-cocoa-045",
    lotNumber: "LOT-COCOA-2026-045",
    ingredientName: "Organic Dutch Cocoa Powder",
    category: "Flavorings",
    supplier: {
      id: "supp-ao",
      name: "Andean Organics S.A.",
      code: "AO-77",
      contactEmail: "exports@andeanorganics.pe",
      country: "Peru (Cusco)",
      facilityAddress: "Av. Sol 1240, Cusco, Peru",
      auditRating: "A",
    },
    sourceDocument: {
      id: "doc-ao-045",
      fileName: "COA-AO-COCOA-045.pdf",
      documentType: "CERTIFICATE_OF_ANALYSIS",
      verifiedAt: "2026-10-02T13:40:00Z",
    },
    receivedDate: "2026-10-02",
    expiryDate: "2028-10-02",
    initialQuantity: 2500,
    remainingQuantity: 1800,
    quarantinedQuantity: 0,
    unit: "kg",
    status: "RELEASED",
    allergenProfiles: ["NONE"],
    storageConditions: "Cool dry warehouse (<18°C, <50% RH).",
    coaVerification: {
      status: "VERIFIED",
      labName: "Eurofins Food Safety Peru",
      testDate: "2026-09-30",
      parameters: [
        { parameter: "Cadmium", value: "0.28 mg/kg", specLimit: "< 0.60 mg/kg", status: "PASS" },
        { parameter: "Fat Content", value: "11.4%", specLimit: "10-12%", status: "PASS" },
        { parameter: "pH Level", value: "7.1", specLimit: "6.8 - 7.4", status: "PASS" },
      ],
    },
    consumptionHistory: [],
    massBalance: {
      totalReceived: 2500,
      totalConsumed: 0,
      remainingRecorded: 2500,
      variance: 0,
      isBalanced: true,
    },
    isRecallTrigger: false,
  },
];

// In-memory active database repository
let lotsLedger: IngredientLot[] = [...initialLots];

export class IngredientService {
  /**
   * Retrieves all lots with optional filtering
   */
  static getAllLots(filters?: IngredientFilterParams): IngredientLot[] {
    let result = [...lotsLedger];

    if (!filters) return result;

    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        (lot) =>
          lot.lotNumber.toLowerCase().includes(term) ||
          lot.ingredientName.toLowerCase().includes(term) ||
          lot.supplier.name.toLowerCase().includes(term) ||
          lot.supplier.code.toLowerCase().includes(term)
      );
    }

    if (filters.status && filters.status !== "ALL") {
      result = result.filter((lot) => lot.status === filters.status);
    }

    if (filters.allergen && filters.allergen !== "ALL") {
      result = result.filter((lot) => lot.allergenProfiles.includes(filters.allergen!));
    }

    if (filters.coaStatus && filters.coaStatus !== "ALL") {
      result = result.filter((lot) => lot.coaVerification.status === filters.coaStatus);
    }

    return result;
  }

  /**
   * Look up an individual lot by exact lotNumber
   */
  static getLotByNumber(lotNumber: string): IngredientLot | null {
    const lot = lotsLedger.find((l) => l.lotNumber.toLowerCase() === lotNumber.toLowerCase());
    return lot || null;
  }

  /**
   * Look up an individual lot by id or lotNumber
   */
  static getLotById(idOrNumber: string): IngredientLot | null {
    const term = idOrNumber.toLowerCase();
    const lot = lotsLedger.find(
      (l) => l.id.toLowerCase() === term || l.lotNumber.toLowerCase() === term
    );
    return lot || null;
  }

  /**
   * Updates disposition / status (QUARANTINE, RELEASED, RECALLED) with audit justification
   */
  static updateLotStatus(
    lotNumber: string,
    status: LotStatus,
    reason?: string
  ): { success: boolean; lot?: IngredientLot; error?: string } {
    const lotIndex = lotsLedger.findIndex(
      (l) => l.lotNumber.toLowerCase() === lotNumber.toLowerCase()
    );

    if (lotIndex === -1) {
      return { success: false, error: `Ingredient Lot '${lotNumber}' not found.` };
    }

    const currentLot = lotsLedger[lotIndex];
    const isQuarantined = status === "QUARANTINE" || status === "RECALLED";

    const updatedLot: IngredientLot = {
      ...currentLot,
      status,
      quarantinedQuantity: isQuarantined ? currentLot.remainingQuantity : 0,
      quarantineReason: reason || (isQuarantined ? "Manual QA administrative hold." : undefined),
    };

    lotsLedger[lotIndex] = updatedLot;
    return { success: true, lot: updatedLot };
  }

  /**
   * Attaches a verified CoA to an existing lot (clears MISSING_COA gap)
   */
  static attachCoAToLot(
    lotNumber: string,
    coaData: {
      labName: string;
      testDate: string;
      parameters: any[];
      fileName: string;
    }
  ): { success: boolean; lot?: IngredientLot; error?: string } {
    const lotIndex = lotsLedger.findIndex(
      (l) => l.lotNumber.toLowerCase() === lotNumber.toLowerCase()
    );

    if (lotIndex === -1) {
      return { success: false, error: `Ingredient Lot '${lotNumber}' not found.` };
    }

    const currentLot = lotsLedger[lotIndex];
    const hasFails = coaData.parameters.some((p) => p.status === "FAIL");

    const updatedLot: IngredientLot = {
      ...currentLot,
      status: hasFails ? "RECALLED" : "RELEASED",
      quarantinedQuantity: hasFails ? currentLot.remainingQuantity : 0,
      quarantineReason: hasFails ? "Laboratory assay detected out-of-spec contaminant." : undefined,
      sourceDocument: {
        id: `doc-${Date.now().toString(36)}`,
        fileName: coaData.fileName,
        documentType: "CERTIFICATE_OF_ANALYSIS",
        verifiedAt: new Date().toISOString(),
      },
      coaVerification: {
        status: hasFails ? "FLAGGED_FAIL" : "VERIFIED",
        labName: coaData.labName,
        testDate: coaData.testDate,
        parameters: coaData.parameters,
      },
    };

    lotsLedger[lotIndex] = updatedLot;
    return { success: true, lot: updatedLot };
  }

  /**
   * Registers a new ingredient lot manually or from document ingestion
   */
  static registerNewLot(newLot: IngredientLot): IngredientLot {
    lotsLedger = [newLot, ...lotsLedger];
    return newLot;
  }
}
