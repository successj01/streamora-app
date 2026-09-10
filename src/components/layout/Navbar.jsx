import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBell,
  FiVideo,
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiHelpCircle,
  FiHome,
  FiRadio,
  FiGrid,
} from "react-icons/fi";

import streamoraLogo from "../../assets/images/streamora-logo.png";

const Navbar = () => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: FiHome,
    },
    {
      name: "Browse",
      path: "/browse",
      icon: FiGrid,
    },
    {
      name: "Live",
      path: "/live",
      icon: FiRadio,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f0f10]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Streamora Home"
        >
          <img
            src={streamoraLogo}
            alt="Streamora"
            className="h-10 w-10 rounded-xl object-contain"
          />

          <span className="hidden text-xl font-black tracking-tight sm:block">
            Stream<span className="text-purple-500">ora</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-purple-600/15 text-purple-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={17} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Search */}
        <div className="ml-auto flex items-center">
          <form
            onSubmit={handleSearch}
            className="hidden md:block"
          >
            <div className="relative w-[240px] xl:w-[320px]">
              <FiSearch
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search streams, creators..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50 focus:bg-white/[0.07]"
              />
            </div>
          </form>

          {/* Mobile Search */}
          <button
            type="button"
            onClick={() => setSearchOpen((previous) => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Search"
          >
            {searchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-1 md:flex">

          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <FiBell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-purple-500 ring-2 ring-[#0f0f10]" />
          </button>

          {/* Go Live */}
          <Link
            to="/dashboard/create-stream"
            className="ml-2 flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
          >
            <FiVideo size={17} />
            <span>Go Live</span>
          </Link>

          {/* Profile */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setProfileOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white/5"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/20">
                <FiUser size={17} />
              </div>

              <FiChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl shadow-black/40">

                <div className="border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">
                      <FiUser size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        Streamora User
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        Sign in to your account
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <FiUser size={17} />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <FiSettings size={17} />
                    Settings
                  </Link>

                  <Link
                    to="/help"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <FiHelpCircle size={17} />
                    Help & Support
                  </Link>

                  <div className="my-2 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={() => {
                      closeMenus();
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <FiLogOut size={17} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="border-t border-white/5 px-4 py-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <FiSearch
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search streams, creators..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500/50"
              />
            </div>
          </form>
        </div>
      )}

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#111113] md:hidden">
          <nav className="space-y-1 px-4 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-purple-600/15 text-purple-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              );
            })}

            <div className="my-3 border-t border-white/10" />

            <Link
              to="/dashboard/create-stream"
              onClick={closeMenus}
              className="flex items-center gap-3 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white"
            >
              <FiVideo size={19} />
              Go Live
            </Link>

            <Link
              to="/profile"
              onClick={closeMenus}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <FiUser size={19} />
              Profile
            </Link>

            <Link
              to="/settings"
              onClick={closeMenus}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <FiSettings size={19} />
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;