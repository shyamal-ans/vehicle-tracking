"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import { formatDateTime } from "@/Utils/Utils";

type ErpVehicle = {
  Company: string;
  "activation date": string;
  Reseller: string;
  Imei: string;
  "Vehicle name": string;
  "GPS Created Date": string;
  "Vehicle Last updated DateTime": string;
  "vehicle status": string;
  Project: string;
  "Vehicle no": string;
  "Company ID": number;
  "Expiry date": string;
  Branch: string;
  "Reseller ID": number;
  "Installation date": string;
  status?: string;
  type?: string;
  fetchedAt?: string;
  startDate?: string;
  endDate?: string;
  uniqueId?: string;
};

// Optimized page size for better performance
const pageSize = 1000;

const ErpVehicleTrackingDashboard = () => {
  const [vehicles, setVehicles] = useState<ErpVehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states for all columns
  const [filters, setFilters] = useState({
    Company: "",
    "activation date": "",
    Reseller: "",
    Imei: "",
    "Vehicle name": "",
    "GPS Created Date": "",
    "Vehicle Last updated DateTime": "",
    "vehicle status": "",
    Project: "",
    "Vehicle no": "",
    "Company ID": "",
    "Expiry date": "",
    Branch: "",
    "Reseller ID": "",
    "Installation date": "",
    fetchedAt: "",
    startDate: "",
    endDate: ""
  });

  // Sorting state and logic
  const [sortConfig, setSortConfig] = useState<{ key: keyof ErpVehicle | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // Optimized sort handler with useCallback
  const handleSort = useCallback((key: keyof ErpVehicle) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  // Manual data fetching - no Redux queries
  const [storedData, setStoredData] = useState<any>(null);
  const [isLoadingStored, setIsLoadingStored] = useState(true);
  const [storedError, setStoredError] = useState<any>(null);

  // Optimized data fetching with better error handling
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoadingStored(true);
      const startTime = Date.now();
      
      const response = await fetch('/api/erp-vehicles/stored');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch ERP data');
      }
      
      // Add unique IDs to prevent duplicate key errors
      const vehiclesWithIds = data.data.map((vehicle: ErpVehicle, index: number) => ({
        ...vehicle,
        uniqueId: `${vehicle.Imei}-${vehicle["Vehicle no"]}-${index}`
      }));
      
      const totalTime = Date.now() - startTime;
      console.log(`⚡ Frontend loaded all ${vehiclesWithIds.length} ERP vehicles in ${totalTime}ms`);
      
      setStoredData({ 
        success: true, 
        data: vehiclesWithIds,
        loadTime: `${totalTime}ms`
      });
      setLastRefreshTime(new Date());
      setDataFreshness('Just loaded');
      
    } catch (error) {
      setStoredError(error);
    } finally {
      setIsLoadingStored(false);
    }
  }, []);

  // Fetch all data at once
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-fetch ERP data if no data is available
  useEffect(() => {
    if (!isLoadingStored && storedData && storedData.data.length === 0) {
      console.log('🚀 No ERP data found - auto-fetching from API...');
      handleManualRefresh();
    }
  }, [isLoadingStored, storedData]);

  // Optimized refetch function
  const refetchStored = useCallback(async () => {
    try {
      setIsLoadingStored(true);
      const startTime = Date.now();
      
      const response = await fetch('/api/erp-vehicles/stored');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch ERP data');
      }
      
      const vehiclesWithIds = data.data.map((vehicle: ErpVehicle, index: number) => ({
        ...vehicle,
        uniqueId: `${vehicle.Imei}-${vehicle["Vehicle no"]}-${index}`
      }));
      
      const totalTime = Date.now() - startTime;
      console.log(`🔄 Refetched ${vehiclesWithIds.length} ERP vehicles in ${totalTime}ms`);
      
      setStoredData({ 
        success: true, 
        data: vehiclesWithIds,
        loadTime: `${totalTime}ms`
      });
      setLastRefreshTime(new Date());
      setDataFreshness('Just refreshed');
    } catch (error) {
      setStoredError(error);
    } finally {
      setIsLoadingStored(false);
    }
  }, []);

  // Optimized debounce search query with loading indicator
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const [isFetching, setIsFetching] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [dataFreshness, setDataFreshness] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Optimized filter options computation - only compute when data changes
  const filterOptions = useMemo(() => {
    if (!storedData?.data || storedData.data.length === 0) {
      return null;
    }

    const vehicles = storedData.data;
    
    // Extract unique values for each filter using Set for better performance
    const extractUniqueValues = (key: keyof ErpVehicle) => {
      const values = new Set<string>();
      vehicles.forEach((v: ErpVehicle) => {
        const value = v[key];
        if (value !== undefined && value !== null) {
          values.add(String(value));
        }
      });
      return Array.from(values).sort();
    };

    const options = {
      success: true,
      data: {
        Company: extractUniqueValues('Company'),
        "activation date": extractUniqueValues('activation date'),
        Reseller: extractUniqueValues('Reseller'),
        Imei: extractUniqueValues('Imei'),
        "Vehicle name": extractUniqueValues('Vehicle name'),
        "GPS Created Date": extractUniqueValues('GPS Created Date'),
        "Vehicle Last updated DateTime": extractUniqueValues('Vehicle Last updated DateTime'),
        "vehicle status": extractUniqueValues('vehicle status'),
        Project: extractUniqueValues('Project'),
        "Vehicle no": extractUniqueValues('Vehicle no'),
        "Company ID": extractUniqueValues('Company ID').sort((a, b) => Number(a) - Number(b)),
        "Expiry date": extractUniqueValues('Expiry date'),
        Branch: extractUniqueValues('Branch'),
        "Reseller ID": extractUniqueValues('Reseller ID').sort((a, b) => Number(a) - Number(b)),
        "Installation date": extractUniqueValues('Installation date'),
        fetchedAt: extractUniqueValues('fetchedAt'),
        startDate: extractUniqueValues('startDate'),
        endDate: extractUniqueValues('endDate')
      },
      timestamp: new Date().toISOString(),
      source: 'computed'
    };

    return options;
  }, [storedData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!storedData?.data || storedData.data.length === 0) return;

    const interval = setInterval(async () => {
      console.log('🔄 Auto-refreshing ERP data...');
      setIsAutoRefreshing(true);
      try {
        await refetchStored();
        setDataFreshness('Auto-refreshed');
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      } finally {
        setIsAutoRefreshing(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [storedData, refetchStored]);

  // Update data freshness every minute
  useEffect(() => {
    if (!lastRefreshTime) return;

    const updateFreshness = () => {
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastRefreshTime.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        setDataFreshness('Just now');
      } else if (diffInMinutes < 60) {
        setDataFreshness(`${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`);
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        setDataFreshness(`${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`);
      }
    };

    updateFreshness();
    const interval = setInterval(updateFreshness, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  // Filter and search logic
  const filteredAndSearchedData = useMemo(() => {
    if (!storedData?.data) return [];

    let filteredData = storedData.data;

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredData = filteredData.filter((vehicle: ErpVehicle) => {
          const vehicleValue = vehicle[key as keyof ErpVehicle];
          return vehicleValue !== undefined && 
                 vehicleValue !== null && 
                 String(vehicleValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply search query
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filteredData = filteredData.filter((vehicle: ErpVehicle) => {
        return Object.values(vehicle).some(value => 
          value !== undefined && 
          value !== null && 
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }

    return filteredData;
  }, [storedData, filters, debouncedSearchQuery]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredAndSearchedData;

    return [...filteredAndSearchedData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredAndSearchedData, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage]);

  // Update pagination when data changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredAndSearchedData.length / pageSize);
    setTotalPages(totalPages);
    setTotalVehicles(filteredAndSearchedData.length);
    
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredAndSearchedData, currentPage]);

  // Handle filter change
  const handleFilterChange = useCallback((key: keyof ErpVehicle, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds:any = new Set(paginatedData.map((v: any) => v.uniqueId!));
      setSelectedRows(allIds);
      setSelectAll(true);
    } else {
      setSelectedRows(new Set());
      setSelectAll(false);
    }
  }, [paginatedData]);

  // Handle individual row selection
  const handleRowSelect = useCallback((uniqueId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(uniqueId);
      } else {
        newSet.delete(uniqueId);
      }
      return newSet;
    });
  }, []);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (!filteredAndSearchedData.length) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredAndSearchedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ERP Vehicles");
    
    const fileName = `erp-vehicles-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }, [filteredAndSearchedData]);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    try {
      setIsFetching(true);
      console.log('🔄 Starting manual ERP data refresh...');
      
      const response = await fetch('/api/cron/fetch-erp-vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overwrite: true })
      });
      
      const result = await response.json();
      console.log('📊 ERP refresh result:', result);
      
      if (response.ok && result.success) {
        await refetchStored();
        setDataFreshness('Manually refreshed');
        console.log('✅ ERP data refreshed successfully');
      } else {
        console.error('❌ ERP refresh failed:', result);
        alert(`Failed to refresh ERP data: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      alert('Failed to refresh ERP data. Please check the console for details.');
    } finally {
      setIsFetching(false);
    }
  }, [refetchStored]);

  if (isLoadingStored) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">Loading ERP vehicle data...</p>
          <p className="mt-2 text-gray-500">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (storedError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4 text-lg font-medium">Error loading ERP vehicle data</p>
          <p className="text-gray-600 mb-6">There was an issue connecting to the data source</p>
          <button 
            onClick={fetchAllData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ERP Vehicle Tracking Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  {totalVehicles.toLocaleString()} vehicles • Last updated: {dataFreshness}
                  {isAutoRefreshing && <span className="ml-2 text-blue-600">🔄 Auto-refreshing...</span>}
                  {isFetching && <span className="ml-2 text-blue-600">🔄 Fetching from ERP API...</span>}
                </p>
              </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleManualRefresh}
                disabled={isFetching}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isFetching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    🔄 Refresh Data
                  </>
                )}
              </button>
              
              <button
                onClick={exportToExcel}
                disabled={!filteredAndSearchedData.length}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                📊 Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Global Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all columns..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {paginatedData.length} of {totalVehicles.toLocaleString()} vehicles
              {debouncedSearchQuery && ` (filtered by "${debouncedSearchQuery}")`}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-1 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {Object.keys(filters).map((key) => (
                    <th
                      key={key}
                      className="px-1 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                                              <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleSort(key as keyof ErpVehicle)}
                          className="flex items-center gap-1 group focus:outline-none hover:text-gray-700 transition-colors"
                        >
                          {key}
                          {sortConfig.key === key && (
                            <span className="text-blue-600">
                              {sortConfig.direction === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </button>
                        <select
                          value={filters[key as keyof typeof filters]}
                          onChange={(e) => handleFilterChange(key as keyof ErpVehicle, e.target.value)}
                          className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All {key}</option>
                          {filterOptions?.data?.[key as keyof typeof filterOptions.data]?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isFetching ? (
                  <tr>
                    <td colSpan={Object.keys(filters).length + 1} className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mb-1"></div>
                        <span className="text-gray-600 text-xs">Fetching ERP data from API...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((vehicle: any) => (
                    <tr key={vehicle.uniqueId} className="hover:bg-gray-50">
                      <td className="px-1 py-0.5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(vehicle.uniqueId!)}
                          onChange={(e) => handleRowSelect(vehicle.uniqueId!, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      {Object.keys(filters).map((key) => (
                                              <td key={key} className="px-1 py-0.5 whitespace-nowrap text-xs text-gray-900">
                        {vehicle[key as keyof ErpVehicle]?.toString() || '--'}
                      </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={Object.keys(filters).length + 1} className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m18 0h-2M3 13h2m13-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                        </svg>
                        <span className="text-gray-500 text-xs font-medium">No ERP vehicles found</span>
                        <span className="text-gray-400 text-xs">Try adjusting your search or filters</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Data Message */}
        {paginatedData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            {filteredAndSearchedData.length === 0 && storedData?.data?.length > 0 ? (
              <div>
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg font-medium mb-2">No vehicles match your search criteria</p>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div>
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg font-medium mb-2">No ERP vehicle data available</p>
                <p className="text-gray-500 mb-6">The system hasn't fetched any ERP data yet. Click the button below to fetch data from the ERP API.</p>
                <button
                  onClick={handleManualRefresh}
                  disabled={isFetching}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2 mx-auto"
                >
                  {isFetching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Fetching ERP Data...
                    </>
                  ) : (
                    <>
                      🚀 Fetch ERP Data
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-4">
                  This will connect to the ERP API and fetch the latest vehicle data
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErpVehicleTrackingDashboard; 