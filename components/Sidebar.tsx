"use client";
import { FiBell, FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import {
  HamburgerCloseIcon,
  HamburgerHoverIcon,
  HamburgerOpenIcon,
} from "./Icons/icons";
import { useState } from "react";
import { DashboardIcon, FeatureAccessIcon, SmartCityLogo } from "./Icons/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "w-72" : "w-16"
      } bg-pvBlue text-white transition-width duration-300 flex flex-col fixed top-0 left-0 h-screen z-20`}
    >
      {/* Header */}
      <div className="bg-pvLightBlue">
        <div className="flex items-center mx-5 my-3.5 gap-2">
          <SmartCityLogo />
          <h1
            className={`${
              sidebarOpen ? "block" : "hidden"
            } text-base font-bold`}
          >
            ANS
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 overflow-auto">
        {/* Dashboard menu */}
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-3 mt-2 ml-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <DashboardIcon />
          {sidebarOpen && (
            <span className="text-base font-medium">DashBoard</span>
          )}
        </Link>
      </nav>
      {/* Sidebar Toggle Button (Moved from Header) */}
      <div className="p-4 border-t border-indigo-500">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="group p-2 border bg-white border-gray-p-80 rounded-full hover:bg-gray-200 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <span className="group-hover:hidden">
            {sidebarOpen ? <HamburgerOpenIcon /> : <HamburgerCloseIcon />}
          </span>

          <span className="hidden group-hover:inline text-red-600">
            <HamburgerHoverIcon />
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
