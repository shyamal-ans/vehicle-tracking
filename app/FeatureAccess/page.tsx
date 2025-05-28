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
        <>
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
        </>
    );
}