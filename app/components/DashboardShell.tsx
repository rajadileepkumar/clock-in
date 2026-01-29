"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-slate-100">
        <Header
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={collapsed} />

          <main
            className={`
          flex-1
          transition-all duration-300
          overflow-y-auto
          ${collapsed ? "ml-16" : "ml-64"}
        `}
          >
            <div className="p-6 min-h-full">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
