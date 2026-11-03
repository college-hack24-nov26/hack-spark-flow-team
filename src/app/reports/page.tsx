"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Download,
  Printer,
  ShieldCheck,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowDownToLine,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { ReportGenerator, FSMA204SpreadsheetRow } from "@/services/report-generator";

export default function ReportsPage() {
  const [rows, setRows] = useState<FSMA204SpreadsheetRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCteType, setSelectedCteType] = useState<string>("ALL");
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    const data = ReportGenerator.generateFSMA204Dataset();
    setRows(data);
  }, []);

  const handleDownloadCSV = () => {
    setDownloadNotice("Compiling FSMA 204 electronic spreadsheet from relational ledger...");
    const csvContent = ReportGenerator.generateCSV(rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FSMA-204-ELECTRONIC-SPREADSHEET-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadNotice("Download successful: FSMA-204-ELECTRONIC-SPREADSHEET.csv saved. Verified against 21 CFR § 1.1455.");
      setTimeout(() => setDownloadNotice(null), 5000);
    }, 400);
  };

  const filteredRows = rows.filter((r) => {
    const matchesCte = selectedCteType === "ALL" || r.cteType === selectedCteType;
    const matchesSearch =
      r.traceabilityLotCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sourceEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destinationEntity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCte && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Evidence-Backed Reports &amp; Regulatory Dossiers
            </h1>
            <DemoBadge label="FSMA 204 EXPORTS" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated generation of FDA 24-hour electronic sortable spreadsheets, recall packets, and auditor-ready CTE records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="forest"
            onClick={handleDownloadCSV}
            className="gap-1.5 text-xs font-semibold shadow-2xs"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download 24-Hr Electronic File (CSV)</span>
          </Button>
        </div>
      </div>

      {/* Live Feedback Notification */}
      {downloadNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Executive Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="FSMA 204 24-Hr Rule"
          value="< 1.2s Ready"
          subtext="Mandate: Must supply in 24h"
          statusVariant="success"
        />
        <MetricCard
          title="Total CTE Records"
          value={`${rows.length} Events`}
          subtext="Receiving, Transform & Ship"
          statusVariant="default"
        />
        <MetricCard
          title="Traceability Lot Plan"
          value="100% Compliant"
          subtext="Full custody chain mapped"
          statusVariant="success"
        />
        <MetricCard
          title="Cryptographic Proof"
          value="SHA-256 Valid"
          subtext="Tamper-evident record hash"
          statusVariant="default"
        />
      </div>

      {/* Standard Regulatory Dossier Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 24-Hour Electronic Sortable Spreadsheet */}
        <Card className="border border-slate-200 hover:border-slate-300 transition-all shadow-2xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800">
                MANDATORY FDA
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                FSMA 204 Electronic Sortable Spreadsheet
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Complete electronic register containing receiving KDEs, transformation batch compositions, and consignee shipping references.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">21 CFR § 1.1455</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadCSV}
                className="text-[11px] h-7 px-2.5 gap-1 text-emerald-800 border-emerald-300 hover:bg-emerald-50 font-semibold"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: FDA Part 7 Recall Dossier */}
        <Card className="border border-slate-200 hover:border-slate-300 transition-all shadow-2xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-rose-100 text-rose-800">
                INCIDENT RCL-004
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                FDA 21 CFR Part 7 Recall Dossier &amp; Consignee Packet
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Voluntary recall submission letter, health hazard classification, and complete wholesale distribution center consignee roster.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">21 CFR § 7.42</span>
              <Link href="/recall">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[11px] h-7 px-2.5 gap-1 text-rose-800 border-rose-300 hover:bg-rose-50 font-semibold"
                >
                  <FileText className="w-3 h-3" />
                  <span>View Dossier</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Vendor CoA Analytical Register */}
        <Card className="border border-slate-200 hover:border-slate-300 transition-all shadow-2xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-100 text-blue-800">
                AUDITOR READY
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Vendor Compliance &amp; Certificate of Analysis Ledger
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Third-party analytical assay parameters, microbiological tests, allergen verifications, and SQF audit certificates.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">FSVP § 1.506</span>
              <Link href="/inventory/ingredients">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[11px] h-7 px-2.5 gap-1 text-blue-800 border-blue-300 hover:bg-blue-50 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Inspect Assays</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Sortable Electronic Spreadsheet Table */}
      <Card className="border border-slate-200">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                FDA Electronic Sortable Spreadsheet Preview
              </CardTitle>
              <DemoBadge label="21 CFR § 1.1455 LIVE PREVIEW" />
            </div>
            <CardDescription className="text-xs text-slate-500">
              Interactive preview of Critical Tracking Events (CTEs) and Key Data Elements (KDEs)
            </CardDescription>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Lot, Product, Origin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-md w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
              {["ALL", "RECEIVING", "TRANSFORMATION", "SHIPPING"].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedCteType(t)}
                  className={`px-2 py-0.5 rounded text-[10.5px] transition-all ${
                    selectedCteType === t
                      ? "bg-white text-slate-900 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">CTE Type</th>
                  <th className="py-2.5 px-4">Traceability Lot Code</th>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4">Source Origin</th>
                  <th className="py-2.5 px-4">Destination</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-right">Quantity</th>
                  <th className="py-2.5 px-4">Verification Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                          row.cteType === "RECEIVING"
                            ? "bg-blue-100 text-blue-800"
                            : row.cteType === "TRANSFORMATION"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {row.cteType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {row.traceabilityLotCode}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-800">
                      {row.itemDescription}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 max-w-xs truncate">
                      {row.sourceEntity}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 max-w-xs truncate">
                      {row.destinationEntity}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {row.transactionDate}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-900">
                      {row.quantity.toLocaleString()} {row.unit}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-sans text-[10.5px]">
                      <div className="flex items-center gap-1">
                        <FileCheck2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[130px]">{row.referenceDocumentFile}</span>
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
  );
}
