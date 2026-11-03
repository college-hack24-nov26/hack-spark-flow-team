"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Dark Forest Green Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
