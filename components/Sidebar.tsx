"use client";
// import { useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
// import {
//   BiChevronDown,
//   BiChevronUp,
// } from 'react-icons/bi';
import {
  // FiHome,
  // FiSettings,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";
import { DashboardIcon, FeatureAccessIcon, SmartCityLogo } from "./Icons/icons";

const Sidebar = ({
  sidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };
  // const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  // const toggleMenu = (menu: string) => {
  //   setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  // };

  return (
    <aside
      className={`${sidebarOpen ? "w-72" : "w-16"
        } bg-pvBlue text-white transition-width duration-300 flex flex-col fixed top-0 left-0 h-screen z-20`}
    >
      {/* Header */}
      <div className="bg-pvLightBlue">
        <div className="flex items-center mx-5 my-3.5 gap-2">
          <SmartCityLogo />
          <h1 className={`${sidebarOpen ? "block" : "hidden"} text-base font-bold`}>
            ANS
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 overflow-auto">
        {/* Dashboard menu */}
        {/* <div className="px-2">
          <button
            onClick={() => toggleMenu('dashboard')}
            className="w-full flex justify-between items-center px-4 py-3 hover:bg-indigo-500 transition-colors rounded"
          >
            <div className="flex items-center gap-4">
              <FiHome size={22} />
              {sidebarOpen && <span className="text-lg font-medium">Dashboard</span>}
            </div>
            {sidebarOpen && (
              openMenus['dashboard'] ? (
                <BiChevronUp size={18} />
              ) : (
                <BiChevronDown size={18} />
              )
            )}
          </button>
          {openMenus['dashboard'] && sidebarOpen && (
            <div className="ml-12 mt-2 space-y-1 text-sm text-indigo-200">
              <Link href="/dashboard" className="block hover:text-white">
                Overview
              </Link>
              <Link href="/dashboard/analytics" className="block hover:text-white">
                Analytics
              </Link>
            </div>
          )}
        </div> */}

        {/* Users menu (no submenu) */}
        <Link
          href="/"
          className="flex items-center gap-4 px-4 py-3 mt-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <DashboardIcon />
          {sidebarOpen && (
            <span className="text-base font-medium">DashBoard</span>
          )}
        </Link>
         
        {/*<Link
          href="/FeatureAccess"
          className="flex items-center gap-4 px-4 py-3 mt-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <FeatureAccessIcon />
          {sidebarOpen && <span className="text-base font-medium">Feature Access</span>}
        </Link> */}

        {/* Analytics menu (no submenu) */}
        {/* <Link
          href="/poi"
          className="flex items-center gap-4 px-4 py-3 mt-2 hover:bg-indigo-500 rounded transition-colors"
        >
          <FiBarChart2 size={22} />
          {sidebarOpen && <span className="text-base font-medium">POI</span>}
        </Link> */}

        {/* Settings menu */}
        {/* <div className="px-2 mt-2">
          <button
            onClick={() => toggleMenu('settings')}
            className="w-full flex justify-between items-center px-4 py-3 hover:bg-indigo-500 transition-colors rounded"
          >
            <div className="flex items-center gap-4">
              <FiSettings size={22} />
              {sidebarOpen && <span className="text-lg font-medium">Settings</span>}
            </div>
            {sidebarOpen && (
              openMenus['settings'] ? (
                <BiChevronUp size={18} />
              ) : (
                <BiChevronDown size={18} />
              )
            )}
          </button>
          {openMenus['settings'] && sidebarOpen && (
            <div className="ml-12 mt-2 space-y-1 text-sm text-indigo-200">
              <Link href="/settings/profile" className="block hover:text-white">
                Profile
              </Link>
              <Link href="/settings/account" className="block hover:text-white">
                Account
              </Link>
            </div>
          )}
        </div> */}
      </nav>

      {/* Logout button */}
      {/* <div className="p-4 border-t border-indigo-500">
        <button
          className="flex items-center gap-3 w-full px-4 py-2 rounded bg-indigo-700 hover:bg-indigo-600 transition"
          onClick={handleLogout}
        >
          <FiLogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div> */}
    </aside>
  );
};

export default Sidebar;
