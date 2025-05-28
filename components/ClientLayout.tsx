"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";
import { usePathname } from "next/navigation";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  return (
    <>
      {/* <div className="flex h-screen bg-gray-100 font-sans">
        {!isAuthRoute && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
        <div className="flex-1 flex flex-col">
          {!isAuthRoute && <Header sidebarOpen={sidebarOpen} />}
          <main className={`${!isAuthRoute && sidebarOpen ? "ml-64 mt-16 p-6" : "ml-16 mt-16 p-6"}`}>
            {children}
          </main>
        </div>
      </div> */}
      {!isAuthRoute ? (
        <div className="flex h-screen font-sans">
          {/* Sidebar */}
          <aside
            className={`${sidebarOpen ? "w-72" : "w-16"
              } bg-gradient-to-b from-indigo-600 to-indigo-800 text-white transition-width duration-300 flex flex-col`}
          >
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Content */}
            <main style={{ width: sidebarOpen ? "calc(100vw - 295px)" : "calc(100vw - 64px)" }} className={`p-6 h-screen`}>
              {children}

              {/* More content could go here */}
            </main>
          </div>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </>
  );
}
