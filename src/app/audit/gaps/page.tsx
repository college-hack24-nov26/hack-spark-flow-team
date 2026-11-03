"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileQuestion,
  Scale,
  RefreshCw,
  ArrowRight,
  Upload,
  Check,
  Building,
  Boxes,
  Factory,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { AuditService, AuditScanSummary, AuditGap } from "@/services/audit-service";

export default function TraceabilityGapsPage() {
  const [scanSummary, setScanSummary] = useState<AuditScanSummary | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  // Load audit scan
  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const result = AuditService.runIntegrityScan();
      setScanSummary(result);
      setIsScanning(false);
      setFeedback(`Deterministic scan complete: ${result.totalGapsFound} compliance gaps detected across ${result.totalLotsScanned} lots and ${result.totalBatchesScanned} batches.`);
      setTimeout(() => setFeedback(null), 4500);
    }, 400);
  };

  useEffect(() => {
    runScan();
  }, []);

  // Remediate a specific gap
  const handleRemediate = (gap: AuditGap) => {
    if (gap.ruleCode === "MISSING_COA") {
      setRemediatingId(gap.id);
      setTimeout(() => {
        const res = AuditService.remediateMissingCoA(gap.targetEntity);
        if (res.success) {
          setFeedback(res.message);
          runScan();
        }
        setRemediatingId(null);
      }, 500);
    }
  };

  if (!scanSummary) return null;

  const filteredGaps = scanSummary.gaps.filter((gap) => {
    if (selectedSeverity === "ALL") return true;
    return gap.severity === selectedSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-950 text-rose-200 border-rose-700 animate-pulse";
      case "HIGH":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Traceability Gap &amp; Compliance Auditor
            </h1>
            <DemoBadge label="DETERMINISTIC INTEGRITY RULES" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated relational audit rules verifying missing certificates, unverified lots, and mass balance discrepancies under FSMA 204.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="forest"
            onClick={runScan}
            disabled={isScanning}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isScanning ? "Evaluating Rules..." : "Re-Scan Ledgers"}</span>
          </Button>
        </div>
      </div>

      {/* Live Feedback Banner */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="FSMA Health Score"
          value={`${scanSummary.complianceScorePercent}%`}
          subtext="Regulatory compliance rating"
          statusVariant={scanSummary.complianceScorePercent > 80 ? "success" : "warning"}
        />
        <MetricCard
          title="Total Open Gaps"
          value={`${scanSummary.totalGapsFound} Gaps`}
          subtext={`Evaluated ${scanSummary.totalRulesEvaluated} core rules`}
          statusVariant={scanSummary.totalGapsFound > 0 ? "warning" : "success"}
        />
        <MetricCard
          title="Critical Hazards"
          value={`${scanSummary.criticalGaps} Incidents`}
          subtext="Immediate recall required"
          statusVariant={scanSummary.criticalGaps > 0 ? "danger" : "success"}
        />
        <MetricCard
          title="Missing CoAs"
          value={`${scanSummary.highGaps} Lots`}
          subtext="Quarantine release blocked"
          statusVariant={scanSummary.highGaps > 0 ? "warning" : "success"}
        />
        <MetricCard
          title="Verified Compliant"
          value={`${scanSummary.totalLotsScanned + scanSummary.totalBatchesScanned - scanSummary.totalGapsFound} Entities`}
          subtext="Clean audit trail"
          statusVariant="success"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filter Severity:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 font-medium">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                  selectedSeverity === sev
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredGaps.length} of {scanSummary.totalGapsFound} detected items
        </div>
      </div>

      {/* Detected Gaps List */}
      <div className="space-y-3">
        {filteredGaps.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              No Gaps Found In Selected Filter
            </h3>
            <p className="text-xs text-slate-500">
              All scanned database entities satisfy the active compliance rules.
            </p>
          </div>
        ) : (
          filteredGaps.map((gap) => (
            <Card
              key={gap.id}
              className={`border transition-all hover:shadow-xs ${
                gap.severity === "CRITICAL"
                  ? "border-rose-300 bg-rose-50/20"
                  : gap.severity === "HIGH"
                  ? "border-amber-200 bg-amber-50/15"
                  : "border-slate-200 bg-white"
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[9.5px] font-bold border uppercase ${getSeverityBadge(
                          gap.severity
                        )}`}
                      >
                        {gap.severity} RISK
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {gap.targetEntity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({gap.entityType})
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        {gap.fsmaRegulatoryCode}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900">
                      {gap.ruleTitle}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                      {gap.description}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-700">
                      <span className="font-semibold text-emerald-800">Mandated Remediation:</span>
                      <span>{gap.remediationAction}</span>
                    </div>
                  </div>

                  {/* Remediation Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    {gap.ruleCode === "MISSING_COA" && (
                      <Button
                        size="sm"
                        variant="forest"
                        disabled={remediatingId === gap.id}
                        onClick={() => handleRemediate(gap)}
                        className="text-xs font-semibold gap-1.5 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{remediatingId === gap.id ? "Attaching..." : "Attach CoA & Release"}</span>
                      </Button>
                    )}

                    {gap.ruleCode === "CONTAMINANT_DETECTED" && (
                      <Link href="/recall">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs font-semibold gap-1.5 shadow-2xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Simulate Recall Notice</span>
                        </Button>
                      </Link>
                    )}

                    {gap.entityType === "INGREDIENT_LOT" && gap.ruleCode !== "CONTAMINANT_DETECTED" && (
                      <Link href="/inventory/ingredients">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <span>Inspect Lot</span>
                        </Button>
                      </Link>
                    )}

                    {gap.entityType === "PRODUCTION_BATCH" && (
                      <Link href="/inventory/batches">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <span>Inspect Batch</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rules Engine Reference Catalog */}
      <Card className="border border-slate-200">
        <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              FSMA 204 Relational Integrity Rules Catalog
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active automated validation algorithms evaluated against live CTE database ledgers
            </CardDescription>
          </div>
          <DemoBadge label="DETERMINISTIC" />
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>1. Certificate of Analysis (CoA)</span>
                <span className="text-[10px] text-rose-700 font-mono">HIGH</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Verifies every inward raw material lot has an accredited lab assay attached before release from quarantine.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>2. Out-of-Spec Pathogen Assay</span>
                <span className="text-[10px] text-rose-700 font-mono">CRITICAL</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Scans microbial assays (Salmonella, Listeria, E. coli) for POSITIVE or threshold exceedances triggering Class I recall procedures.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>3. Mass Balance Conservation</span>
                <span className="text-[10px] text-amber-700 font-mono">MEDIUM</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Enforces conservation of mass: Total Inward Received must equal Total Consumed in BOMs plus Remaining Recorded Stock.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
