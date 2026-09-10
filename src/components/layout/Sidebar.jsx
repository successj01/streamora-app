import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiRadio,
  FiVideo,
  FiUsers,
  FiHeart,
  FiClock,
  FiSettings,
  FiHelpCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const Sidebar = ({ collapsed = false, onToggle }) => {
  const mainNavigation = [
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
    {
      name: "Categories",
      path: "/categories",
      icon: FiGrid,
    },
  ];

  const libraryNavigation = [
    {
      name: "Following",
      path: "/following",
      icon: FiUsers,
    },
    {
      name: "Favorites",
      path: "/favorites",
      icon: FiHeart,
    },
    {
      name: "Watch History",
      path: "/history",
      icon: FiClock,
    },
  ];

  const bottomNavigation = [
    {
      name: "Settings",
      path: "/settings",
      icon: FiSettings,
    },
    {
      name: "Help & Support",
      path: "/help",
      icon: FiHelpCircle,
    },
  ];

  const renderNavigation = (items) =>
    items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          title={collapsed ? item.name : undefined}
          className={({ isActive }) =>
            `group flex items-center rounded-xl transition-all duration-200 ${
              collapsed
                ? "justify-center px-3 py-3"
                : "gap-3 px-3 py-2.5"
            } ${
              isActive
                ? "bg-purple-600/15 text-purple-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon
            size={19}
            strokeWidth={1.9}
            className="shrink-0"
          />

          {!collapsed && (
            <span className="truncate text-sm font-medium">
              {item.name}
            </span>
          )}
        </NavLink>
      );
    });

  return (
    <aside
      className={`fixed left-0 top-[72px] z-40 hidden h-[calc(100vh-72px)] border-r border-white/10 bg-[#111113] transition-all duration-300 lg:flex lg:flex-col ${
        collapsed ? "w-[76px]" : "w-[240px]"
      }`}
    >
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">

        {/* Main */}
        <div>
          {!collapsed && (
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">
              Main
            </p>
          )}

          <nav className="space-y-1">
            {renderNavigation(mainNavigation)}
          </nav>
        </div>

        {/* Library */}
        <div className="mt-7">
          {!collapsed && (
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">
              Library
            </p>
          )}

          <nav className="space-y-1">
            {renderNavigation(libraryNavigation)}
          </nav>
        </div>

        {/* Go Live */}
        {!collapsed && (
          <div className="mt-8 rounded-2xl border border-purple-500/10 bg-purple-600/10 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white">
              <FiVideo size={18} />
            </div>

            <h3 className="text-sm font-semibold text-white">
              Start Streaming
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Share your content and connect with your audience.
            </p>

            <NavLink
              to="/dashboard/create-stream"
              className="mt-4 flex items-center justify-center rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-500"
            >
              Go Live
            </NavLink>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-white/10 p-3">
        <nav className="space-y-1">
          {renderNavigation(bottomNavigation)}
        </nav>

        {/* Collapse Button */}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-2 flex w-full items-center rounded-xl py-2.5 text-gray-500 transition hover:bg-white/5 hover:text-white ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
          >
            {collapsed ? (
              <FiChevronRight size={18} />
            ) : (
              <>
                <FiChevronLeft size={18} />
                <span className="text-xs font-medium">
                  Collapse sidebar
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;