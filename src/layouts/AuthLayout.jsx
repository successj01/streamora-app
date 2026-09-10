import React from "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">

      {/* Auth Header */}
      <header className="border-b border-white/10 bg-[#0b0b0d]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight"
            aria-label="Streamora home"
          >
            Stream<span className="text-red-500">ora</span>
          </Link>
        </div>
      </header>

      {/* Authentication Content */}
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

    </div>
  );
};

export default AuthLayout;