import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">

      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() =>
            setSidebarCollapsed((previous) => !previous)
          }
        />
      </div>

      {/* Main Content */}
      <main
        className={`min-h-[calc(100vh-72px)] transition-all duration-300 ${
          sidebarCollapsed
            ? "md:ml-[76px]"
            : "md:ml-[240px]"
        }`}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed
            ? "md:ml-[76px]"
            : "md:ml-[240px]"
        }`}
      >
        <Footer />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

    </div>
  );
};

export default MainLayout;