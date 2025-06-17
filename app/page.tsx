"use client";

import { usePostSmartVehiclesMutation } from "@/slices/smartVehicleSlice";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

type Vehicle = {
  ip: string;
  vehicleNo: string;
  imeiNo: number;
  companyName: string;
  status: string;
  type: string;
  branchName: string;
  projectName: string;
  createdDate: string;
};

const pageSize = 100;

const getTodayDateStrings = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return {
    startDate: `${yyyy}-${mm}-${dd} 00:00:00`,
    endDate: `${yyyy}-${mm}-${dd} 23:59:59`,
  };
};

const VehicleTrackingDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [fetchVehicles, { data, isLoading, error }] =
    usePostSmartVehiclesMutation();

  // Fetch vehicles when currentPage changes or on initial load
  useEffect(() => {
    const { startDate, endDate } = getTodayDateStrings();

    fetchVehicles({
      adminCode: "CUS-UT002",
      projectId: "16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77",
      startDate,
      endDate,
      pageNo: currentPage,
      pageSize,
    });

    // We intentionally leave fetchVehicles out of deps to avoid repeated calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Update local vehicle data when API data changes
  useEffect(() => {
    if (data?.data) {
      setVehicles(data.data);
      setFilteredVehicles(data.data);
      // Reset selections on new data fetch
      setSelectedVehicles(new Set());
    }
  }, [data]);

  // Filter local vehicles by search query (debounced or immediate)
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is empty, show all vehicles from current page data
      setFilteredVehicles(vehicles);
    } else {
      const lowered = searchQuery.toLowerCase();
      const filtered = vehicles.filter((v) =>
        Object.values(v).some((val) =>
          String(val).toLowerCase().includes(lowered)
        )
      );
      setFilteredVehicles(filtered);
    }
  }, [searchQuery, vehicles]);

  // Handle checkbox selection for individual vehicles
  const handleCheckboxChange = (imeiNo: number) => {
    setSelectedVehicles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imeiNo)) {
        newSet.delete(imeiNo);
      } else {
        newSet.add(imeiNo);
      }
      return newSet;
    });
  };

  // Select/deselect all vehicles on current page
  const paginatedVehicles = filteredVehicles.slice(0, pageSize);
  const currentImeiNos = paginatedVehicles.map((v) => v.imeiNo);
  const areAllSelected = currentImeiNos.every((imei) =>
    selectedVehicles.has(imei)
  );

  const handleSelectAllOnPage = () => {
    setSelectedVehicles((prev) => {
      const newSet = new Set(prev);
      if (areAllSelected) {
        currentImeiNos.forEach((imei) => newSet.delete(imei));
      } else {
        currentImeiNos.forEach((imei) => newSet.add(imei));
      }
      return newSet;
    });
  };

  // Export selected vehicles to Excel
  const exportSelectedVehicles = () => {
    const selected = vehicles
      .filter((v) => selectedVehicles.has(v.imeiNo))
      .map((v) => ({
        SERVER: v.ip,
        "VEHICLE NO": v.vehicleNo,
        IMEI: v.imeiNo,
        STATUS: v.status || "-",
        TYPE: v.type || "-",
        COMPANY: v.companyName,
        BRANCH: v.branchName,
        PROJECT: v.projectName,
        "INSTALLATION DATE": v.createdDate,
      }));

    if (selected.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(selected);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Vehicles");
    XLSX.writeFile(workbook, "selected_vehicles.xlsx");
  };

  // Reset search and filters
  const resetFilters = () => {
    setSearchQuery("");
    setShowFilters(false);
  };

  return (
    <div className="p-0 flex flex-col h-[calc(100vh-2rem)]">
      <h2 className="text-2xl font-semibold mb-4">
        Vehicle Tracking Dashboard
      </h2>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-1/4"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={exportSelectedVehicles}
            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Export Selected ({selectedVehicles.size})
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-300 text-black px-4 py-2 rounded cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white text-black rounded-lg shadow p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <select className="border px-2 py-2 rounded">
            <option value="">All Servers</option>
            <option value="Server1">Server1</option>
            <option value="Server2">Server2</option>
          </select>
          <select className="border px-2 py-2 rounded">
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select className="border px-2 py-2 rounded">
            <option value="">Platform</option>
            <option value="ProjectX">ProjectX</option>
            <option value="ProjectY">ProjectY</option>
          </select>
          <select className="border px-2 py-2 rounded">
            <option value="">Company</option>
            <option value="Mahamining">Mahamining</option>
          </select>
          <select className="border px-2 py-2 rounded">
            <option value="">Vehicle Type</option>
            <option value="Truck">Truck</option>
            <option value="Car">Car</option>
          </select>
        </div>
      )}

      {/* Vehicle Table */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white text-black rounded-lg shadow">
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="text-left">
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={handleSelectAllOnPage}
                  />
                </th>
                <th className="p-2">SERVER</th>
                <th className="p-2">VEHICLE NO</th>
                <th className="p-2">IMEI</th>
                {/* <th className="p-2">STATUS</th> */}
                {/* <th className="p-2">TYPE</th> */}
                <th className="p-2">COMPANY</th>
                <th className="p-2">BRANCH</th>
                <th className="p-2">PROJECT</th>
                <th className="p-2">INSTALLATION DATE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((v) => (
                  <tr key={v.imeiNo} className="border-t">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.has(v.imeiNo)}
                        onChange={() => handleCheckboxChange(v.imeiNo)}
                      />
                    </td>
                    <td className="p-2">{v.ip}</td>
                    <td className="p-2">{v.vehicleNo}</td>
                    <td className="p-2">{v.imeiNo}</td>
                    {/* <td className="p-2">{v.status || "-"}</td> */}
                    {/* <td className="p-2">{v.type || "-"}</td> */}
                    <td className="p-2">{v.companyName}</td>
                    <td className="p-2">{v.branchName}</td>
                    <td className="p-2">{v.projectName}</td>
                    <td className="p-2">{v.createdDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">
                    No vehicles found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            Previous
          </button>

          <span className="px-2">
            Page {currentPage} of {data?.totalPages || 1}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) => (p < (data?.totalPages || 1) ? p + 1 : p))
            }
            disabled={currentPage === (data?.totalPages || 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleTrackingDashboard;
