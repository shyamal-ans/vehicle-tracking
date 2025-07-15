"use client";

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
  uniqueId?: string;
};

// 1. Change the default pageSize from 100 to 1000
const pageSize = 1000;

const VehicleTrackingDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

  // Manual data fetching - no Redux queries
  const [storedData, setStoredData] = useState<any>(null);
  const [isLoadingStored, setIsLoadingStored] = useState(true);
  const [storedError, setStoredError] = useState<any>(null);

  // Fetch all data in chunks
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoadingStored(true);
        const startTime = Date.now();
        
        let allVehicles: Vehicle[] = [];
        let page = 1;
        const pageSize = 10000; // 10k vehicles per request
        
        while (true) {
          const response = await fetch(`/api/vehicles/stored?page=${page}&pageSize=${pageSize}`);
          const data = await response.json();
          
          if (!data.success) {
            throw new Error('Failed to fetch data');
          }
          
          // Add unique IDs to prevent duplicate key errors
          const vehiclesWithIds = data.data.map((vehicle: Vehicle, index: number) => ({
            ...vehicle,
            uniqueId: `${vehicle.imeiNo}-${vehicle.vehicleNo}-${page}-${index}`
          }));
          
          allVehicles = [...allVehicles, ...vehiclesWithIds];
          
          console.log(`📄 Loaded page ${page}: ${data.data.length} vehicles (${allVehicles.length} total)`);
          
          // Check if we have more pages
          if (!data.pagination.hasMore) {
            break;
          }
          
          page++;
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`⚡ Frontend loaded all ${allVehicles.length} vehicles in ${totalTime}ms`);
        
        setStoredData({ 
          success: true, 
          data: allVehicles,
          loadTime: `${totalTime}ms`
        });
        
      } catch (error) {
        setStoredError(error);
      } finally {
        setIsLoadingStored(false);
      }
    };

    fetchAllData();
  }, []);

  // Manual refetch function
  const refetchStored = async () => {
    try {
      setIsLoadingStored(true);
      const startTime = Date.now();
      
      let allVehicles: Vehicle[] = [];
      let page = 1;
      const pageSize = 10000;
      
      while (true) {
        const response = await fetch(`/api/vehicles/stored?page=${page}&pageSize=${pageSize}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error('Failed to fetch data');
        }
        
        const vehiclesWithIds = data.data.map((vehicle: Vehicle, index: number) => ({
          ...vehicle,
          uniqueId: `${vehicle.imeiNo}-${vehicle.vehicleNo}-${page}-${index}`
        }));
        
        allVehicles = [...allVehicles, ...vehiclesWithIds];
        
        if (!data.pagination.hasMore) {
          break;
        }
        
        page++;
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`🔄 Refetched ${allVehicles.length} vehicles in ${totalTime}ms`);
      
      setStoredData({ 
        success: true, 
        data: allVehicles,
        loadTime: `${totalTime}ms`
      });
    } catch (error) {
      setStoredError(error);
    } finally {
      setIsLoadingStored(false);
    }
  };

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

  // Compute filter options from stored data
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Compute filter options when data changes - optimized with useMemo
  const computedFilterOptions = React.useMemo(() => {
    if (!storedData?.data || storedData.data.length === 0) {
      return null;
    }

    const vehicles = storedData.data;
    
    // Extract unique values for each filter
    const servers = Array.from(new Set(vehicles.map((v: Vehicle) => v.ip))).sort();
    const companies = Array.from(new Set(vehicles.map((v: Vehicle) => v.companyName))).sort();
    const platforms = Array.from(new Set(vehicles.map((v: Vehicle) => v.projectName))).sort();
    const regions = Array.from(new Set(vehicles.map((v: Vehicle) => v.region))).sort();
    const projects = Array.from(new Set(vehicles.map((v: Vehicle) => v.projectName))).sort();

    const options = {
      success: true,
      data: {
        servers,
        companies,
        platforms,
        regions,
        projects
      },
      timestamp: new Date().toISOString(),
      source: 'computed'
    };

    console.log('🔧 Filter options computed from data:', {
      servers: servers.length,
      companies: companies.length,
      platforms: platforms.length,
      regions: regions.length,
      projects: projects.length
    });

    return options;
  }, [storedData]);

  // Update filter options state
  useEffect(() => {
    setFilterOptions(computedFilterOptions);
  }, [computedFilterOptions]);

  // Manual trigger fetch function
  const triggerFetch = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/cron/fetch-vehicles', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Manual fetch completed:', result);
      
      // Invalidate Vercel Edge Cache
      try {
        await fetch('/api/vehicles/stored', { method: 'POST' });
        console.log('🔄 Vercel Edge Cache invalidated');
      } catch (cacheError) {
        console.warn('⚠️ Failed to invalidate cache:', cacheError);
      }
      
      // Refetch the main data after manual fetch
      await refetchStored();
    } catch (error) {
      console.error('❌ Manual fetch failed:', error);
      // Don't throw the error, just log it
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch data if no data is present
  useEffect(() => {
    if (!hasAutoFetched && !isLoadingStored && storedData && storedData.data.length === 0) {
      console.log('📁 No vehicle data found. Auto-fetching...');
      setHasAutoFetched(true);
      
      // Try to trigger fetch, but don't fail if it doesn't work
      triggerFetch()
        .then(() => {
          console.log('✅ Auto-fetch completed successfully');
        })
        .catch((error: any) => {
          console.warn('⚠️ Auto-fetch failed (this is normal if no cron endpoint exists):', error);
          // Don't show error to user, this is expected behavior
        });
    }
  }, [storedData, isLoadingStored, hasAutoFetched, triggerFetch, refetchStored]);

  // Store all data and apply client-side filtering
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  // Update all vehicles when data changes
  useEffect(() => {
    if (storedData?.data) {
      setAllVehicles(storedData.data);
      console.log('🔄 All data loaded:', storedData.data.length, 'vehicles');
    }
  }, [storedData]);

  // Client-side filtering and pagination - optimized with useMemo
  const filteredAndPaginatedData = React.useMemo(() => {
    if (allVehicles.length === 0) {
      return { vehicles: [], total: 0, totalPages: 1 };
    }

    let filteredData = [...allVehicles];
    
    // Apply search filter
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filteredData = filteredData.filter(vehicle =>
        Object.values(vehicle).some((val) =>
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply server filter (IP)
    if (filters.server) {
      filteredData = filteredData.filter(vehicle =>
        vehicle.ip.toLowerCase().includes(filters.server.toLowerCase())
      );
    }
    
    // Apply status filter (InActiveDays)
    if (filters.status) {
      if (filters.status === "Active") {
        filteredData = filteredData.filter(vehicle => vehicle.InActiveDays === 0);
      } else if (filters.status === "Inactive") {
        filteredData = filteredData.filter(vehicle => vehicle.InActiveDays > 0);
      }
    }
    
    // Apply platform filter (projectName)
    if (filters.platform) {
      filteredData = filteredData.filter(vehicle =>
        vehicle.projectName.toLowerCase().includes(filters.platform.toLowerCase())
      );
    }
    
    // Apply company filter
    if (filters.company) {
      filteredData = filteredData.filter(vehicle =>
        vehicle.companyName.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    
    // Apply region filter
    if (filters.region) {
      filteredData = filteredData.filter(vehicle =>
        vehicle.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }
    
    // Apply project filter (projectName)
    if (filters.project) {
      filteredData = filteredData.filter(vehicle =>
        vehicle.projectName.toLowerCase().includes(filters.project.toLowerCase())
      );
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      vehicles: paginatedData,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / pageSize)
    };
  }, [debouncedSearchQuery, filters, allVehicles, currentPage, pageSize]);

  // Update state when filtered data changes
  useEffect(() => {
    setVehicles(filteredAndPaginatedData.vehicles);
    setTotalVehicles(filteredAndPaginatedData.total);
    setTotalPages(filteredAndPaginatedData.totalPages);
    
    console.log('🔍 Filter results:', filteredAndPaginatedData.total, 'vehicles, page', currentPage);
  }, [filteredAndPaginatedData, currentPage]);

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

  // Export filtered vehicles to Excel (client-side)
  const exportSelectedVehicles = async () => {
    try {
      // Get the currently filtered data (same logic as display)
      let filteredData = [...allVehicles];
      
      // Apply search filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        filteredData = filteredData.filter(vehicle =>
          Object.values(vehicle).some((val) =>
            String(val).toLowerCase().includes(searchLower)
          )
        );
      }
      
      // Apply all other filters
      if (filters.server) {
        filteredData = filteredData.filter(vehicle =>
          vehicle.ip.toLowerCase().includes(filters.server.toLowerCase())
        );
      }
      
      if (filters.status) {
        if (filters.status === "Active") {
          filteredData = filteredData.filter(vehicle => vehicle.InActiveDays === 0);
        } else if (filters.status === "Inactive") {
          filteredData = filteredData.filter(vehicle => vehicle.InActiveDays > 0);
        }
      }
      
      if (filters.platform) {
        filteredData = filteredData.filter(vehicle =>
          vehicle.projectName.toLowerCase().includes(filters.platform.toLowerCase())
        );
      }
      
      if (filters.company) {
        filteredData = filteredData.filter(vehicle =>
          vehicle.companyName.toLowerCase().includes(filters.company.toLowerCase())
        );
      }
      
      if (filters.region) {
        filteredData = filteredData.filter(vehicle =>
          vehicle.region.toLowerCase().includes(filters.region.toLowerCase())
        );
      }
      
      if (filters.project) {
        filteredData = filteredData.filter(vehicle =>
          vehicle.projectName.toLowerCase().includes(filters.project.toLowerCase())
        );
      }

      // Create export data
      const exportData = filteredData.map((v: Vehicle) => ({
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
      
      // Use appropriate filename based on filters
      const filename = filtersActive ? "filtered_vehicles.xlsx" : "all_vehicles.xlsx";
      const sheetName = filtersActive ? "Filtered Vehicles" : "All Vehicles";
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, filename);
      
      console.log(`📊 Exported ${exportData.length} vehicles to ${filename}`);
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
                    {filterOptions?.data?.servers?.map((server: string) => (
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
                    {filterOptions?.data?.platforms?.map((platform: string) => (
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
                    {filterOptions?.data?.companies?.map((company: string) => (
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
                    {filterOptions?.data?.regions?.map((region: string) => (
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
                    {filterOptions?.data?.projects?.map((project: string) => (
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

        {/* Loading and Error Display */}
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-blue-800 font-medium">
                  {isFetching ? "Fetching latest data..." : "Loading vehicle data..."}
                </p>
                <p className="text-blue-600 text-sm">
                  {storedData?.data?.length > 0 && `Loaded ${storedData.data.length.toLocaleString()} vehicles`}
                </p>
                {storedData?.loadTime && (
                  <p className="text-blue-500 text-xs">
                    API load time: {storedData.loadTime}
                    {storedData.source === 'memory' && ' (from memory cache)'}
                    {storedData.source === 'redis' && ' (from Redis)'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
                    <tr key={v.uniqueId || `${v.imeiNo}-${v.vehicleNo}`} className="hover:bg-gray-50 transition-colors">
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
