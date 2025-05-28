import { useEffect } from "react";
import {
  ElectricityManagementIcon,
  GasPipeManagementIcon,
  WasteManagementIcon,
} from "../Icons/icons";
import { VERTICAL_QUERY } from "@/graphql/queries/Vertical";
import { useQuery } from "@apollo/client";

export const ProjectSelector = ({
  selectedVertical,
  setSelectedVertical,
}: {
  selectedVertical: string;
  setSelectedVertical: (project: string) => void;
}) => {
  const {
    data: verticalData,
    loading,
    // error,
  } = useQuery(VERTICAL_QUERY, {
    variables: {
      searchText: "",
      sortBy: "VerticalName",
      sortDirection: "ASC",
    },
    fetchPolicy: "cache-first",
  });

  const renderIcon = (name: string) => {
    if (name.toLowerCase().includes("waste")) return <WasteManagementIcon />;
    if (name.toLowerCase().includes("electric"))
      return <ElectricityManagementIcon />;
    if (name.toLowerCase().includes("gas")) return <GasPipeManagementIcon />;
    return null;
  };

  useEffect(() => {
    if (
      verticalData?.verticalQuery?.getAllVerticals?.length > 0 &&
      !selectedVertical
    ) {
      setSelectedVertical(verticalData?.verticalQuery?.getAllVerticals[0]);
    }
  }, [
    verticalData?.verticalQuery?.getAllVerticals,
    selectedVertical,
    setSelectedVertical,
  ]);

  return (
    <>
      <div
        className="space-y-3 px-5 py-4 overflow-y-auto scrollbar-hide"
        style={{ height: "calc(100vh - 200px)" }}
      >
        {verticalData?.verticalQuery?.getAllVerticals?.map((vertical: any) => {
          return (
            <button
              key={vertical?.verticalId}
            //   className={`w-full flex flex-col gap-2 justify-center items-center border border-gray-p-50 bg-gray-p-40 rounded-[13px] text-gray-p-100 p-3 text-center font-normal transition-all duration-300 ${
            //     selectedVertical?.verticalId === vertical?.verticalId
            //       ? "border-purple-600"
            //       : ""
            //   }`}
              onClick={() => setSelectedVertical(vertical)}
            >
              {renderIcon(vertical?.verticalName)}
              <div className="">{vertical?.verticalName}</div>
            </button>
          );
        })}
      </div>
    </>
  );
};
