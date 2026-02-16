"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

interface VehicleTrackLog {
  altitude: number;
  battery_voltage: string;
  latitude: number;
  main_power: string;
  ignition_status: string;
  speed: string;
  no_of_satellites: string;
  vehicleNumber: string;
  location: string;
  signal_strength: string;
  longitude: number;
  timestamp: string;
  direction: number;
}

const vehicleOptions = [
  "GJ16AW9807",
  "GJ16AW9529",
  "05",
  "GJ16AW6626",
  "07",
  "GJ16AY3754",
  "GJ16AW9750",
  "20",
  "19",
  "GJ16AY3949",
  "06",
  "GJ16AW6547",
  "03",
  "GJ16AY3742",
  "ER - HR39G7908",
  "ER - 04",
  "29",
  "08",
  "36",
  "28",
  "30",
  "26",
  "27",
  "21",
  "25",
  "31",
  "32",
  "02",
  "11",
  "01",
  "GJ16AW6950",
  "12",
  "14",
  "09",
  "22",
  "16",
  "10",
  "ER - 01",
  "GJ16AW6928",
  "GJ16AW6974",
  "GJ16AY3893",
  "GJ16AW9836",
  "ER - 03",
  "ER - 3300",
  "ER - 05",
  "ER - 06",
  "ER - 02",
  "GJ16AY3514",
  "GJ16AW6759",
  "24",
  "39",
  "40",
  "GJ16AY3540",
  "04",
  "GJ16AW6936",
  "GJ16AY3592",
  "ER - HR39G1072",
  "34",
  "17",
  "18",
  "33",
  "15",
  "GJ16AW7052",
  "ER - HR39G7976",
  "35",
  "23",
  "GJ16AW9745",
  "37",
  "38",
  "GJ16AW6814",
  "GJ16AW6958",
  "GJ16AW6534",
  "GJ16AW6597",
  "13",
  "GJ16AY3747",
];

function formatDateTimeForApi(dateTimeLocal: string) {
  if (!dateTimeLocal) return "";
  const normalized = dateTimeLocal.replace("T", " ");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function getRowId(log: VehicleTrackLog, globalIndex: number) {
  return `${log.vehicleNumber}-${log.timestamp}-${globalIndex}`;
}

export default function VehicleInformation() {
  const [vehicleNo, setVehicleNo] = useState("GJ16AY3949");
  const [startDate, setStartDate] = useState("2024-11-14T00:00:00");
  const [endDate, setEndDate] = useState("2025-11-14T23:59:59");
  const [vehicleData, setVehicleData] = useState<VehicleTrackLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [isSelectionFormOpen, setIsSelectionFormOpen] = useState(false);
  const [formVehicleNo, setFormVehicleNo] = useState("GJ16AY3949");
  const [isClient, setIsClient] = useState(false);

  const totalPages = Math.max(1, Math.ceil(vehicleData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedVehicleData = vehicleData.slice(startIndex, endIndex);
  const selectedRows = vehicleData
    .map((log, index) => ({ id: getRowId(log, index), log }))
    .filter((row) => selectedRowIds.has(row.id));
  const allPageRowIds = paginatedVehicleData.map((log, index) =>
    getRowId(log, startIndex + index),
  );
  const areAllRowsOnPageSelected =
    allPageRowIds.length > 0 &&
    allPageRowIds.every((id) => selectedRowIds.has(id));

  const fetchVehicleData = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setSelectedRowIds(new Set());
    setIsSelectionFormOpen(false);

    try {
      // Step 1: Get access token using local API route
      const tokenResponse = await fetch("/api/vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenType: "generateAccessToken",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error("Token API request failed");
      }

      const authToken = tokenData?.data?.token || tokenData?.token;

      if (!authToken) {
        throw new Error("Failed to get access token");
      }

      // Step 2: Get vehicle track logs using the token via local API route
      const vehicleResponse = await fetch("/api/vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenType: "getVehicleTrackLogs",
          vehicle_no: vehicleNo,
          start_date: formatDateTimeForApi(startDate),
          end_date: formatDateTimeForApi(endDate),
          authCode: authToken,
        }),
      });

      const vehicleResponseData = await vehicleResponse.json();

      if (!vehicleResponse.ok) {
        throw new Error("Vehicle data API request failed");
      }

      if (
        vehicleResponseData.result === 1 &&
        Array.isArray(vehicleResponseData.data)
      ) {
        setVehicleData(vehicleResponseData.data);
      } else {
        setError(
          vehicleResponseData?.message ||
            "No data found for the specified vehicle",
        );
        setVehicleData([]);
      }
    } catch (err) {
      console.error("Error fetching vehicle data:", err);
      setError("Failed to fetch vehicle data. Please try again.");
      setVehicleData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (areAllRowsOnPageSelected) {
        allPageRowIds.forEach((id) => next.delete(id));
      } else {
        allPageRowIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const openSelectionForm = () => {
    if (selectedRows.length === 0) return;
    const firstSelectedVehicle = selectedRows[0].log.vehicleNumber;
    if (vehicleOptions.includes(firstSelectedVehicle)) {
      setFormVehicleNo(firstSelectedVehicle);
    } else {
      setFormVehicleNo(vehicleNo);
    }
    setIsSelectionFormOpen(true);
  };

  const deselectAllRows = () => {
    setSelectedRowIds(new Set());
  };

  const deselectSingleRow = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchVehicleData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col md:pt-4 md:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle Information
          </h1>
        </div>
        <div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Search Vehicle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <select
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vehicleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step={1}
            />
          </div>
        </div>
        <button
          onClick={fetchVehicleData}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Vehicle Data Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedRows.length} row(s) selected
          </div>
          <button
            onClick={openSelectionForm}
            disabled={selectedRows.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            Open Form With Selected Data
          </button>
        </div>

        {!loading && vehicleData.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {startIndex + 1}-{Math.min(endIndex, vehicleData.length)}{" "}
              of {vehicleData.length} rows
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span>
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={areAllRowsOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all rows on current page"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ignition Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery Voltage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signal Strength
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedVehicleData.length > 0 ? (
                paginatedVehicleData.map((log, index) => (
                  <tr
                    key={`${log.vehicleNumber}-${log.timestamp}-${startIndex + index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.has(
                          getRowId(log, startIndex + index),
                        )}
                        onChange={() =>
                          toggleRowSelection(getRowId(log, startIndex + index))
                        }
                        aria-label={`Select row ${startIndex + index + 1}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.vehicleNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {log.timestamp}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {log.location || 'N/A'}
                                            </div>
                                        </td> */}
                    <td className="px-6 py-4 whitespace-nowrap max-w-[150px]">
                      <div
                        className="text-sm text-gray-500 truncate"
                        title={log.location || ""}
                      >
                        {log.location || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.speed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.ignition_status === "ON"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.ignition_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {log.battery_voltage}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {log.signal_strength}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {log.direction}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {loading ? "Loading..." : "No data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isClient &&
        isSelectionFormOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsSelectionFormOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Selected Data Form
                </h3>
                <button
                  onClick={() => setIsSelectionFormOpen(false)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  Close
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number
                  </label>
                  <select
                    value={formVehicleNo}
                    onChange={(e) => setFormVehicleNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {vehicleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-700">
                  Selected records:{" "}
                  <span className="font-semibold">{selectedRows.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Selected Data
                  </h4>
                  <button
                    onClick={deselectAllRows}
                    disabled={selectedRows.length === 0}
                    className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deselect All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {selectedRows.length > 0 ? (
                    selectedRows.map((row) => (
                      <div
                        key={row.id}
                        className="border border-gray-200 rounded-md p-2 bg-gray-50 flex items-start justify-between gap-2"
                      >
                        <div className="text-xs text-gray-700">
                          <div className="font-semibold">
                            {row.log.vehicleNumber}
                          </div>
                          <div>{row.log.timestamp}</div>
                        </div>
                        <button
                          onClick={() => deselectSingleRow(row.id)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md p-3">
                      No rows selected.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </>,
          document.body,
        )}
    </main>
  );
}
