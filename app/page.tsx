"use client";

import { usePostSmartVehiclesMutation } from "@/slices/smartVehicleSlice";
import React, { useEffect, useState } from "react";

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
  resellerName: string;
  region: string;
};

const VehicleTrackingDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set()
  );

  const [fetchVehicles, { data, isLoading, error }] =
    usePostSmartVehiclesMutation();

  useEffect(() => {
    // Post body object to be sent
    const postBody = {
      adminCode: "CUS-UT002",
      projectId: "16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77",
      startDate: "2025-05-10 00:00:00",
      endDate: "2025-05-19 23:59:59",
      pageNo: 1,
      pageSize: 100,
    };

    fetchVehicles(postBody);
  }, [fetchVehicles]);

  useEffect(() => {
    if (data?.data) {
      setFilteredVehicles(data.data); // Populate filteredVehicles with the fetched data
    }
  }, [data]);

  useEffect(() => {
    const filtered = filteredVehicles.filter((v) =>
      v.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [searchQuery]);

  const handleCheckboxChange = (vehicleNo: string) => {
    setSelectedVehicles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleNo)) newSet.delete(vehicleNo);
      else newSet.add(vehicleNo);
      return newSet;
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilteredVehicles(vehicles);
    setShowFilters(false);
  };

  return (
    <div className="p-0">
      <h2 className="text-2xl font-semibold mb-4">
        Vehicle Tracking Dashboard
      </h2>

      {/* Top Actions */}
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
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            Export Selected ({selectedVehicles.size})
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-300 text-black px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {/* <table className="min-w-full text-sm">
          
        </table> */}

        {/* Scrollable table body */}
        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-gray-100 text-left">
                <th className="p-2">
                  <input type="checkbox" disabled />
                </th>
                <th className="p-2">SERVER</th>
                <th className="p-2">VEHICLE NO</th>
                <th className="p-2">IMEI</th>
                <th className="p-2">STATUS</th>
                <th className="p-2">TYPE</th>
                <th className="p-2">COMPANY</th>
                <th className="p-2">BRANCH</th>
                <th className="p-2">PROJECT</th>
                <th className="p-2">INSTALLATION DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.imeiNo} className="border-t">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.has(v.vehicleNo)}
                        onChange={() => handleCheckboxChange(v.vehicleNo)}
                      />
                    </td>
                    <td className="p-2">{v.ip}</td>
                    <td className="p-2">{v.vehicleNo}</td>
                    <td className="p-2">{v.imeiNo}</td>
                    <td className="p-2">{v.status || "-"}</td>
                    <td className="p-2">{v.type || "-"}</td>
                    <td className="p-2">{v.companyName}</td>
                    <td className="p-2">{v.branchName}</td>
                    <td className="p-2">{v.projectName}</td>
                    <td className="p-2">{v.createdDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    No vehicles found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleTrackingDashboard;
