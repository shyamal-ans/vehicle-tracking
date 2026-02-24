"use client";

import { useState, useEffect, useMemo, type UIEvent } from "react";
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
  "Demo"
];

const vehicleImeiMap: Record<string, string> = {
  "GJ16AW9807": "353742371885617",
  "GJ16AW9529": "353742370083107",
  "05": "353742371882069",
  "GJ16AW6626": "353742371885401",
  "07": "353742371890625",
  "GJ16AY3754": "353742370068918",
  "GJ16AW9750": "353742370076333",
  "20": "353742371877911",
  "19": "353742371877986",
  "GJ16AY3949": "353742371890708",
  "06": "353742371890716",
  "GJ16AW6547": "353742371885864",
  "03": "353742371885500",
  "GJ16AY3742": "353742371885492",
  "ER - HR39G7908": "353742375220951",
  "ER - 04": "353742371877366",
  "29": "353742371741851",
  "08": "353742371890633",
  "36": "353742371885591",
  "28": "353742371891201",
  "30": "353742371885120",
  "26": "353742371877192",
  "27": "353742371877523",
  "21": "353742371877275",
  "25": "353742371877341",
  "31": "353742371877424",
  "32": "353742371878190",
  "02": "353742371890682",
  "11": "353742371888017",
  "01": "353742371890872",
  "GJ16AW6950": "353742371885757",
  "12": "353742371877481",
  "14": "353742371878364",
  "09": "353742371884768",
  "22": "353742371877457",
  "16": "353742371885583",
  "10": "353742371891367",
  "ER - 01": "353742371891789",
  "GJ16AW6928": "353742371885260",
  "GJ16AW6974": "353742371882077",
  "GJ16AY3893": "353742371885674",
  "GJ16AW9836": "353742370076325",
  "ER - 03": "353742371885716",
  "ER - 3300": "353742371877127",
  "ER - 05": "353742371877838",
  "ER - 06": "353742371882234",
  "ER - 02": "353742370068942",
  "GJ16AY3514": "353742371890773",
  "GJ16AW6759": "353742371885328",
  "24": "353742371885518",
  "39": "353742370069007",
  "40": "353742370076424",
  "GJ16AY3540": "353742371885435",
  "04": "353742371885351",
  "GJ16AW6936": "353742371890856",
  "GJ16AY3592": "353742371885575",
  "ER - HR39G1072": "353742371877408",
  "34": "353742371891441",
  "17": "353742371891607",
  "18": "353742370080665",
  "33": "353742370068983",
  "15": "353742371877374",
  "GJ16AW7052": "353742371890609",
  "ER - HR39G7976": "353742371891375",
  "35": "353742371885740",
  "23": "353742371877432",
  "GJ16AW9745": "353742371877333",
  "37": "353742371877358",
  "38": "353742371885666",
  "GJ16AW6814": "353742371745332",
  "GJ16AW6958": "353742370076432",
  "GJ16AW6534": "353742371890799",
  "GJ16AW6597": "353742371885955",
  "13": "353742371888009",
  "GJ16AY3747": "353742371890781",
  "Demo" : "123"
};

function formatDateTimeForApi(dateTimeLocal: string) {
  if (!dateTimeLocal) return "";
  const normalized = dateTimeLocal.replace("T", " ");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function getRowId(log: VehicleTrackLog, globalIndex: number) {
  return `${log.vehicleNumber}-${log.timestamp}-${globalIndex}`;
}

function toSafeString(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
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
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const selectedPreviewPageSize = 200;
  const [visibleSelectedCount, setVisibleSelectedCount] =
    useState(selectedPreviewPageSize);

  const totalPages = Math.max(1, Math.ceil(vehicleData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedVehicleData = vehicleData.slice(startIndex, endIndex);
  const selectedCount = selectedRowIds.size;
  const areAllRowsSelected =
    vehicleData.length > 0 && selectedCount === vehicleData.length;
  const selectedRowsPreview = useMemo(() => {
    if (!isSelectionFormOpen || selectedCount === 0) return [];
    const targetCount = Math.min(visibleSelectedCount, selectedCount);
    const rows: { id: string; log: VehicleTrackLog }[] = [];
    for (let index = 0; index < vehicleData.length; index += 1) {
      if (rows.length >= targetCount) break;
      const log = vehicleData[index];
      const rowId = getRowId(log, index);
      if (selectedRowIds.has(rowId)) {
        rows.push({ id: rowId, log });
      }
    }
    return rows;
  }, [isSelectionFormOpen, selectedCount, selectedRowIds, vehicleData, visibleSelectedCount]);
  const hasMoreSelectedRows = selectedRowsPreview.length < selectedCount;

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

  const toggleSelectAllRows = () => {
    setSelectedRowIds((prev) => {
      if (vehicleData.length === 0) return prev;
      if (prev.size === vehicleData.length) {
        return new Set();
      }
      const next = new Set<string>();
      for (let index = 0; index < vehicleData.length; index += 1) {
        next.add(getRowId(vehicleData[index], index));
      }
      return next;
    });
  };

  const openSelectionForm = () => {
    if (selectedCount === 0) return;
    setUpdateMessage(null)
    let firstSelectedVehicle = vehicleNo;
    for (let index = 0; index < vehicleData.length; index += 1) {
      const rowId = getRowId(vehicleData[index], index);
      if (selectedRowIds.has(rowId)) {
        firstSelectedVehicle = vehicleData[index].vehicleNumber;
        break;
      }
    }
    if (vehicleOptions.includes(firstSelectedVehicle)) {
      setFormVehicleNo(firstSelectedVehicle);
    } else {
      setFormVehicleNo(vehicleNo);
    }
    setVisibleSelectedCount(Math.min(selectedPreviewPageSize, selectedCount));
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

  const handleUpdateAllData = async () => {
    setUpdateMessage(null);

    if (!selectedCount) {
      setUpdateMessage("Please select at least one row to update.");
      return;
    }

    const imeiNo = vehicleImeiMap[formVehicleNo];
    if (!imeiNo) {
      setUpdateMessage("IMEI not found for selected vehicle.");
      return;
    }

    const transformedPayload = [];
    for (let index = 0; index < vehicleData.length; index += 1) {
      const log = vehicleData[index];
      const rowId = getRowId(log, index);
      if (!selectedRowIds.has(rowId)) continue;

      const latitude = Number(log.latitude || 0);
      const longitude = Number(log.longitude || 0);

      transformedPayload.push({
        imei_no: imeiNo,
        lattitude: toSafeString(Math.abs(latitude)),
        longitude: toSafeString(Math.abs(longitude)),
        lattitude_direction: latitude < 0 ? "S" : "N",
        longitude_direction: longitude < 0 ? "W" : "E",
        speed: toSafeString(log.speed),
        digital_port1: "1",
        digital_port2: "1",
        digital_port3: "1",
        digital_port4: "1",
        analog_port1: "7293",
        analog_port2: "7293",
        angle: toSafeString(log.direction),
        satellite: toSafeString(log.no_of_satellites),
        time: toSafeString(log.timestamp),
        battery_voltage: toSafeString(log.battery_voltage),
        gps_validity: "A",
        main_power_supply: toSafeString(log.main_power || "0"),
        vehicle_battery: "0",
        lock1: "0",
        lock2: "0",
        track_mode: "0",
        movement: "0",
        alarm_status: "NOR",
        vts_box: "1",
        internal_battery_voltage: "1",
        odometer_cumulative: "0.0",
        odometer_non_cumulative: "0.0",
      });
    }

    setUpdateLoading(true);
    try {
      const response = await fetch("/api/vehicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenType: "pushVehicleData",
          payloadData: transformedPayload,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData?.error || "Failed to update data");
      }

      setUpdateMessage(
        `${responseData?.message} Sent ${transformedPayload.length} record(s).` || `Data updated successfully. Sent ${transformedPayload.length} record(s).`,
      );
    } catch (err) {
      setUpdateMessage(`Update failed: ${String(err)}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const loadMoreSelectedRows = () => {
    setVisibleSelectedCount((prev) =>
      Math.min(prev + selectedPreviewPageSize, selectedCount),
    );
  };

  const handleSelectedListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasMoreSelectedRows) return;
    const element = event.currentTarget;
    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (remaining < 80) {
      loadMoreSelectedRows();
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchVehicleData();
  }, []);

  useEffect(() => {
    if (!isSelectionFormOpen) return;
    setVisibleSelectedCount(Math.min(selectedPreviewPageSize, selectedCount));
  }, [isSelectionFormOpen, selectedCount]);

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
            {selectedCount} row(s) selected
          </div>
          <button
            onClick={openSelectionForm}
            disabled={selectedCount === 0}
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
                    checked={areAllRowsSelected}
                    onChange={toggleSelectAllRows}
                    aria-label="Select all rows"
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
                  <span className="font-semibold">{selectedCount}</span>
                </div>

                <button
                  onClick={handleUpdateAllData}
                  disabled={updateLoading || selectedCount === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {updateLoading ? "Updating..." : "Update All Data"}
                </button>

                {updateMessage && (
                  <div className="text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-md p-2">
                    {updateMessage}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Selected Data
                  </h4>
                  <button
                    onClick={deselectAllRows}
                    disabled={selectedCount === 0}
                    className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deselect All
                  </button>
                </div>

                <div
                  className="max-h-72 overflow-y-auto space-y-2 pr-1"
                  onScroll={handleSelectedListScroll}
                >
                  {selectedCount > 0 ? (
                    selectedRowsPreview.map((row) => (
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
                  {selectedCount > 0 && (
                    <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-md p-3">
                      Showing {selectedRowsPreview.length} of {selectedCount}{" "}
                      selected rows.
                      {hasMoreSelectedRows ? " Scroll down to load more." : ""}
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
