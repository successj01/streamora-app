import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Search,
  Radio,
  User,
} from "lucide-react";

const MobileNav = () => {
  const navigationItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      label: "Browse",
      path: "/browse",
      icon: Search,
    },
    {
      label: "Live",
      path: "/live",
      icon: Radio,
    },
    {
      label: "Search",
      path: "/search",
      icon: Search,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#111113]/95 backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `group flex min-w-[58px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all duration-200 ${
                  isActive
                    ? "text-red-500"
                    : "text-gray-500 hover:text-gray-300"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                      isActive
                        ? "bg-red-500/10"
                        : "group-hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>

                  <span className="text-[10px] font-medium leading-none">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;