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

        {/* Vehicle Table menu */}
        <Link
          href="/vehicle-table"
          className="flex items-center gap-4 px-4 py-3 mt-2 ml-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1"
            />
          </svg>
          {sidebarOpen && (
            <span className="text-base font-medium">Vehicle Table</span>
          )}
        </Link>

        {/* ERP Vehicle Table menu */}
        <Link
          href="/erp-vehicle-table"
          className="flex items-center gap-4 px-4 py-3 mt-2 ml-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {sidebarOpen && (
            <span className="text-base font-medium">ERP Vehicle Table</span>
          )}
        </Link>

        <Link
          href="/vehicleinformation"
          className="flex items-center gap-4 px-4 py-3 mt-2 ml-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.5 13H5.5C4.67 13 4 12.33 4 11.5V9.5C4 8.67 4.67 8 5.5 8H6.63L7.75 4.63C7.94 4.06 8.47 3.67 9.07 3.67H14.93C15.53 3.67 16.06 4.06 16.25 4.63L17.37 8H18.5C19.33 8 20 8.67 20 9.5V11.5C20 12.33 19.33 13 18.5 13Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="7"
              cy="13"
              r="2"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <circle
              cx="17"
              cy="13"
              r="2"
              stroke="currentColor"
              stroke-width="1.5"
            />

            <circle
              cx="12"
              cy="18"
              r="5"
              fill="#3B82F6"
              stroke="#3B82F6"
              stroke-width="0.5"
            />
            <path
              d="M12 16V18.5M12 20"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <circle cx="12" cy="14.5" r="0.5" fill="white" />
          </svg>

          {sidebarOpen && (
            <span className="text-base font-medium">Vehicle Table</span>
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
