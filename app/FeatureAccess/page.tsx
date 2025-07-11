"use client"
import { ProjectSelector } from "@/components/FeatureAccess/ProjectSelector";
import { RoleModulesSelector } from "@/components/FeatureAccess/RoleModulesSelector";
import { SubModulePermissions } from "@/components/FeatureAccess/SubModulePermissions";
import { VERTICAL_QUERY } from "@/graphql/queries/Vertical";
import { useQuery } from "@apollo/client";
import { useState } from "react";

// const mockProjects = ["Solid Waste Management", "Smart Electricity Management", "Smart Gas Pipe Management"];
const mockModules = ["Dashboard", "POI", "Property", "Charts", "Settings", "Driver", "Vehicle"];
const mockSubModules = [
    {
        name: "Activity",
        permissions: ["Distance", "Duration", "Speed vs Time", "Battery Voltage", "Object Work Hour"]
    },
    {
        name: "Alert", permissions: ["Distance", "Duration", "Speed vs Time", "Battery Voltage", "Object Work Hour"]
    },
    { name: "Fuel" },
    { name: "Expense" },
    { name: "Tire" },
    {
        name: "Temperature", permissions: ["Distance", "Duration", "Speed vs Time", "Battery Voltage", "Object Work Hour"]
    }
];

export default function RolePermissionManager() {
    const [selectedVertical, setSelectedVertical] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Navigation */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Access Management</h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="/"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                                </svg>
                                Vehicle Dashboard
                            </a>
                            <a
                                href="/Dashboard"
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analytics Dashboard
                            </a>
                            <a
                                href="/poi"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                POI Management
                            </a>
                        </div>
                    </div>
                </div>

                {/* Feature Access Content */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="-m-6">
                <div className="grid grid-cols-11 h-full divide-x divide-gray-p-50 ">
                    <div className="col-span-2" >
                        <div className="text-base font-medium px-5 py-3.5 border-b border-b-gray-p-50">Project</div>
                        <ProjectSelector
                            selectedVertical={selectedVertical}
                            setSelectedVertical={setSelectedVertical}
                        />
                    </div>
                    <div className="col-span-3">
                        <div className="text-base font-medium px-5 py-3.5 border-b border-b-gray-p-50">Role & Modules</div>
                        <RoleModulesSelector
                            selectedRole={selectedRole}
                            setSelectedRole={setSelectedRole}
                            modules={mockModules}
                        />
                    </div>
                    <div className="col-span-6">
                        <div className="text-base font-medium px-5 py-3.5 border-b border-b-gray-p-50">Sub Modules & Permissions</div>
                        <SubModulePermissions
                            subModules={mockSubModules}
                        />
                    </div>

                </div>
            </div>
                        <div className="flex justify-end gap-2 sticky bottom-0 px-4 py-5 bg-gray-p-40 -m-6 border-t border-t-gray-300">
                            <button type="button" className="cursor-pointer bg-gray-p-60 px-5 border border-gray-p-70 py-1  rounded-full">Cancel</button>
                            <button type="submit" className="cursor-pointer bg-blue-l-60 px-5 py-1 text-white rounded-full">Save</button>
                        </div>
                    </div>
                </div>
            </div>
    );
}