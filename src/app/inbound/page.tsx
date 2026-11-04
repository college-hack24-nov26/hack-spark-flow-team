"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sprout,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Beaker,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  ArrowRight,
  FileCheck2,
  Building,
  CheckCircle2,
  Factory,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { InboundService } from "@/services/inbound-service";
import { Farmer, InboundLot, RiskLevel, LotDispositionStatus } from "@/types/inbound";
import { InboundRegisterLotModal } from "@/components/inbound/InboundRegisterLotModal";
import { InboundHoldReleaseModal } from "@/components/inbound/InboundHoldReleaseModal";
import { InboundEvidenceDrawer } from "@/components/inbound/InboundEvidenceDrawer";
import { InboundFarmerModal } from "@/components/inbound/InboundFarmerModal";

export default function InboundRiskIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"lots" | "farmers" | "rules">("lots");
  const [lots, setLots] = useState<InboundLot[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCrop, setSelectedCrop] = useState<string>("ALL");

  // Modals & Drawers state
  const [isRegisterLotOpen, setIsRegisterLotOpen] = useState(false);
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [selectedLotForAction, setSelectedLotForAction] = useState<InboundLot | null>(null);
  const [isHoldReleaseOpen, setIsHoldReleaseOpen] = useState(false);
  const [selectedLotForEvidence, setSelectedLotForEvidence] = useState<InboundLot | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Load live data from service
  const refreshData = () => {
    const allLots = InboundService.getAllInboundLots();
    const allFarmers = InboundService.getAllFarmers();
    setLots(allLots);
    setFarmers(allFarmers);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const kpis = InboundService.getDashboardKPIs();

  // Filter lots
  const filteredLots = lots.filter((lot) => {
    const matchesSearch =
      lot.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.farmerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.merchantHub.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRisk === "ALL" || lot.riskLevel === selectedRisk;
    const matchesStatus = selectedStatus === "ALL" || lot.dispositionStatus === selectedStatus;
    const matchesCrop = selectedCrop === "ALL" || lot.cropType === selectedCrop;

    return matchesSearch && matchesRisk && matchesStatus && matchesCrop;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "RED":
        return "bg-rose-950 text-rose-200 border-rose-700 font-bold animate-pulse";
      case "AMBER":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "GREEN":
        return "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold";
    }
  };

  const getDispositionBadge = (status: LotDispositionStatus) => {
    switch (status) {
      case "HOLD":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "VERIFICATION_REQUESTED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "RELEASED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Inbound Risk Intelligence
            </h1>
            <DemoBadge label="L2 AGGREGATOR INTAKE" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-manufacturing screening of incoming agricultural commodities from L1 Farmers at L2 Merchant/Aggregator terminals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFarmerModalOpen(true)}
            className="text-xs font-semibold gap-1.5 border-slate-300 text-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Farmer</span>
          </Button>

          <Button
            size="sm"
            variant="forest"
            onClick={() => setIsRegisterLotOpen(true)}
            className="text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>Register Inbound Lot</span>
          </Button>
        </div>
      </div>

      {/* Live Feedback Notification */}
      {feedbackNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Multi-Echelon Supply Chain Banner */}
      <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-900/60 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold">
              Multi-Echelon Farm-to-Fork Custody Architecture
            </div>
            <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
              <span className="text-slate-300">L1 Farmers</span>
              <span className="text-emerald-500 font-mono">➔</span>
              <span className="bg-emerald-800 text-white px-2 py-0.5 rounded font-mono text-xs ring-1 ring-emerald-400">
                L2 Merchants / Aggregators (Active Screening)
              </span>
              <span className="text-emerald-500 font-mono">➔</span>
              <span className="text-slate-300">L3 Food Manufacturers</span>
              <span className="text-emerald-500 font-mono">➔</span>
              <span className="text-slate-300">L4 Distributors</span>
              <span className="text-emerald-500 font-mono">➔</span>
              <span className="text-slate-300">L5 Consumers</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-4xl pt-0.5">
              Screening agricultural raw materials for chemical residues and missing certificates at the aggregator depot prevents contaminated grains from entering milling and food formulation lines.
            </p>
          </div>

          <Link href="/traceability" className="shrink-0">
            <Button size="sm" variant="outline" className="border-emerald-700 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800 text-xs font-semibold gap-1.5">
              <span>View Full Lineage Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-Time Calculated KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="Total Incoming Lots"
          value={`${kpis.totalIncomingLots} Lots`}
          subtext={`${(kpis.totalVolumeKg / 1000).toFixed(1)} Metric Tons`}
          statusVariant="default"
        />
        <MetricCard
          title="Low Risk Lots"
          value={`${kpis.lowRiskLots} Lots`}
          subtext="Clean record (GREEN)"
          statusVariant="success"
        />
        <MetricCard
          title="Verification Required"
          value={`${kpis.mediumRiskLots} Lots`}
          subtext="Missing CoA / Review (AMBER)"
          statusVariant="warning"
        />
        <MetricCard
          title="High Risk (RED)"
          value={`${kpis.highRiskLots} Lots`}
          subtext="Lab assay failures"
          statusVariant={kpis.highRiskLots > 0 ? "danger" : "default"}
        />
        <MetricCard
          title="Lots on Hold"
          value={`${kpis.lotsOnHold} Locked`}
          subtext="Physical quarantine at depot"
          statusVariant={kpis.lotsOnHold > 0 ? "danger" : "success"}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("lots")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "lots"
                ? "border-emerald-700 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Inbound Lots &amp; Risk Screening ({lots.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("farmers")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "farmers"
                ? "border-emerald-700 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Farmer Registry L1 Origin ({farmers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "rules"
                ? "border-emerald-700 text-emerald-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Beaker className="w-4 h-4" />
            <span>Explainable Risk Screening Engine</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: INBOUND LOTS & RISK SCREENING */}
      {activeTab === "lots" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Lot, Farmer Name, Farmer ID, Crop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Risk Level Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600 text-[11px]">Risk:</span>
                <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
                  {["ALL", "GREEN", "AMBER", "RED"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRisk(r)}
                      className={`px-2 py-0.5 rounded text-[10.5px] transition-all ${
                        selectedRisk === r
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disposition Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600 text-[11px]">Disposition:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="RELEASED">Released</option>
                  <option value="HOLD">On Hold</option>
                  <option value="VERIFICATION_REQUESTED">Verification Requested</option>
                </select>
              </div>

              {/* Crop Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600 text-[11px]">Crop:</span>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-900 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Crops</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Oats">Oats</option>
                </select>
              </div>
            </div>
          </div>

          {/* Incoming Lots Table */}
          <Card className="border border-slate-200 shadow-2xs">
            <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Inbound Agricultural Commodities Queue
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Showing {filteredLots.length} incoming lots evaluated by the deterministic screening engine
                </CardDescription>
              </div>
              <DemoBadge label="FSMA 204 L2 CTE" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Lot ID</th>
                      <th className="py-2.5 px-4">L1 Farmer Origin</th>
                      <th className="py-2.5 px-4">Commodity &amp; Volume</th>
                      <th className="py-2.5 px-4">Quality &amp; CoA Status</th>
                      <th className="py-2.5 px-4">Explainable Risk Rating</th>
                      <th className="py-2.5 px-4">Disposition</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredLots.map((lot) => (
                      <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{lot.lotId}</div>
                          <div className="text-[9.5px] text-slate-400 font-sans font-normal">
                            Recv: {lot.receivingDate}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-800">
                          <div className="font-semibold text-slate-900">{lot.farmerName}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span className="font-mono text-emerald-700">{lot.farmerId}</span>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{lot.farmLocation.split(",")[0]}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-700">
                          <div className="font-medium text-slate-900">{lot.ingredient}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {lot.quantity.toLocaleString()} {lot.unit} ({lot.cropType})
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                                lot.coaStatus === "VERIFIED"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : lot.coaStatus === "FLAGGED_FAIL"
                                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}
                            >
                              CoA: {lot.coaStatus}
                            </span>
                          </div>
                          <div className="text-[9.5px] text-slate-400 mt-0.5">
                            Lab: {lot.labReportStatus}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] border uppercase ${getRiskBadge(
                              lot.riskLevel
                            )}`}
                          >
                            {lot.riskLevel}
                          </span>
                          {lot.riskLevel === "RED" && (
                            <span className="block text-[9.5px] text-rose-700 font-sans mt-0.5 font-bold">
                              Chlorpyrifos Exceedance
                            </span>
                          )}
                          {lot.riskLevel === "AMBER" && (
                            <span className="block text-[9.5px] text-amber-700 font-sans mt-0.5">
                              Missing Lab Assay
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] font-bold border uppercase ${getDispositionBadge(
                              lot.dispositionStatus
                            )}`}
                          >
                            {lot.dispositionStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLotForEvidence(lot);
                                setIsEvidenceDrawerOpen(true);
                              }}
                              className="text-[10px] h-7 px-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                            >
                              View Evidence
                            </Button>

                            <Button
                              size="sm"
                              variant={lot.dispositionStatus === "HOLD" ? "destructive" : "outline"}
                              onClick={() => {
                                setSelectedLotForAction(lot);
                                setIsHoldReleaseOpen(true);
                              }}
                              className="text-[10px] h-7 px-2 font-semibold"
                            >
                              {lot.dispositionStatus === "HOLD" ? (
                                <span className="flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Hold Review
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Unlock className="w-3 h-3 text-emerald-700" /> Hold/Release
                                </span>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: FARMER REGISTRY (L1 ORIGIN) */}
      {activeTab === "farmers" && (
        <Card className="border border-slate-200 shadow-2xs">
          <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                L1 Farm Origin &amp; Farmer Registry
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Verified farm coordinates, acreage, contact information, and Good Agricultural Practices (GAP) status
              </CardDescription>
            </div>

            <Button
              size="sm"
              variant="forest"
              onClick={() => setIsFarmerModalOpen(true)}
              className="text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Register New Farmer</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Farmer ID</th>
                    <th className="py-2.5 px-4">Farmer Name</th>
                    <th className="py-2.5 px-4">Farm Location &amp; Coordinates</th>
                    <th className="py-2.5 px-4">Primary Crops</th>
                    <th className="py-2.5 px-4">Farm Size</th>
                    <th className="py-2.5 px-4">Contact Info</th>
                    <th className="py-2.5 px-4">Accreditation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-emerald-800">
                        {farmer.farmerId}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {farmer.name}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{farmer.farmLocation}</span>
                        </div>
                        {farmer.coordinates && (
                          <div className="text-[10px] text-slate-400 font-mono pl-4">
                            {farmer.coordinates}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">
                        {farmer.cropType}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {farmer.farmSizeAcres} Acres
                      </td>
                      <td className="py-3 px-4 font-sans text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{farmer.contactPhone}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{farmer.contactEmail}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                            farmer.certificationStatus === "ORGANIC"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : farmer.certificationStatus === "GAP_CERTIFIED"
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : farmer.certificationStatus === "UNDER_REVIEW"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {farmer.certificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: EXPLAINABLE RISK SCREENING ENGINE */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-slate-200">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <CardTitle className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  GREEN: Low Risk (Clean Record)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Evaluation Rule:</strong> No warning or adverse assay identified in available records.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                <li>All laboratory test parameters confirmed within Codex/FSSAI MRL safety limits.</li>
                <li>Valid Certificate of Analysis (CoA) attached from accredited testing facility.</li>
                <li>L1 Farmer has active GAP or Organic certification.</li>
                <li><strong>System Action:</strong> Auto-cleared for release to food manufacturers.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <CardTitle className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  AMBER: Verification Required
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Evaluation Rule:</strong> Missing certificates, expired records, or unverified supplier data.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                <li>CoA is missing, pending laboratory results, or expired.</li>
                <li>Farmer or Aggregator certification is UNDER_REVIEW.</li>
                <li>Incomplete lot metadata or mass balance receipt gap.</li>
                <li><strong>System Action:</strong> Placed on hold for merchant review; does NOT invent contamination.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <CardTitle className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  RED: Critical Hazard (Mandatory Hold)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Evaluation Rule:</strong> Actual laboratory test result confirmed chemical, microbial, or toxin exceedance.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700">
                <li>Chlorpyrifos or pesticide residue &gt; Maximum Residue Limit (MRL).</li>
                <li>Aflatoxins &gt; 20 ppb or Ochratoxin A exceedance.</li>
                <li>Confirmed pathogen presence (Salmonella, E. coli).</li>
                <li><strong>System Action:</strong> Immediate quarantine lock; release strictly blocked without authorized executive review.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals & Drawers */}
      <InboundRegisterLotModal
        isOpen={isRegisterLotOpen}
        onClose={() => setIsRegisterLotOpen(false)}
        farmers={farmers}
        onLotRegistered={(newLot) => {
          refreshData();
          setFeedbackNotice(`Inbound Lot '${newLot.lotId}' registered and screened as ${newLot.riskLevel}.`);
          setTimeout(() => setFeedbackNotice(null), 5000);
        }}
      />

      <InboundHoldReleaseModal
        isOpen={isHoldReleaseOpen}
        onClose={() => setIsHoldReleaseOpen(false)}
        lot={selectedLotForAction}
        onDispositionUpdated={(updatedLot) => {
          refreshData();
          setFeedbackNotice(`Lot '${updatedLot.lotId}' disposition updated to ${updatedLot.dispositionStatus}.`);
          setTimeout(() => setFeedbackNotice(null), 5000);
        }}
      />

      <InboundEvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        lot={selectedLotForEvidence}
        farmer={farmers.find((f) => f.farmerId === selectedLotForEvidence?.farmerId) || null}
        onPromoted={() => {
          refreshData();
        }}
      />

      <InboundFarmerModal
        isOpen={isFarmerModalOpen}
        onClose={() => setIsFarmerModalOpen(false)}
        onFarmerRegistered={(newFarmer) => {
          refreshData();
          setFeedbackNotice(`Farmer '${newFarmer.name}' (${newFarmer.farmerId}) added to L1 registry.`);
          setTimeout(() => setFeedbackNotice(null), 5000);
        }}
      />
    </div>
  );
}
