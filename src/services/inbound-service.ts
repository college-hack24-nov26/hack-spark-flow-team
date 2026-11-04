import {
  Farmer,
  InboundLot,
  RiskLevel,
  LotDispositionStatus,
  InboundFilterParams,
  InboundDashboardKPIs,
  RiskFactor,
} from "@/types/inbound";
import { IngredientService } from "./ingredient-service";
import { IngredientLot } from "@/types/ingredient";

// Initial Farmer Registry Seed Data (L1 Stage)
const initialFarmers: Farmer[] = [
  {
    id: "farm-001",
    farmerId: "FARM-001",
    name: "Harpreet Singh",
    farmLocation: "Ludhiana District, Punjab, India",
    region: "Northern Plains (Indo-Gangetic Basin)",
    coordinates: "30.9010° N, 75.8573° E",
    cropType: "Durum Wheat",
    harvestDate: "2026-10-01",
    contactPhone: "+91 98765 43210",
    contactEmail: "h.singh@punjabfarms.in",
    farmSizeAcres: 45,
    certificationStatus: "GAP_CERTIFIED",
    totalLotsSupplied: 6,
  },
  {
    id: "farm-002",
    farmerId: "FARM-002",
    name: "Gurdeep Dhillon",
    farmLocation: "Bathinda District, Punjab, India",
    region: "Malwa Agricultural Belt",
    coordinates: "30.2110° N, 74.9455° E",
    cropType: "Durum Wheat",
    harvestDate: "2026-10-02",
    contactPhone: "+91 98123 45678",
    contactEmail: "g.dhillon@malwafarms.in",
    farmSizeAcres: 60,
    certificationStatus: "STANDARD",
    totalLotsSupplied: 4,
  },
  {
    id: "farm-003",
    farmerId: "FARM-003",
    name: "Ramesh Patel",
    farmLocation: "Anand District, Gujarat, India",
    region: "Charotar Agro Region",
    coordinates: "22.5645° N, 72.9289° E",
    cropType: "Basmati Rice",
    harvestDate: "2026-09-28",
    contactPhone: "+91 94250 88912",
    contactEmail: "ramesh.patel@gujaratagri.org",
    farmSizeAcres: 35,
    certificationStatus: "ORGANIC",
    totalLotsSupplied: 8,
  },
  {
    id: "farm-004",
    farmerId: "FARM-004",
    name: "Kulvinder Sandhu",
    farmLocation: "Moga District, Punjab, India",
    region: "Doaba Agro Basin",
    coordinates: "30.8165° N, 75.1717° E",
    cropType: "Durum Wheat",
    harvestDate: "2026-10-04",
    contactPhone: "+91 97790 11234",
    contactEmail: "k.sandhu@sandhufarms.in",
    farmSizeAcres: 50,
    certificationStatus: "UNDER_REVIEW",
    totalLotsSupplied: 2,
  },
  {
    id: "farm-005",
    farmerId: "FARM-005",
    name: "Suresh Kumar",
    farmLocation: "Karnal District, Haryana, India",
    region: "Gharaunda Grain Cluster",
    coordinates: "29.6857° N, 76.9905° E",
    cropType: "Milling Wheat & Oats",
    harvestDate: "2026-09-30",
    contactPhone: "+91 99912 34567",
    contactEmail: "suresh.k@haryanaoilseeds.in",
    farmSizeAcres: 28,
    certificationStatus: "GAP_CERTIFIED",
    totalLotsSupplied: 5,
  },
];

// Initial Inbound Lots Ledger Seed Data (L2 Merchant / Aggregator Stage)
const initialInboundLots: InboundLot[] = [
  {
    id: "inb-lot-101",
    lotId: "LOT-101",
    farmerId: "FARM-001",
    farmerName: "Harpreet Singh",
    farmLocation: "Ludhiana District, Punjab, India",
    ingredient: "Hard Amber Durum Wheat",
    cropType: "Wheat",
    quantity: 18500,
    unit: "kg",
    harvestDate: "2026-10-01",
    receivingDate: "2026-10-08",
    merchantHub: "Central Punjab Grain Silo Hub #2",
    supplierInfo: {
      name: "Punjab Agro Merchants Consortium",
      code: "MCH-PUN-01",
      contact: "Balwinder Singh (+91 98881 22334)",
      facilityAddress: "GT Road Grain Mandi, Khanna, Punjab",
    },
    labReportStatus: "AVAILABLE",
    coaStatus: "VERIFIED",
    labParameters: [
      { parameter: "Moisture Content", value: "11.8%", specLimit: "< 13.0%", status: "PASS" },
      { parameter: "Total Aflatoxins", value: "< 4 ppb", specLimit: "< 20 ppb", status: "PASS" },
      { parameter: "Chlorpyrifos Pesticide", value: "ND (< 0.01 mg/kg)", specLimit: "< 0.05 mg/kg", status: "PASS" },
      { parameter: "Foreign Organic Matter", value: "0.12%", specLimit: "< 0.50%", status: "PASS" },
      { parameter: "Gluten Content", value: "29.4%", specLimit: "> 26.0%", status: "PASS" },
    ],
    riskLevel: "GREEN",
    dispositionStatus: "RELEASED",
    riskExplanation: "Clean analytical assays verified by National Grain Testing Lab. All chemical residues and moisture levels comply with Codex / FSSAI standards. Valid GAP farm certification on file.",
    riskFactors: [],
    evidenceDocument: {
      id: "doc-coa-101",
      fileName: "COA-PUN-WHEAT-LOT-101.pdf",
      fileType: "application/pdf",
      uploadedAt: "2026-10-08T09:30:00Z",
      labName: "National Cereal Quality Testing Center, New Delhi",
      documentRef: "LAB-CERT-2026-10199",
    },
    linkedIngredientLotId: "lot-wht-101",
    isDemoData: true,
  },
  {
    id: "inb-lot-102",
    lotId: "LOT-102",
    farmerId: "FARM-002",
    farmerName: "Gurdeep Dhillon",
    farmLocation: "Bathinda District, Punjab, India",
    ingredient: "Durum Wheat Grain",
    cropType: "Wheat",
    quantity: 14000,
    unit: "kg",
    harvestDate: "2026-10-02",
    receivingDate: "2026-10-09",
    merchantHub: "Malwa Regional Aggregation Terminal",
    supplierInfo: {
      name: "Malwa Grain Aggregators Ltd",
      code: "MCH-MAL-04",
      contact: "Gurpreet Brar (+91 97772 33445)",
      facilityAddress: "Terminal Yard 3, Goniana Rd, Bathinda",
    },
    labReportStatus: "FAILED",
    coaStatus: "FLAGGED_FAIL",
    labParameters: [
      { parameter: "Chlorpyrifos Residue", value: "0.18 mg/kg", specLimit: "< 0.05 mg/kg", status: "FAIL" },
      { parameter: "Moisture Content", value: "12.4%", specLimit: "< 13.0%", status: "PASS" },
      { parameter: "Ochratoxin A", value: "1.2 ppb", specLimit: "< 5.0 ppb", status: "PASS" },
      { parameter: "Heavy Metals (Lead)", value: "< 0.02 mg/kg", specLimit: "< 0.20 mg/kg", status: "PASS" },
    ],
    riskLevel: "RED",
    dispositionStatus: "HOLD",
    riskExplanation: "CRITICAL HAZARD: Prohibited organophosphate pesticide Chlorpyrifos detected at 0.18 mg/kg (360% of MRL limit 0.05 mg/kg). Mandatory quarantine lock enforced at aggregator depot to prevent downstream milling entry.",
    riskFactors: [
      {
        ruleId: "PESTICIDE_RESIDUE_EXCEEDANCE",
        ruleName: "Pesticide Maximum Residue Limit (MRL) Exceedance",
        severity: "CRITICAL",
        description: "Organophosphate insecticide Chlorpyrifos exceeds maximum residue limit.",
        parameterTested: "Chlorpyrifos",
        observedValue: "0.18 mg/kg",
        threshold: "0.05 mg/kg",
      },
    ],
    evidenceDocument: {
      id: "doc-coa-102",
      fileName: "LAB-ASSAY-FAIL-LOT-102.pdf",
      fileType: "application/pdf",
      uploadedAt: "2026-10-09T14:15:00Z",
      labName: "AgriTox Regional Forensic Laboratory, Chandigarh",
      documentRef: "TOX-TEST-2026-8840",
    },
    isDemoData: true,
  },
  {
    id: "inb-lot-103",
    lotId: "LOT-103",
    farmerId: "FARM-003",
    farmerName: "Ramesh Patel",
    farmLocation: "Anand District, Gujarat, India",
    ingredient: "Traditional Basmati Rice Paddy",
    cropType: "Rice",
    quantity: 22000,
    unit: "kg",
    harvestDate: "2026-09-28",
    receivingDate: "2026-10-06",
    merchantHub: "Gujarat Organic Grains Logistics Depot",
    supplierInfo: {
      name: "Gujarat Organic Grains Hub",
      code: "MCH-GUJ-02",
      contact: "Dipak Shah (+91 94260 11223)",
      facilityAddress: "Industrial Estate, GIDC, Anand",
    },
    labReportStatus: "AVAILABLE",
    coaStatus: "VERIFIED",
    labParameters: [
      { parameter: "Tricyclazole Fungicide", value: "ND (< 0.01 mg/kg)", specLimit: "< 0.01 mg/kg", status: "PASS" },
      { parameter: "Moisture Content", value: "12.1%", specLimit: "< 14.0%", status: "PASS" },
      { parameter: "Inorganic Arsenic", value: "0.08 mg/kg", specLimit: "< 0.20 mg/kg", status: "PASS" },
      { parameter: "Paddy Grain Purity", value: "99.1%", specLimit: "> 97.0%", status: "PASS" },
    ],
    riskLevel: "GREEN",
    dispositionStatus: "RELEASED",
    riskExplanation: "Certified Organic compliance verified. Multi-residue pesticide screen negative across 140 tested compounds. Inorganic arsenic and moisture within safe international export bounds.",
    riskFactors: [],
    evidenceDocument: {
      id: "doc-coa-103",
      fileName: "COA-RICE-PATEL-LOT-103.pdf",
      fileType: "application/pdf",
      uploadedAt: "2026-10-06T11:00:00Z",
      labName: "SGS Food Safety Testing Laboratories, Ahmedabad",
      documentRef: "SGS-IND-2026-99312",
    },
    linkedIngredientLotId: "lot-rc-103",
    isDemoData: true,
  },
  {
    id: "inb-lot-104",
    lotId: "LOT-104",
    farmerId: "FARM-004",
    farmerName: "Kulvinder Sandhu",
    farmLocation: "Moga District, Punjab, India",
    ingredient: "Sharbati Wheat Milling Grade",
    cropType: "Wheat",
    quantity: 12500,
    unit: "kg",
    harvestDate: "2026-10-04",
    receivingDate: "2026-10-10",
    merchantHub: "Moga Agri Consolidation Depot",
    supplierInfo: {
      name: "Sandhu Agri Trade Post",
      code: "MCH-SND-09",
      contact: "Amarjit Sandhu (+91 97791 44556)",
      facilityAddress: "Dharamkot Bypass, Moga, Punjab",
    },
    labReportStatus: "PENDING",
    coaStatus: "MISSING",
    labParameters: [],
    riskLevel: "AMBER",
    dispositionStatus: "VERIFICATION_REQUESTED",
    riskExplanation: "MISSING QUALITY CERTIFICATE: Inward lot received without accredited lab Certificate of Analysis (CoA). Supplier audit rating is UNDER_REVIEW. Lot held in quarantine pending laboratory sample testing.",
    riskFactors: [
      {
        ruleId: "MISSING_COA_DOCUMENT",
        ruleName: "Missing Certificate of Analysis (CoA)",
        severity: "WARNING",
        description: "Lot lacks verified laboratory assay proof. Mandatory receiving verification required under FSMA 204.",
      },
      {
        ruleId: "FARMER_CERTIFICATION_UNDER_REVIEW",
        ruleName: "Farm Accreditation Status Under Review",
        severity: "WARNING",
        description: "Farm accreditation certificate expired on 2026-09-30.",
      },
    ],
    isDemoData: true,
  },
  {
    id: "inb-lot-105",
    lotId: "LOT-105",
    farmerId: "FARM-005",
    farmerName: "Suresh Kumar",
    farmLocation: "Karnal District, Haryana, India",
    ingredient: "Rolled Oat Kernels",
    cropType: "Oats",
    quantity: 16000,
    unit: "kg",
    harvestDate: "2026-09-30",
    receivingDate: "2026-10-07",
    merchantHub: "Gharaunda Aggregation Terminal",
    supplierInfo: {
      name: "Haryana Grain Logistics Center",
      code: "MCH-HAR-07",
      contact: "Vikas Verma (+91 99920 66778)",
      facilityAddress: "NH-44 Corridor, Karnal",
    },
    labReportStatus: "AVAILABLE",
    coaStatus: "VERIFIED",
    labParameters: [
      { parameter: "Gluten ELISA Assay", value: "< 5 ppm", specLimit: "< 10 ppm (GF Standard)", status: "PASS" },
      { parameter: "Ochratoxin A", value: "0.8 ppb", specLimit: "< 3.0 ppb", status: "PASS" },
      { parameter: "Moisture Content", value: "11.2%", specLimit: "< 12.5%", status: "PASS" },
    ],
    riskLevel: "GREEN",
    dispositionStatus: "RELEASED",
    riskExplanation: "Gluten-free oats verified. All mycotoxin and moisture assays conform to food-grade manufacturing standards.",
    riskFactors: [],
    evidenceDocument: {
      id: "doc-coa-105",
      fileName: "COA-HAR-OATS-LOT-105.pdf",
      fileType: "application/pdf",
      uploadedAt: "2026-10-07T16:20:00Z",
      labName: "Northern Regional Analytical Lab, Gurugram",
      documentRef: "NRAL-2026-44021",
    },
    linkedIngredientLotId: "lot-oat-9102",
    isDemoData: true,
  },
];

let farmersLedger: Farmer[] = [...initialFarmers];
let inboundLotsLedger: InboundLot[] = [...initialInboundLots];

export class InboundService {
  /**
   * Evaluates an inbound agricultural lot using deterministic rules.
   * Explainable risk classification: GREEN, AMBER, RED.
   */
  public static screenInboundLot(
    lotData: Partial<InboundLot>
  ): { riskLevel: RiskLevel; riskExplanation: string; riskFactors: RiskFactor[] } {
    const riskFactors: RiskFactor[] = [];

    // Rule 1: CRITICAL - Failed Laboratory Test Parameters
    const failedParams = (lotData.labParameters || []).filter((p) => p.status === "FAIL");
    if (failedParams.length > 0 || lotData.labReportStatus === "FAILED" || lotData.coaStatus === "FLAGGED_FAIL") {
      const failDescriptions = failedParams.map((p) => `${p.parameter}: ${p.value} (Limit: ${p.specLimit})`).join(", ");
      
      failedParams.forEach((p) => {
        riskFactors.push({
          ruleId: "FAILED_LAB_ASSAY",
          ruleName: "Failed Laboratory Safety Assay",
          severity: "CRITICAL",
          description: `Laboratory parameter '${p.parameter}' exceeded safety limit: ${p.value} vs ${p.specLimit}.`,
          parameterTested: p.parameter,
          observedValue: p.value,
          threshold: p.specLimit,
        });
      });

      return {
        riskLevel: "RED",
        riskExplanation: `CRITICAL HAZARD: Laboratory test failure detected: ${failDescriptions || "Assay out-of-spec"}. Immediate quarantine hold mandated per FSMA 204.`,
        riskFactors,
      };
    }

    // Rule 2: WARNING - Missing CoA or Pending Lab Results
    if (lotData.coaStatus === "MISSING" || lotData.labReportStatus === "PENDING" || lotData.labReportStatus === "UNAVAILABLE") {
      riskFactors.push({
        ruleId: "MISSING_COA_DOCUMENT",
        ruleName: "Missing Certificate of Analysis (CoA)",
        severity: "WARNING",
        description: "Inward receipt lacks verified laboratory Certificate of Analysis. Verification required before manufacturing release.",
      });
    }

    // Rule 3: WARNING - Expired Quality Certificate
    if (lotData.coaStatus === "EXPIRED" || lotData.labReportStatus === "EXPIRED") {
      riskFactors.push({
        ruleId: "EXPIRED_CERTIFICATE",
        ruleName: "Expired Quality Certificate",
        severity: "WARNING",
        description: "Attached laboratory certificate or supplier audit exceeds validity period.",
      });
    }

    // Rule 4: WARNING - Farmer or Supplier Under Review
    const farmer = farmersLedger.find((f) => f.farmerId === lotData.farmerId);
    if (farmer && farmer.certificationStatus === "UNDER_REVIEW") {
      riskFactors.push({
        ruleId: "FARMER_STATUS_REVIEW",
        ruleName: "Farmer Accreditation Under Review",
        severity: "WARNING",
        description: `Farmer '${farmer.name}' certification status is currently UNDER_REVIEW.`,
      });
    }

    if (riskFactors.length > 0) {
      return {
        riskLevel: "AMBER",
        riskExplanation: "ADDITIONAL VERIFICATION REQUIRED: One or more quality records are pending or unverified. Lot held for merchant review before food plant release.",
        riskFactors,
      };
    }

    // Rule 5: GREEN - No Identified Warnings
    return {
      riskLevel: "GREEN",
      riskExplanation: "CLEAN RECORD: All laboratory test parameters within spec, valid CoA on file, and verified farmer credentials.",
      riskFactors: [],
    };
  }

  /**
   * Retrieves all inbound lots with optional filtering
   */
  public static getAllInboundLots(filters?: InboundFilterParams): InboundLot[] {
    let result = [...inboundLotsLedger];

    if (!filters) return result;

    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.lotId.toLowerCase().includes(term) ||
          l.farmerName.toLowerCase().includes(term) ||
          l.farmerId.toLowerCase().includes(term) ||
          l.ingredient.toLowerCase().includes(term) ||
          l.supplierInfo.name.toLowerCase().includes(term) ||
          l.merchantHub.toLowerCase().includes(term)
      );
    }

    if (filters.riskLevel && filters.riskLevel !== "ALL") {
      result = result.filter((l) => l.riskLevel === filters.riskLevel);
    }

    if (filters.dispositionStatus && filters.dispositionStatus !== "ALL") {
      result = result.filter((l) => l.dispositionStatus === filters.dispositionStatus);
    }

    if (filters.cropType && filters.cropType !== "ALL") {
      result = result.filter((l) => l.cropType === filters.cropType);
    }

    return result;
  }

  /**
   * Retrieves an individual inbound lot by lotId or id
   */
  public static getInboundLotById(idOrLotId: string): InboundLot | null {
    const term = idOrLotId.toLowerCase();
    const lot = inboundLotsLedger.find((l) => l.id.toLowerCase() === term || l.lotId.toLowerCase() === term);
    return lot || null;
  }

  /**
   * Retrieves all farmers in the registry
   */
  public static getAllFarmers(): Farmer[] {
    return [...farmersLedger];
  }

  /**
   * Look up farmer by farmerId
   */
  public static getFarmerById(farmerId: string): Farmer | null {
    const term = farmerId.toLowerCase();
    const farmer = farmersLedger.find((f) => f.id.toLowerCase() === term || f.farmerId.toLowerCase() === term);
    return farmer || null;
  }

  /**
   * Computes real-time KPI metrics for the Inbound Intelligence Dashboard
   */
  public static getDashboardKPIs(): InboundDashboardKPIs {
    const totalIncomingLots = inboundLotsLedger.length;
    const lowRiskLots = inboundLotsLedger.filter((l) => l.riskLevel === "GREEN").length;
    const mediumRiskLots = inboundLotsLedger.filter((l) => l.riskLevel === "AMBER").length;
    const highRiskLots = inboundLotsLedger.filter((l) => l.riskLevel === "RED").length;
    const lotsOnHold = inboundLotsLedger.filter((l) => l.dispositionStatus === "HOLD").length;
    const lotsReleased = inboundLotsLedger.filter((l) => l.dispositionStatus === "RELEASED").length;
    const totalVolumeKg = inboundLotsLedger.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      totalIncomingLots,
      lowRiskLots,
      mediumRiskLots,
      highRiskLots,
      lotsOnHold,
      lotsReleased,
      totalVolumeKg,
    };
  }

  /**
   * Registers a new inbound agricultural lot from an L1 Farmer at an L2 Merchant Hub
   */
  public static registerInboundLot(data: {
    lotId: string;
    farmerId: string;
    ingredient: string;
    cropType: string;
    quantity: number;
    unit?: string;
    harvestDate: string;
    receivingDate?: string;
    merchantHub?: string;
    supplierInfo?: { name: string; code: string; contact: string; facilityAddress?: string };
    labReportStatus: "AVAILABLE" | "PENDING" | "FAILED" | "EXPIRED" | "UNAVAILABLE";
    coaStatus: "VERIFIED" | "MISSING" | "EXPIRED" | "FLAGGED_FAIL";
    labParameters?: Array<{ parameter: string; value: string; specLimit: string; status: "PASS" | "FAIL" | "FLAGGED" }>;
    evidenceFileName?: string;
  }): { success: boolean; lot?: InboundLot; error?: string } {
    if (!data.lotId || !data.farmerId || !data.ingredient || !data.quantity) {
      return { success: false, error: "Lot ID, Farmer ID, Ingredient, and Quantity are required." };
    }

    // Check duplicate
    if (inboundLotsLedger.some((l) => l.lotId.toLowerCase() === data.lotId.toLowerCase().trim())) {
      return { success: false, error: `Inbound Lot '${data.lotId}' is already registered.` };
    }

    const farmer = this.getFarmerById(data.farmerId);
    if (!farmer) {
      return { success: false, error: `Farmer '${data.farmerId}' not found in registry.` };
    }

    // Run deterministic risk screening
    const screening = this.screenInboundLot({
      labReportStatus: data.labReportStatus,
      coaStatus: data.coaStatus,
      labParameters: data.labParameters || [],
      farmerId: data.farmerId,
    });

    const dispositionStatus: LotDispositionStatus =
      screening.riskLevel === "RED"
        ? "HOLD"
        : screening.riskLevel === "AMBER"
        ? "VERIFICATION_REQUESTED"
        : "RELEASED";

    const newLot: InboundLot = {
      id: `inb-lot-${Date.now().toString(36)}`,
      lotId: data.lotId.toUpperCase().trim(),
      farmerId: farmer.farmerId,
      farmerName: farmer.name,
      farmLocation: farmer.farmLocation,
      ingredient: data.ingredient,
      cropType: data.cropType || farmer.cropType,
      quantity: Number(data.quantity),
      unit: data.unit || "kg",
      harvestDate: data.harvestDate || farmer.harvestDate,
      receivingDate: data.receivingDate || new Date().toISOString().split("T")[0],
      merchantHub: data.merchantHub || "Central Aggregation Terminal #1",
      supplierInfo: data.supplierInfo
        ? {
            name: data.supplierInfo.name,
            code: data.supplierInfo.code,
            contact: data.supplierInfo.contact,
            facilityAddress: data.supplierInfo.facilityAddress || farmer.farmLocation,
          }
        : {
            name: "Regional Grain Producers Co-op",
            code: `MCH-${farmer.farmerId.replace("FARM-", "HUB-")}`,
            contact: farmer.contactPhone,
            facilityAddress: farmer.farmLocation,
          },
      labReportStatus: data.labReportStatus,
      coaStatus: data.coaStatus,
      labParameters: data.labParameters || [],
      riskLevel: screening.riskLevel,
      dispositionStatus,
      riskExplanation: screening.riskExplanation,
      riskFactors: screening.riskFactors,
      evidenceDocument: data.evidenceFileName
        ? {
            id: `doc-${Date.now().toString(36)}`,
            fileName: data.evidenceFileName,
            fileType: "application/pdf",
            uploadedAt: new Date().toISOString(),
            documentRef: `LAB-REF-${Date.now().toString(36).toUpperCase()}`,
          }
        : undefined,
      isDemoData: true,
    };

    farmer.totalLotsSupplied += 1;
    inboundLotsLedger = [newLot, ...inboundLotsLedger];

    return { success: true, lot: newLot };
  }

  /**
   * Registers a new farmer in the L1 registry
   */
  public static registerFarmer(data: Partial<Farmer>): { success: boolean; farmer?: Farmer; error?: string } {
    if (!data.farmerId || !data.name || !data.farmLocation || !data.cropType) {
      return { success: false, error: "Farmer ID, Name, Location, and Crop Type are required." };
    }

    if (farmersLedger.some((f) => f.farmerId.toLowerCase() === data.farmerId!.toLowerCase().trim())) {
      return { success: false, error: `Farmer ID '${data.farmerId}' already exists.` };
    }

    const newFarmer: Farmer = {
      id: `farm-${Date.now().toString(36)}`,
      farmerId: data.farmerId.toUpperCase().trim(),
      name: data.name,
      farmLocation: data.farmLocation,
      region: data.region || "Agricultural Basin",
      coordinates: data.coordinates,
      cropType: data.cropType,
      harvestDate: data.harvestDate || new Date().toISOString().split("T")[0],
      contactPhone: data.contactPhone || "+91 90000 00000",
      contactEmail: data.contactEmail || "farm@regionalagri.org",
      farmSizeAcres: data.farmSizeAcres || 25,
      certificationStatus: data.certificationStatus || "STANDARD",
      totalLotsSupplied: 0,
    };

    farmersLedger = [...farmersLedger, newFarmer];
    return { success: true, farmer: newFarmer };
  }

  /**
   * Hold a lot with recorded operational justification
   */
  public static holdLot(lotId: string, reason: string): { success: boolean; lot?: InboundLot; error?: string } {
    const lot = this.getInboundLotById(lotId);
    if (!lot) return { success: false, error: `Lot '${lotId}' not found.` };

    lot.dispositionStatus = "HOLD";
    lot.riskExplanation = `MANUAL HOLD ENFORCED: ${reason}`;
    return { success: true, lot };
  }

  /**
   * Request verification for an inbound lot (e.g. request CoA or laboratory re-test)
   */
  public static requestVerification(lotId: string, notes?: string): { success: boolean; lot?: InboundLot; error?: string } {
    const lot = this.getInboundLotById(lotId);
    if (!lot) return { success: false, error: `Lot '${lotId}' not found.` };

    lot.dispositionStatus = "VERIFICATION_REQUESTED";
    if (notes) {
      lot.riskExplanation = `VERIFICATION PENDING: ${notes}`;
    }
    return { success: true, lot };
  }

  /**
   * Release a lot for delivery to food manufacturers.
   * SAFETY GUARD: A high-risk (RED) lot CANNOT be released without authorized human review and explicit justification!
   */
  public static releaseLot(
    lotId: string,
    authorizedBy?: string,
    justification?: string
  ): { success: boolean; lot?: InboundLot; error?: string } {
    const lot = this.getInboundLotById(lotId);
    if (!lot) return { success: false, error: `Lot '${lotId}' not found.` };

    // Strict safety guard for RED lots
    if (lot.riskLevel === "RED") {
      if (!authorizedBy || !justification || justification.trim().length < 15) {
        return {
          success: false,
          error: "SECURITY PROTOCOL VIOLATION: A high-risk (RED) lot cannot be released without authorized human review, credential verification, and detailed regulatory justification (minimum 15 characters).",
        };
      }

      lot.authorizedReview = {
        reviewedBy: authorizedBy,
        reviewedAt: new Date().toISOString(),
        justification: justification.trim(),
        signOffRef: `OVERRIDE-SIG-${Date.now().toString(36).toUpperCase()}`,
      };
    }

    lot.dispositionStatus = "RELEASED";
    return { success: true, lot };
  }

  /**
   * TRACEABILITY INTEGRATION:
   * Promotes or links an L2 Inbound Lot to an L3 Manufacturer Ingredient Lot in IngredientService!
   * Preserves farmer-level source origin so that production batches and traceability graph
   * can trace all the way back to the farm!
   */
  public static promoteToManufacturerLot(inboundLotId: string): {
    success: boolean;
    ingredientLot?: IngredientLot;
    error?: string;
  } {
    const inboundLot = this.getInboundLotById(inboundLotId);
    if (!inboundLot) return { success: false, error: `Inbound lot '${inboundLotId}' not found.` };

    if (inboundLot.dispositionStatus === "HOLD") {
      return {
        success: false,
        error: `Cannot promote lot '${inboundLot.lotId}' to manufacturing inventory while under active HOLD disposition.`,
      };
    }

    const manufacturerLotNumber = `LOT-MFG-${inboundLot.lotId}`;

    // Check if already promoted
    const existing = IngredientService.getLotByNumber(manufacturerLotNumber);
    if (existing) {
      return { success: true, ingredientLot: existing };
    }

    const newIngredientLot: IngredientLot = {
      id: `lot-${inboundLot.lotId.toLowerCase()}`,
      lotNumber: manufacturerLotNumber,
      ingredientName: inboundLot.ingredient,
      category: "Grains & Cereals",
      supplier: {
        id: `supp-${inboundLot.supplierInfo.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        name: inboundLot.supplierInfo.name,
        code: inboundLot.supplierInfo.code,
        contactEmail: "orders@grainconsortium.org",
        country: "India (Regional Aggregator)",
        facilityAddress: inboundLot.supplierInfo.facilityAddress,
        auditRating: inboundLot.riskLevel === "GREEN" ? "A+" : "B",
      },
      farmerOrigin: {
        farmerId: inboundLot.farmerId,
        farmerName: inboundLot.farmerName,
        farmLocation: inboundLot.farmLocation,
        cropType: inboundLot.cropType,
        harvestDate: inboundLot.harvestDate,
        inboundLotId: inboundLot.lotId,
        riskRating: inboundLot.riskLevel,
      },
      sourceDocument: {
        id: `doc-inb-${inboundLot.lotId.toLowerCase()}`,
        fileName: inboundLot.evidenceDocument?.fileName || `INWARD-MANIFEST-${inboundLot.lotId}.pdf`,
        documentType: "CERTIFICATE_OF_ANALYSIS",
        verifiedAt: new Date().toISOString(),
      },
      receivedDate: inboundLot.receivingDate,
      expiryDate: "2027-10-08",
      initialQuantity: inboundLot.quantity,
      remainingQuantity: inboundLot.quantity,
      quarantinedQuantity: 0,
      unit: inboundLot.unit,
      status: "RELEASED",
      allergenProfiles: ["GLUTEN"],
      storageConditions: "Dry climate-controlled grain silo (<14% moisture, <22°C).",
      coaVerification: {
        status: inboundLot.coaStatus === "VERIFIED" ? "VERIFIED" : "FLAGGED_FAIL",
        labName: inboundLot.evidenceDocument?.labName || "Accredited Grain Quality Lab",
        testDate: inboundLot.receivingDate,
        parameters: inboundLot.labParameters,
      },
      consumptionHistory: [],
      massBalance: {
        totalReceived: inboundLot.quantity,
        totalConsumed: 0,
        remainingRecorded: inboundLot.quantity,
        variance: 0,
        isBalanced: true,
      },
      isRecallTrigger: false,
    };

    IngredientService.registerNewLot(newIngredientLot);
    inboundLot.linkedIngredientLotId = newIngredientLot.id;

    return { success: true, ingredientLot: newIngredientLot };
  }
}
