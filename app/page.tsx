"use client";

import { useGetStoredVehiclesQuery, useGetFilterOptionsQuery, useTriggerVehicleFetchMutation } from "@/slices/smartVehicleSlice";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { formatDateTime } from "@/Utils/Utils";

type Vehicle = {
  vehicleName: string;
  resellerName: string;
  ip: string;
  companyName: string;
  branchName: string;
  InActiveDays: number;
  adminName: string;
  vehicleNo: string;
  createdDate: string;
  imeiNo: number;
  projectName: string;
  region: string;
  projectId: string;
  simNo: string;
  username: string;
  status?: string;
  type?: string;
  fetchedAt?: string;
  startDate?: string;
  endDate?: string;
};

// 1. Change the default pageSize from 100 to 1000
const pageSize = 1000;

const VehicleTrackingDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehiclesCache, setAllVehiclesCache] = useState<Vehicle[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    server: "",
    status: "",
    platform: "",
    company: "",
    region: "",
    project: ""
  });

  // Sorting state and logic
  const [sortConfig, setSortConfig] = useState<{ key: keyof Vehicle | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const handleSort = (key: keyof Vehicle) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedVehicles = React.useMemo(() => {
    if (!sortConfig.key) return vehicles;
    const key = sortConfig.key;
    const sorted = [...vehicles].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue === undefined || bValue === undefined) return 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return sorted;
  }, [vehicles, sortConfig]);

  // Query for stored vehicle data with pagination and filters (without search)
  const { 
    data: storedData, 
    isLoading: isLoadingStored, 
    error: storedError,
    refetch: refetchStored
  } = useGetStoredVehiclesQuery({
    search: "", // Remove search from API call
    page: currentPage,
    pageSize,
    server: filters.server,
    status: filters.status,
    platform: filters.platform,
    company: filters.company,
    region: filters.region,
    project: filters.project,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debug search functionality
  useEffect(() => {
    console.log('🔍 Search query changed:', searchQuery);
    console.log('🔍 Debounced search query:', debouncedSearchQuery);
    console.log('🔍 Current filters:', filters);
  }, [searchQuery, debouncedSearchQuery, filters]);

  // Query for filter options
  const { data: filterOptions } = useGetFilterOptionsQuery();

  // Mutation to trigger manual data fetch
  const [triggerFetch, { isLoading: isFetching }] = useTriggerVehicleFetchMutation();

  // Auto-fetch data if no data is present
  useEffect(() => {
    if (!hasAutoFetched && !isLoadingStored && storedData && storedData.data.length === 0) {
      console.log('📁 No vehicle data found. Auto-fetching...');
      setHasAutoFetched(true);
      triggerFetch().unwrap()
        .then((result) => {
          console.log('✅ Auto-fetch completed successfully:', result);
          refetchStored();
        })
        .catch((error) => {
          console.error('❌ Auto-fetch failed:', error);
          // Don't show error to user, just log it
        });
    }
  }, [storedData, isLoadingStored, hasAutoFetched, triggerFetch, refetchStored]);

  // Update local vehicle data when stored data changes (only when not searching)
  useEffect(() => {
    if (storedData?.data && !debouncedSearchQuery) {
      setVehicles(storedData.data);
      setTotalVehicles(storedData.pagination?.total || 0);
      setTotalPages(storedData.pagination?.totalPages || 1);
      
      // Do NOT reset selections here!
      // setSelectedVehicles(new Set());
      
      // Update cache with fresh data if no filters are applied
      if (Object.values(filters).every(filter => !filter) && !searchQuery) {
        // Update cache with fresh data instead of clearing it
        setAllVehiclesCache(storedData.data);
        localStorage.setItem('vehicleCache', JSON.stringify(storedData.data));
        localStorage.setItem('vehicleCacheTimestamp', Date.now().toString());
        console.log('🔄 Cache updated with fresh data:', storedData.data.length, 'vehicles');
      }
    }
  }, [storedData, filters, debouncedSearchQuery, searchQuery]);

  // Search in cache when available
  useEffect(() => {
    if (allVehiclesCache.length > 0 && debouncedSearchQuery) {
      console.log('🔍 Searching in cache:', debouncedSearchQuery);
      const searchLower = debouncedSearchQuery.toLowerCase();
      const filteredData = allVehiclesCache.filter(vehicle =>
        Object.values(vehicle).some((val) =>
          String(val).toLowerCase().includes(searchLower)
        )
      );
      
      // Apply pagination to search results
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setVehicles(paginatedData);
      setTotalVehicles(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      console.log('🔍 Search results:', filteredData.length, 'vehicles found, showing page', currentPage);
    } else if (allVehiclesCache.length > 0 && !debouncedSearchQuery) {
      // No search query - show normal paginated data from API
      if (storedData?.data) {
        setVehicles(storedData.data);
        setTotalVehicles(storedData.pagination?.total || 0);
        setTotalPages(storedData.pagination?.totalPages || 1);
      }
    }
  }, [debouncedSearchQuery, allVehiclesCache, pageSize, currentPage, storedData]);

  // Function to populate cache with all vehicle data
  const populateCache = async () => {
    if (allVehiclesCache.length === 0) {
      try {
        const response = await fetch('/api/vehicles/stored?pageSize=999999&page=1');
        const data = await response.json();
        if (data.success) {
          setAllVehiclesCache(data.data);
          // Save to localStorage for persistence
          localStorage.setItem('vehicleCache', JSON.stringify(data.data));
          localStorage.setItem('vehicleCacheTimestamp', Date.now().toString());
          console.log('📦 Cache populated and saved to localStorage:', data.data.length, 'vehicles');
        }
      } catch (error) {
        console.error('Error populating cache:', error);
      }
    }
  };

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Export selected vehicles to Excel
  const exportSelectedVehicles = async () => {
    // If nothing is selected, treat as 'export all filtered'
    const isExportAllFiltered = true; // Always true now

    try {
      // If no filters and export all, use cache
      const isExportingAll = Object.values(filters).every(filter => !filter) && !searchQuery && (isExportAllFiltered || totalVehicles > 0);
      if (isExportingAll) {
        if (allVehiclesCache.length === 0) {
          await populateCache();
        }
        const allVehicles = allVehiclesCache;
          const exportData = allVehicles.map((v: Vehicle) => ({
            "Vehicle Name": v.vehicleName,
            Reseller: v.resellerName,
            IP: v.ip,
            Company: v.companyName,
            Branch: v.branchName,
            "Inactive Days": v.InActiveDays,
            Admin: v.adminName,
            "Vehicle No": v.vehicleNo,
            "Created Date": v.createdDate,
            IMEI: v.imeiNo,
            Project: v.projectName,
            Region: v.region,
            "Project ID": v.projectId,
            "SIM No": v.simNo,
            Username: v.username,
            "Fetched At": v.fetchedAt ? formatDateTime(v.fetchedAt) : "-",
            "Start Date": v.startDate || "-",
            "End Date": v.endDate || "-",
          }));

          const worksheet = XLSX.utils.json_to_sheet(exportData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "All Vehicles");
          XLSX.writeFile(workbook, "all_vehicles.xlsx");
        return;
      }

      // If filters applied, fetch all filtered vehicles
      const filterParams = new URLSearchParams({
        pageSize: '999999',
        page: '1',
        ...(filters.server && { server: filters.server }),
        ...(filters.status && { status: filters.status }),
        ...(filters.platform && { platform: filters.platform }),
        ...(filters.company && { company: filters.company }),
        ...(filters.region && { region: filters.region }),
        ...(filters.project && { project: filters.project }),
        ...(searchQuery && { search: searchQuery }),
      });
      const response = await fetch(`/api/vehicles/stored?${filterParams}`);
      const data = await response.json();
      if (data.success) {
        let exportData;
        if (isExportAllFiltered) {
          // Export all filtered vehicles
          exportData = data.data.map((v: Vehicle) => ({
            "Vehicle Name": v.vehicleName,
            Reseller: v.resellerName,
            IP: v.ip,
            Company: v.companyName,
            Branch: v.branchName,
            "Inactive Days": v.InActiveDays,
            Admin: v.adminName,
            "Vehicle No": v.vehicleNo,
            "Created Date": v.createdDate,
            IMEI: v.imeiNo,
            Project: v.projectName,
            Region: v.region,
            "Project ID": v.projectId,
            "SIM No": v.simNo,
            Username: v.username,
            "Fetched At": v.fetchedAt ? formatDateTime(v.fetchedAt) : "-",
            "Start Date": v.startDate || "-",
            "End Date": v.endDate || "-",
          }));
      } else {
          // Export only selected vehicles
          exportData = data.data.map((v: Vehicle) => ({
            "Vehicle Name": v.vehicleName,
            Reseller: v.resellerName,
            IP: v.ip,
            Company: v.companyName,
            Branch: v.branchName,
            "Inactive Days": v.InActiveDays,
            Admin: v.adminName,
            "Vehicle No": v.vehicleNo,
            "Created Date": v.createdDate,
            IMEI: v.imeiNo,
            Project: v.projectName,
            Region: v.region,
            "Project ID": v.projectId,
            "SIM No": v.simNo,
            Username: v.username,
            "Fetched At": v.fetchedAt ? formatDateTime(v.fetchedAt) : "-",
            "Start Date": v.startDate || "-",
            "End Date": v.endDate || "-",
          }));
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Vehicles");
        XLSX.writeFile(workbook, "selected_vehicles.xlsx");
      }
    } catch (error) {
      console.error('Error exporting vehicles:', error);
      alert('Error exporting vehicles. Please try again.');
    }
  };

  // Reset search and filters
  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setFilters({
      server: "",
      status: "",
      platform: "",
      company: "",
      region: "",
      project: ""
    });
    setShowFilters(false);
  };

  const isLoading = isLoadingStored || isFetching;
  const error = storedError;

  // Add a helper for filtersActive
  const filtersActive = Object.values(filters).some(f => f) || !!searchQuery;

  // Calculate pagination info
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + vehicles.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-x-auto overflow-y-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Tracking Dashboard</h1>
            <a
              href="/Dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics Dashboard
            </a>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles..."
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => triggerFetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isFetching ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {isFetching ? "Fetching..." : "Fetch Latest Data"}
              </button>

              <button
                onClick={exportSelectedVehicles}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {filtersActive
                  ? `Export All Filtered (${totalVehicles})`
                  : `Export All (${totalVehicles})`
                }
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {(filters.server || filters.status || filters.platform || filters.company || filters.region || filters.project) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Active Filters:</span>
              {filters.server && <span className="bg-blue-200 px-2 py-1 rounded-md text-xs">Server: {filters.server}</span>}
              {filters.status && <span className="bg-blue-200 px-2 py-1 rounded-md text-xs">Status: {filters.status}</span>}
              {filters.platform && <span className="bg-blue-200 px-2 py-1 rounded-md text-xs">Platform: {filters.platform}</span>}
              {filters.company && <span className="bg-blue-200 px-2 py-1 rounded-md text-xs">Company: {filters.company}</span>}
              {filters.region && <span className="bg-blue-200 px-2 py-1 rounded-md text-xs">Region: {filters.region}</span>}
              {filters.project && <span className="bg-blue-200 px-2 py-1 rounded-md text-xs">Project: {filters.project}</span>}
              <span className="text-blue-600 font-medium">({totalVehicles} vehicles)</span>
            </div>
          </div>
        )}

        {/* Filters Sliding Panel */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">

                {/* Server Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Server
                  </label>
                  <select
                    value={filters.server}
                    onChange={(e) => handleFilterChange("server", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Servers</option>
                    {filterOptions?.data?.servers?.map(server => (
                      <option key={server} value={server}>{server}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Platform Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={filters.platform}
                    onChange={(e) => handleFilterChange("platform", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Platforms</option>
                    {filterOptions?.data?.platforms?.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <select
                    value={filters.company}
                    onChange={(e) => handleFilterChange("company", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Companies</option>
                    {filterOptions?.data?.companies?.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange("region", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Regions</option>
                    {filterOptions?.data?.regions?.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Project Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    value={filters.project}
                    onChange={(e) => handleFilterChange("project", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Projects</option>
                    {filterOptions?.data?.projects?.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-medium">
                Error loading vehicle data: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        )}

        {/* Vehicle Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('ip')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      SERVER
                      {sortConfig.key === 'ip' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('vehicleNo')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      VEHICLE NO
                      {sortConfig.key === 'vehicleNo' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('vehicleName')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      VEHICLE NAME
                      {sortConfig.key === 'vehicleName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('imeiNo')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      IMEI
                      {sortConfig.key === 'imeiNo' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('simNo')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      SIM NO
                      {sortConfig.key === 'simNo' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('companyName')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      COMPANY
                      {sortConfig.key === 'companyName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('branchName')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      BRANCH
                      {sortConfig.key === 'branchName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('projectName')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      PROJECT
                      {sortConfig.key === 'projectName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('createdDate')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      INSTALLATION DATE
                      {sortConfig.key === 'createdDate' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('resellerName')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      RESELLER
                      {sortConfig.key === 'resellerName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('InActiveDays')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      INACTIVE DAYS
                      {sortConfig.key === 'InActiveDays' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('adminName')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      ADMIN
                      {sortConfig.key === 'adminName' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('region')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      REGION
                      {sortConfig.key === 'region' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('projectId')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      PROJECT ID
                      {sortConfig.key === 'projectId' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('username')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      USERNAME
                      {sortConfig.key === 'username' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('fetchedAt')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      FETCHED AT
                      {sortConfig.key === 'fetchedAt' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('startDate')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      START DATE
                      {sortConfig.key === 'startDate' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort('endDate')}
                      className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                    >
                      END DATE
                      {sortConfig.key === 'endDate' && (
                        <span className="text-blue-600">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={19} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <span className="text-gray-600">
                          {isFetching ? "Fetching vehicle data..." : "Loading vehicles..."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : sortedVehicles.length > 0 ? (
                  sortedVehicles.map((v) => (
                    <tr key={v.imeiNo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{v.ip}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{v.vehicleNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.vehicleName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{v.imeiNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{v.simNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.branchName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.projectName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.createdDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.resellerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          v.InActiveDays === 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {v.InActiveDays}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.adminName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{v.projectId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {v.fetchedAt ? formatDateTime(v.fetchedAt) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {v.startDate || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {v.endDate || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={19} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                        </svg>
                        <span className="text-gray-500 text-lg font-medium">No vehicles found</span>
                        <span className="text-gray-400 text-sm">Try adjusting your search or filters</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1}-{endIndex} of {totalVehicles} vehicles
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  First
                </button>
                
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => (p < totalPages ? p + 1 : p))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTrackingDashboard;
