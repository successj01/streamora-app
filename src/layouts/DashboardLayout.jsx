import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">

      {/* Global Navbar */}
      <Navbar />

      {/* Dashboard Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Dashboard Content */}
      <main
        className={`min-h-[calc(100vh-72px)] pt-[72px] transition-all duration-300 ${
          sidebarCollapsed
            ? "lg:ml-[76px]"
            : "lg:ml-[240px]"
        }`}
      >
        <div className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;