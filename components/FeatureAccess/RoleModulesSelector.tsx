import { useQuery } from "@apollo/client";
import CustomDropdown from "../CustomDropdown";
import { GET_ALL_ROLES } from "@/graphql/Roles";
import { useEffect } from "react";

export const RoleModulesSelector = ({ selectedRole, setSelectedRole, modules }: { selectedRole: any, setSelectedRole: any, modules: string[] }) => {
    const {
        data: RolesData,
        loading,
    } = useQuery(GET_ALL_ROLES, {
        fetchPolicy: "cache-first",
    });

    useEffect(() => {
        const firstRole = RolesData?.roleQuery?.roles?.[0];
        if (firstRole && !selectedRole?.id) {
            setSelectedRole({
                id: firstRole.roleId,
                name: firstRole.roleName,
            });
        }
    }, [RolesData, selectedRole, setSelectedRole]);

    return (
        <div className="space-y-4">
            <div className="px-12 py-5 border-b border-b-gray-200 ">
                <CustomDropdown
                    options={
                        RolesData?.roleQuery?.roles?.map((role: any) => ({
                            id: role?.roleId,
                            name: role?.roleName,
                        }))
                    }
                    placeholder="Select Role"
                    loader={loading}
                    onChange={(data) => {
                        if (data === null) {
                            setSelectedRole({
                                id: "",
                                name: "",
                            });
                        } else {
                            setSelectedRole(data);
                        }
                    }}
                    value={
                        selectedRole
                            ? {
                                id: selectedRole.id,
                                name: selectedRole.name,
                            }
                            : null
                    } />
            </div>
            <div className="space-y-4 px-8 py-5 overflow-y-auto scrollbar-hide" style={{ height: "calc(100vh - 280px)" }}>
                {modules.map(module => (
                    // <label key={module} className="flex items-center gap-2">
                    //     <input type="checkbox" defaultChecked />
                    //     {module}
                    // </label>
                    <div key={module} className="flex gap-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox h-4 w-4 accent-blue-l-60" defaultChecked />
                        </label>
                        <span>{module}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}