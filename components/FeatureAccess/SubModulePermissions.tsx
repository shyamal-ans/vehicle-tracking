
// components/SubModulePermissions.tsx

import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { CollapseAllIcon, ExpandAllIcon } from "../Icons/icons";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";

export function SubModulePermissions({ subModules }: {
    subModules: { name: string, permissions?: string[] }[],
}) {
    const [expanded, setExpanded] = useState<string[]>([]);

    const toggleExpand = (name: string) => {
        setExpanded((prev) =>
            prev.includes(name)
                ? prev.filter((n) => n !== name)
                : [...prev, name]
        );
    };

    const expandAll = () => {
        setExpanded(subModules.map((sub) => sub.name));
    };

    const collapseAll = () => {
        setExpanded([]);
    };
    return (
        <div className="px-5 py-4">
            <div className="flex justify-between">
                <div className="flex search w-full md:w-80 relative border border-gray-p-80 rounded-full py-2">
                    <div>
                        <FiSearch color="#A4A8BC" className="mt-1 mx-2" />
                    </div>
                    {/* {searchValue?.length > 0 && ( */}
                    {/* <Close
                             // onClick={() => {
                             //   setSearchValue("");
                             //   if (inputRef.current) {
                             //     inputRef.current.value = "";
                             //   }
                             // }}
                             className="w-2 cursor-pointer absolute top-3 right-2 flex gap-1 group"
                           /> */}
                    {/* )} */}
                    <input
                        className="border-none shadow-none focus:outline-none search-input focus:shadow-none ring-0 focus:ring-0 font-normal pr-3 flex-1"
                        type="text"
                        placeholder="Search for module or permission..."
                    // ref={inputRef}
                    // onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={expandAll} className="flex text-sm gap-2 border border-gray-200 rounded-full px-3 items-center cursor-pointer">
                        <ExpandAllIcon />
                        <span>Expand All</span>
                    </button>

                    <button onClick={collapseAll} className="flex gap-2 text-sm border border-gray-200 rounded-full px-3 items-center cursor-pointer">
                        <CollapseAllIcon />
                        <span>Collapse All</span>
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto scrollbar-hide" style={{ height: "calc(100vh - 240px)" }}>
                {subModules.map(sub => (
                    <div key={sub.name} className="border border-gray-200 my-4 rounded-xl">
                        <div
                            className="flex justify-between items-center  border border-gray-200 p-2 bg-gray-p-40 rounded-xl cursor-pointer"
                            onClick={() => toggleExpand(sub.name)}
                        >
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="h-4 w-4 accent-blue-l-60" defaultChecked onClick={(e) => e.stopPropagation()}
                                />
                                {sub.name}
                            </label>
                            {expanded.includes(sub.name) ? <BiChevronUp /> : <BiChevronDown />}
                        </div>
                        {expanded.includes(sub.name) && sub.permissions && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead>
                                        <tr className="divide-x divide-y divide-gray-200">
                                            <th className="p-2"></th>
                                            {["Full Access", "View", "Create", "Edit", "Delete"].map(p => (
                                                <th key={p} className="p-2 text-sm font-normal text-center text-gray-p-100">{p}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sub.permissions.map(p => (
                                            <tr key={p} className="border-t border-t-gray-200 divide-x divide-y divide-gray-200">
                                                <td className="p-2">{p}</td>
                                                {[...Array(5)].map((_, i) => (
                                                    <td key={i} className="px-8 py-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            defaultChecked={Math.random() > 0.3}
                                                            className="appearance-none 
                                                            h-5 w-5 
                                                            border-2 border-gray-400 
                                                            rounded-full 
                                                            relative 
                                                            transition-all 
                                                            duration-200 
                                                            cursor-pointer
                                                            checked:bg-green-l-40
                                                            checked:border-green-l-40
                                                            before:content-['✔'] 
                                                            before:absolute 
                                                            before:inset-0 
                                                            before:flex 
                                                            before:items-center 
                                                            before:justify-center 
                                                            before:text-[10px] 
                                                            before:text-gray-500 
                                                            checked:before:text-white"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}
