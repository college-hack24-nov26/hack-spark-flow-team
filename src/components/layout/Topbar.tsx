"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  AlertTriangle,
  Upload,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchFeedback(`Filtering records for "${searchQuery}"...`);
    setTimeout(() => setSearchFeedback(null), 3000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Left Section: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 -ml-1 text-slate-600 rounded-md hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lot #, batch ID, supplier, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8.5 pr-14 text-xs bg-slate-50 border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded">
              ⌘K
            </span>
          </div>

          {searchFeedback && (
            <div className="absolute left-0 right-0 mt-1 p-2 text-xs bg-slate-900 text-white rounded-md shadow-lg z-50 animate-in fade-in">
              {searchFeedback}
            </div>
          )}
        </form>
      </div>

      {/* Right Section: Status, Quick Actions & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Active Emergency Status Pill */}
        <Link
          href="/recall"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold font-mono bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          title="Click to view ongoing recall investigation"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>INCIDENT RCL-2026-004 ACTIVE</span>
        </Link>

        {/* Quick Action: Document Ingestion */}
        <Link href="/documents">
          <Button variant="outline" size="sm" className="hidden md:inline-flex gap-1.5">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload Document</span>
          </Button>
        </Link>

        {/* Notifications Button */}
        <div className="relative">
          <Link
            href="/audit/gaps"
            className="flex items-center justify-center w-8 h-8 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="2 Compliance Gaps Flagged"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </Link>
        </div>

        {/* Demo Environment Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>FSMA 204 LIVE</span>
        </div>
      </div>
    </header>
  );
}
