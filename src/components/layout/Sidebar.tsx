"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  Factory,
  GitFork,
  AlertTriangle,
  ShieldAlert,
  FileCheck2,
  ChevronRight,
  Sparkles,
  Building2,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const navigationItems = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
    badge: "OCR Ingestion",
  },
  {
    name: "Ingredient Lots",
    href: "/inventory/ingredients",
    icon: Boxes,
    badge: null,
  },
  {
    name: "Production Batches",
    href: "/inventory/batches",
    icon: Factory,
    badge: null,
  },
  {
    name: "Traceability Graph",
    href: "/traceability",
    icon: GitFork,
    badge: "Interactive",
  },
  {
    name: "Recall Intelligence",
    href: "/recall",
    icon: AlertTriangle,
    badge: "1 Active",
    isAlert: true,
  },
  {
    name: "Traceability Gaps",
    href: "/audit/gaps",
    icon: ShieldAlert,
    badge: "2 Gaps",
    isWarning: true,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileCheck2,
    badge: "Audit Ready",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#081C14] border-r border-[#16382B] text-[#E2ECE9] transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-15 px-5 border-b border-[#16382B]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">
                  TraceX
                </span>
                <span className="text-[11px] font-bold text-emerald-400 font-mono">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-[#8AA497] block leading-none font-mono">
                FOOD TRACEABILITY
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8AA497] hover:text-white hover:bg-[#123326] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Facility Context Bar */}
        <div className="px-3.5 py-2.5 mx-3 mt-3 rounded-md bg-[#0D281E] border border-[#16382B]">
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[11px] font-medium text-white block truncate">
                Austin Processing Facility #1
              </span>
              <span className="text-[10px] text-[#8AA497] font-mono">
                FDA Reg: #19482019
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B887B]">
            Traceability Suite
          </div>

          {navigationItems.map((item) => {
            const active = isCurrent(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all",
                  active
                    ? "bg-[#15402F] text-white shadow-xs"
                    : "text-[#B0C5BC] hover:bg-[#0E2C20] hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      active
                        ? "text-emerald-400"
                        : "text-[#8AA497] group-hover:text-emerald-300"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                      item.isAlert
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : item.isWarning
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-[#0D281E] text-emerald-400/90 border border-[#184131]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Live Integrity Status Widget */}
        <div className="p-3 mx-3 mb-3 rounded-md bg-[#0D281E]/70 border border-[#16382B]">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-[#8AA497] font-medium">Chain Integrity</span>
            <span className="font-mono font-semibold text-emerald-400">96.4%</span>
          </div>
          <div className="w-full h-1.5 bg-[#081C14] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: "96.4%" }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-[#8AA497] leading-tight">
            18 Batches fully verified • 2 Gaps require manual review
          </p>
        </div>

        {/* User / Build Footer */}
        <div className="p-3 border-t border-[#16382B] flex items-center justify-between bg-[#061610]">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-semibold font-mono">
              AV
            </div>
            <div className="truncate">
              <span className="text-xs font-medium text-white block truncate leading-tight">
                Abhishek Verma
              </span>
              <span className="text-[10px] text-[#8AA497] font-mono leading-none">
                QA & Compliance Lead
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
