"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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

// Optimized page size for better performance
const pageSize = 1000;

const VehicleTrackingDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasAutoFetched, setHasAutoFetched] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states for all columns
  const [filters, setFilters] = useState({
    ip: "",
    vehicleNo: "",
    vehicleName: "",
    imeiNo: "",
    simNo: "",
    companyName: "",
    branchName: "",
    projectName: "",
    createdDate: "",
    resellerName: "",
    InActiveDays: "",
    adminName: "",
    region: "",
    projectId: "",
    username: "",
    fetchedAt: "",
    startDate: "",
    endDate: ""
  });

  // Sorting state and logic
  const [sortConfig, setSortConfig] = useState<{ key: keyof Vehicle | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // Optimized sort handler with useCallback
  const handleSort = useCallback((key: keyof Vehicle) => {
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
      
      const response = await fetch('/api/vehicles/stored');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch data');
      }
      
      // Add unique IDs to prevent duplicate key errors
      const vehiclesWithIds = data.data.map((vehicle: Vehicle, index: number) => ({
        ...vehicle,
        uniqueId: `${vehicle.imeiNo}-${vehicle.vehicleNo}-${index}`
      }));
      
      const totalTime = Date.now() - startTime;
      console.log(`⚡ Frontend loaded all ${vehiclesWithIds.length} vehicles in ${totalTime}ms`);
      
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

  // Optimized refetch function
  const refetchStored = useCallback(async () => {
    try {
      setIsLoadingStored(true);
      const startTime = Date.now();
      
      const response = await fetch('/api/vehicles/stored');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch data');
      }
      
      const vehiclesWithIds = data.data.map((vehicle: Vehicle, index: number) => ({
        ...vehicle,
        uniqueId: `${vehicle.imeiNo}-${vehicle.vehicleNo}-${index}`
      }));
      
      const totalTime = Date.now() - startTime;
      console.log(`🔄 Refetched ${vehiclesWithIds.length} vehicles in ${totalTime}ms`);
      
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
    const extractUniqueValues = (key: keyof Vehicle) => {
      const values = new Set<string>();
      vehicles.forEach((v: Vehicle) => {
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
        ip: extractUniqueValues('ip'),
        vehicleNo: extractUniqueValues('vehicleNo'),
        vehicleName: extractUniqueValues('vehicleName'),
        imeiNo: extractUniqueValues('imeiNo'),
        simNo: extractUniqueValues('simNo'),
        companyName: extractUniqueValues('companyName'),
        branchName: extractUniqueValues('branchName'),
        projectName: extractUniqueValues('projectName'),
        createdDate: extractUniqueValues('createdDate'),
        resellerName: extractUniqueValues('resellerName'),
        InActiveDays: extractUniqueValues('InActiveDays').sort((a, b) => Number(a) - Number(b)),
        adminName: extractUniqueValues('adminName'),
        region: extractUniqueValues('region'),
        projectId: extractUniqueValues('projectId'),
        username: extractUniqueValues('username'),
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
      console.log('🔄 Auto-refreshing data...');
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

  // Update data freshness indicator
  useEffect(() => {
    if (!lastRefreshTime) return;

    const updateFreshness = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastRefreshTime.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setDataFreshness(`${diffInSeconds}s ago`);
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setDataFreshness(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        setDataFreshness(`${hours}h ago`);
      }
    };

    updateFreshness();
    const interval = setInterval(updateFreshness, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  // Optimized trigger fetch function
  const triggerFetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/cron/fetch-vehicles', { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Manual fetch completed:', result);
      
      // Refetch the main data after manual fetch
      await refetchStored();
    } catch (error) {
      console.error('❌ Manual fetch failed:', error);
    } finally {
      setIsFetching(false);
    }
  }, [refetchStored]);

  // Auto-fetch data if no data is present
  useEffect(() => {
    if (!hasAutoFetched && !isLoadingStored && storedData && storedData.data.length === 0) {
      console.log('📁 No vehicle data found. Auto-fetching from external API...');
      setHasAutoFetched(true);
      
      triggerFetch()
        .then((result) => {
          console.log('✅ Auto-fetch completed successfully:', result);
        })
        .catch((error: any) => {
          console.warn('⚠️ Auto-fetch failed:', error);
        });
    }
  }, [storedData, isLoadingStored, hasAutoFetched, triggerFetch]);

  // Listen for reseller changes from header component and sync from localStorage
  useEffect(() => {
    const handleResellerChange = (event: CustomEvent) => {
      const selectedReseller = event.detail?.reseller;
      if (selectedReseller && selectedReseller.name !== "All Resellers") {
        setFilters(prev => ({
          ...prev,
          resellerName: selectedReseller.name
        }));
      } else {
        setFilters(prev => ({
          ...prev,
          resellerName: ""
        }));
      }
    };

    // Check localStorage for existing reseller selection
    const storedReseller = localStorage.getItem('selectedReseller');
    if (storedReseller) {
      try {
        const parsedReseller = JSON.parse(storedReseller);
        if (parsedReseller && parsedReseller.name !== "All Resellers") {
          setFilters(prev => ({
            ...prev,
            resellerName: parsedReseller.name
          }));
        }
      } catch (error) {
        console.warn('Error parsing stored reseller:', error);
      }
    }

    window.addEventListener('resellerChanged', handleResellerChange as EventListener);
    
    return () => {
      window.removeEventListener('resellerChanged', handleResellerChange as EventListener);
    };
  }, []);

  // Store all data and apply client-side filtering
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);

  // Update all vehicles when data changes
  useEffect(() => {
    if (storedData?.data) {
      setAllVehicles(storedData.data);
      console.log('🔄 All data loaded:', storedData.data.length, 'vehicles');
    }
  }, [storedData]);

  // Optimized search function - pre-compute searchable text
  const searchableVehicles = useMemo(() => {
    return allVehicles.map(vehicle => ({
      ...vehicle,
      searchText: [
        vehicle.vehicleName,
        vehicle.vehicleNo,
        vehicle.imeiNo,
        vehicle.simNo,
        vehicle.companyName,
        vehicle.branchName,
        vehicle.projectName,
        vehicle.resellerName,
        vehicle.adminName,
        vehicle.region,
        vehicle.projectId,
        vehicle.username
      ].join(' ').toLowerCase()
    }));
  }, [allVehicles]);

  // Optimized filtering and pagination - single pass filtering
  const filteredAndPaginatedData = useMemo(() => {
    if (allVehicles.length === 0) {
      return { vehicles: [], total: 0, totalPages: 1 };
    }

    let filteredData = searchableVehicles;
    
    // Apply search filter with optimized search
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toLowerCase();
      filteredData = filteredData.filter(vehicle =>
        vehicle.searchText.includes(searchLower)
      );
    }
    
    // Apply filters for all columns - optimized single pass
    const activeFilters = Object.entries(filters).filter(([_, value]) => value && value.trim() !== '');
    
    if (activeFilters.length > 0) {
      filteredData = filteredData.filter(vehicle => {
        return activeFilters.every(([key, value]) => {
          const vehicleValue = vehicle[key as keyof Vehicle];
          if (vehicleValue === undefined || vehicleValue === null) return false;
          return String(vehicleValue) === value.trim();
        });
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      const key = sortConfig.key;
      filteredData.sort((a, b) => {
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
  }, [searchableVehicles, debouncedSearchQuery, filters, sortConfig, currentPage]);

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

  // Optimized filter change handler
  const handleFilterChange = useCallback((filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Optimized row selection handler
  const handleRowSelect = useCallback((uniqueId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uniqueId)) {
        newSet.delete(uniqueId);
      } else {
        newSet.add(uniqueId);
      }
      return newSet;
    });
  }, []);

  // Optimized select all handler - use filtered data directly
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      // Get all IDs from the filtered data (across all pages)
      const allIds = new Set(
        searchableVehicles.filter(vehicle => {
          // Apply the same filters as the display logic
          let shouldInclude = true;
          
          // Apply search filter
          if (debouncedSearchQuery) {
            const searchLower = debouncedSearchQuery.toLowerCase();
            shouldInclude = shouldInclude && vehicle.searchText.includes(searchLower);
          }
          
          // Apply filters for all columns
          const activeFilters = Object.entries(filters).filter(([_, value]) => value && value.trim() !== '');
          if (activeFilters.length > 0) {
            shouldInclude = shouldInclude && activeFilters.every(([key, value]) => {
              const vehicleValue = vehicle[key as keyof Vehicle];
              if (vehicleValue === undefined || vehicleValue === null) return false;
              return String(vehicleValue) === value.trim();
            });
          }
          
          return shouldInclude;
        }).map(v => v.uniqueId || `${v.imeiNo}-${v.vehicleNo}`)
      );
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  }, [selectAll, searchableVehicles, debouncedSearchQuery, filters]);

  // Update select all state when filtered data changes
  useEffect(() => {
    if (filteredAndPaginatedData.total === 0) {
      setSelectAll(false);
      return;
    }
    
    // Get all IDs from the filtered data (across all pages)
    const allFilteredIds = new Set(
      searchableVehicles.filter(vehicle => {
        // Apply the same filters as the display logic
        let shouldInclude = true;
        
        // Apply search filter
        if (debouncedSearchQuery) {
          const searchLower = debouncedSearchQuery.toLowerCase();
          shouldInclude = shouldInclude && vehicle.searchText.includes(searchLower);
        }
        
        // Apply filters for all columns
        const activeFilters = Object.entries(filters).filter(([_, value]) => value && value.trim() !== '');
        if (activeFilters.length > 0) {
          shouldInclude = shouldInclude && activeFilters.every(([key, value]) => {
            const vehicleValue = vehicle[key as keyof Vehicle];
            if (vehicleValue === undefined || vehicleValue === null) return false;
            return String(vehicleValue) === value.trim();
          });
        }
        
        return shouldInclude;
      }).map(v => v.uniqueId || `${v.imeiNo}-${v.vehicleNo}`)
    );
    
    const isAllSelected = allFilteredIds.size > 0 && Array.from(allFilteredIds).every(id => selectedRows.has(id));
    setSelectAll(isAllSelected);
  }, [filteredAndPaginatedData.total, selectedRows, searchableVehicles, debouncedSearchQuery, filters]);

  // Optimized export function
  const exportSelectedVehicles = useCallback(async () => {
    try {
      // Determine which data to export
      let exportData: Vehicle[];
      
      if (selectedRows.size > 0) {
        // Export only selected rows (across all pages)
        exportData = allVehicles.filter(v => {
          const rowId = v.uniqueId || `${v.imeiNo}-${v.vehicleNo}`;
          return selectedRows.has(rowId);
        });
      } else {
        // Export all filtered data (same logic as display)
        let filteredData = searchableVehicles;
        
        // Apply search filter
        if (debouncedSearchQuery) {
          const searchLower = debouncedSearchQuery.toLowerCase();
          filteredData = filteredData.filter(vehicle =>
            vehicle.searchText.includes(searchLower)
          );
        }
        
        // Apply filters for all columns
        const activeFilters = Object.entries(filters).filter(([_, value]) => value && value.trim() !== '');
        if (activeFilters.length > 0) {
          filteredData = filteredData.filter(vehicle => {
            return activeFilters.every(([key, value]) => {
              const vehicleValue = vehicle[key as keyof Vehicle];
              if (vehicleValue === undefined || vehicleValue === null) return false;
              return String(vehicleValue) === value.trim();
            });
          });
        }
        
        exportData = filteredData;
      }

      // Create export data
      const exportDataFormatted = exportData.map((v: Vehicle) => ({
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

      const worksheet = XLSX.utils.json_to_sheet(exportDataFormatted);
      const workbook = XLSX.utils.book_new();
      
      // Use appropriate filename based on selection
      const filename = selectedRows.size > 0 
        ? `selected_vehicles_${selectedRows.size}.xlsx` 
        : filtersActive 
          ? "filtered_vehicles.xlsx" 
          : "all_vehicles.xlsx";
      const sheetName = selectedRows.size > 0 
        ? "Selected Vehicles" 
        : filtersActive 
          ? "Filtered Vehicles" 
          : "All Vehicles";
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, filename);
      
      console.log(`📊 Exported ${exportData.length} vehicles to ${filename}`);
    } catch (error) {
      console.error('Error exporting vehicles:', error);
      alert('Error exporting vehicles. Please try again.');
    }
  }, [selectedRows, allVehicles, searchableVehicles, debouncedSearchQuery, filters]);

  // Optimized reset filters function
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setFilters({
      ip: "",
      vehicleNo: "",
      vehicleName: "",
      imeiNo: "",
      simNo: "",
      companyName: "",
      branchName: "",
      projectName: "",
      createdDate: "",
      resellerName: "",
      InActiveDays: "",
      adminName: "",
      region: "",
      projectId: "",
      username: "",
      fetchedAt: "",
      startDate: "",
      endDate: ""
    });
  }, []);

  const isLoading = isLoadingStored || isFetching || isAutoRefreshing || isSearching;
  const error = storedError;

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    ip: true,
    vehicleNo: true,
    vehicleName: true,
    imeiNo: true,
    simNo: true,
    companyName: true,
    branchName: true,
    projectName: true,
    createdDate: true,
    resellerName: true,
    InActiveDays: true,
    adminName: true,
    region: true,
    projectId: true,
    username: true,

  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Optimized column change handler
  const handleColumnToggle = useCallback((column: string, checked: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: checked
    }));
  }, []);

  // Optimized show/hide all handlers
  const handleShowAllColumns = useCallback(() => {
    setVisibleColumns({
      ip: true, vehicleNo: true, vehicleName: true, imeiNo: true, simNo: true,
      companyName: true, branchName: true, projectName: true, createdDate: true,
      resellerName: true, InActiveDays: true, adminName: true, region: true,
      projectId: true, username: true, 
    });
  }, []);

  const handleHideAllColumns = useCallback(() => {
    setVisibleColumns({
      ip: false, vehicleNo: false, vehicleName: false, imeiNo: false, simNo: false,
      companyName: false, branchName: false, projectName: false, createdDate: false,
      resellerName: false, InActiveDays: false, adminName: false, region: false,
      projectId: false, username: false,
    });
  }, []);

  // Memoized column options
  const columnOptions = useMemo(() => [
    { key: 'ip', label: 'Server' },
    { key: 'vehicleNo', label: 'Vehicle No' },
    { key: 'vehicleName', label: 'Vehicle Name' },
    { key: 'imeiNo', label: 'IMEI' },
    { key: 'simNo', label: 'SIM No' },
    { key: 'companyName', label: 'Company' },
    { key: 'branchName', label: 'Branch' },
    { key: 'projectName', label: 'Project' },
    { key: 'createdDate', label: 'Installation Date' },
    { key: 'resellerName', label: 'Reseller' },
    { key: 'InActiveDays', label: 'Inactive Days' },
    { key: 'adminName', label: 'Admin' },
    { key: 'region', label: 'Region' },
    { key: 'projectId', label: 'Project ID' },
    { key: 'username', label: 'Username' },
     ], []);

  // Memoized visible columns count
  const visibleColumnsCount = useMemo(() => 
    Object.values(visibleColumns).filter(Boolean).length, 
    [visibleColumns]
  );

  // Add a helper for filtersActive
  const filtersActive = Object.values(filters).some(f => f) || !!searchQuery;

  // Calculate pagination info
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + vehicles.length;

  // Memoized table row component for better performance
  const TableRow = useCallback(({ v }: { v: Vehicle }) => {
    const rowId = v.uniqueId || `${v.imeiNo}-${v.vehicleNo}`;
    const isSelected = selectedRows.has(rowId);
    
    return (
      <tr key={rowId} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
        {/* Row Checkbox */}
        <td className="px-4 py-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleRowSelect(rowId)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </td>
        {visibleColumns.ip && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">{v.ip}</td>
        )}
        {visibleColumns.vehicleNo && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 font-medium">{v.vehicleNo}</td>
        )}
        {visibleColumns.vehicleName && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.vehicleName}</td>
        )}
        {visibleColumns.imeiNo && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">{v.imeiNo}</td>
        )}
        {visibleColumns.simNo && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">{v.simNo}</td>
        )}
        {visibleColumns.companyName && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.companyName}</td>
        )}
        {visibleColumns.branchName && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.branchName}</td>
        )}
        {visibleColumns.projectName && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.projectName}</td>
        )}
        {visibleColumns.createdDate && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.createdDate}</td>
        )}
        {visibleColumns.resellerName && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.resellerName}</td>
        )}
        {visibleColumns.InActiveDays && (
          <td className="px-4 py-2 whitespace-nowrap">
            <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
            v.InActiveDays === 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {v.InActiveDays}
          </span>
        </td>
        )}
        {visibleColumns.adminName && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.adminName}</td>
        )}
        {visibleColumns.region && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.region}</td>
        )}
        {visibleColumns.projectId && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">{v.projectId}</td>
        )}
        {visibleColumns.username && (
          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{v.username}</td>
        )}
       
        
      
      </tr>
    );
  }, [selectedRows, handleRowSelect, visibleColumns]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 z-40 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Vehicle Tracking Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {totalVehicles.toLocaleString()} vehicles 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Reseller Dropdown in Header */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Reseller:</span>
                <select
                  value={filters.resellerName}
                  onChange={(e) => handleFilterChange("resellerName", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-w-[180px] text-sm"
                >
                  <option value="">All Resellers</option>
                  {filterOptions?.data?.resellerName?.map((resellerName: string) => (
                    <option key={resellerName} value={resellerName}>{resellerName}</option>
                  ))}
                </select>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isAutoRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                {isAutoRefreshing ? 'Refreshing...' : lastRefreshTime ? `Last updated: ${formatDateTime(lastRefreshTime.toISOString())}` : 'Live Data'}
              </div>
              <a
                href="/"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-7xl mx-auto">

        {/* Search and Actions Bar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <svg className="h-5 w-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isSearching ? "Searching..." : "Search vehicles by name, number, IMEI..."}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 ${
                    isSearching ? 'border-blue-300 bg-blue-50/30' : 'border-gray-300'
                  }`}
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="text-xs text-blue-600 font-medium animate-pulse">
                      Searching...
                    </div>
                  </div>
                )}
              </div>
              

              
              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>

              {selectedRows.size > 0 && (
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Selection ({selectedRows.size})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => refetchStored()}
                disabled={isAutoRefreshing}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAutoRefreshing ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {isAutoRefreshing ? "Refreshing..." : "Refresh Now"}
              </button>

              <button
                onClick={() => triggerFetch()}
                disabled={isFetching}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  allVehicles.length === 0 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isFetching ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {isFetching 
                  ? "Fetching..." 
                  : allVehicles.length === 0 
                    ? "Fetch Data" 
                    : "Fetch Fresh Data"
                }
              </button>

              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Columns
              </button>

              <button
                onClick={exportSelectedVehicles}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {selectedRows.size > 0
                  ? `Export Selected (${selectedRows.size})`
                  : filtersActive
                    ? `Export Filtered (${totalVehicles.toLocaleString()})`
                    : `Export All (${totalVehicles.toLocaleString()})`
                }
              </button>


            </div>
          </div>
        </div>



        {/* Search Results Indicator */}
        {debouncedSearchQuery && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-semibold text-green-900">Search Results:</span>
              <span className="text-green-700">
                "{debouncedSearchQuery}" found {totalVehicles.toLocaleString()} vehicles
              </span>
              {isSearching && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 text-xs">Searching...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {Object.values(filters).some(f => f && f.trim() !== '') && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <span className="font-semibold text-blue-900">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && value.trim() !== '' ? (
                    <span key={key} className="bg-blue-200/80 px-3 py-1 rounded-full text-xs font-medium text-blue-800 backdrop-blur-sm">
                      {key}: {value}
                    </span>
                  ) : null
                )}
              </div>
              <span className="text-blue-700 font-bold text-lg">({totalVehicles.toLocaleString()} vehicles)</span>
            </div>
          </div>
        )}



        {/* Data Freshness and Loading Display */}
        
        {isAutoRefreshing && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-blue-900 font-semibold text-lg">
                  🔄 Refreshing vehicle data...
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  Auto-refreshing data to ensure you have the latest information
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-red-900 font-semibold text-lg">
                  ❌ Error loading vehicle data
                </p>
                <p className="text-red-700 text-sm mt-1">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Table */}
        {visibleColumnsCount > 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200/50" style={{ minWidth: `${(visibleColumnsCount + 1) * 150}px` }}>
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="px-4 py-2 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-xs text-gray-600 font-medium">
                        {selectedRows.size > 0 ? `${selectedRows.size} selected` : `Select All (${filteredAndPaginatedData.total.toLocaleString()})`}
                      </span>
                    </div>
                  </th>
                  {visibleColumns.ip && (
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleSort('ip')}
                          className="flex items-center gap-1 group focus:outline-none hover:text-blue-600 transition-all duration-200"
                    >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      SERVER
                      {sortConfig.key === 'ip' && (
                        <span className="text-blue-600 font-bold">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                        <select
                          value={filters.ip}
                          onChange={(e) => handleFilterChange("ip", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All IPs</option>
                          {filterOptions?.data?.ip?.map((ip: string) => (
                            <option key={ip} value={ip}>{ip}</option>
                          ))}
                        </select>
                      </div>
                  </th>
                  )}
                  {visibleColumns.vehicleNo && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  )}
                  {visibleColumns.vehicleName && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                        <select
                          value={filters.vehicleName}
                          onChange={(e) => handleFilterChange("vehicleName", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Vehicle Names</option>
                          {filterOptions?.data?.vehicleName?.map((vehicleName: string) => (
                            <option key={vehicleName} value={vehicleName}>{vehicleName}</option>
                          ))}
                        </select>
                      </div>
                  </th>
                  )}
                  {visibleColumns.imeiNo && (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                        <select
                          value={filters.imeiNo}
                          onChange={(e) => handleFilterChange("imeiNo", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All IMEIs</option>
                                                  {filterOptions?.data?.imeiNo?.map((imeiNo: string) => (
                          <option key={imeiNo} value={imeiNo}>{imeiNo}</option>
                        ))}
                        </select>
                      </div>
                  </th>
                  )}
                  {visibleColumns.simNo && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.simNo}
                        onChange={(e) => handleFilterChange("simNo", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All SIM Nos</option>
                        {filterOptions?.data?.simNo?.map((simNo: string) => (
                          <option key={simNo} value={simNo}>{simNo}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.companyName && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.companyName}
                        onChange={(e) => handleFilterChange("companyName", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Companies</option>
                        {filterOptions?.data?.companyName?.map((companyName: string) => (
                          <option key={companyName} value={companyName}>{companyName}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.branchName && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.branchName}
                        onChange={(e) => handleFilterChange("branchName", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Branches</option>
                        {filterOptions?.data?.branchName?.map((branchName: string) => (
                          <option key={branchName} value={branchName}>{branchName}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.projectName && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.projectName}
                        onChange={(e) => handleFilterChange("projectName", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Projects</option>
                        {filterOptions?.data?.projectName?.map((projectName: string) => (
                          <option key={projectName} value={projectName}>{projectName}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.createdDate && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.createdDate}
                        onChange={(e) => handleFilterChange("createdDate", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Dates</option>
                        {filterOptions?.data?.createdDate?.map((createdDate: string) => (
                          <option key={createdDate} value={createdDate}>{createdDate}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.resellerName && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.resellerName}
                        onChange={(e) => handleFilterChange("resellerName", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Resellers</option>
                        {filterOptions?.data?.resellerName?.map((resellerName: string) => (
                          <option key={resellerName} value={resellerName}>{resellerName}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.InActiveDays && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.InActiveDays}
                        onChange={(e) => handleFilterChange("InActiveDays", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Days</option>
                        {filterOptions?.data?.InActiveDays?.map((inActiveDays: string) => (
                          <option key={inActiveDays} value={inActiveDays}>{inActiveDays}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.adminName && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.adminName}
                        onChange={(e) => handleFilterChange("adminName", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Admins</option>
                        {filterOptions?.data?.adminName?.map((adminName: string) => (
                          <option key={adminName} value={adminName}>{adminName}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.region && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.region}
                        onChange={(e) => handleFilterChange("region", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Regions</option>
                        {filterOptions?.data?.region?.map((region: string) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.projectId && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.projectId}
                        onChange={(e) => handleFilterChange("projectId", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Project IDs</option>
                        {filterOptions?.data?.projectId?.map((projectId: string) => (
                          <option key={projectId} value={projectId}>{projectId}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                  {visibleColumns.username && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col gap-1">
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
                      <select
                        value={filters.username}
                        onChange={(e) => handleFilterChange("username", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Usernames</option>
                        {filterOptions?.data?.username?.map((username: string) => (
                          <option key={username} value={username}>{username}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  )}
                
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={visibleColumnsCount + 1} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <span className="text-gray-600">
                          {isFetching ? "Fetching vehicle data..." : isSearching ? "Searching vehicles..." : "Loading vehicles..."}
                        </span>
                      </div>
                    </td>
                  </tr>
                                 ) : filteredAndPaginatedData.vehicles.length > 0 ? (
                   filteredAndPaginatedData.vehicles.map((vehicle) => <TableRow key={vehicle.uniqueId || `${vehicle.imeiNo}-${vehicle.vehicleNo}`} v={vehicle} />)
                ) : (
                  <tr>
                    <td colSpan={visibleColumnsCount + 1} className="px-6 py-12 text-center">
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
                Showing {startIndex + 1}-{endIndex} of {totalVehicles.toLocaleString()} vehicles
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
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Columns Selected</h3>
              <p className="text-gray-500 mb-4">Please select at least one column to display the vehicle data.</p>
              <button
                onClick={() => setShowColumnSelector(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Select Columns
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Column Selector Modal */}
      {showColumnSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Select Columns to Display</h3>
                <button
                  onClick={() => setShowColumnSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {columnOptions.map(({ key, label }) => (
                  <label 
                    key={key} 
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[key as keyof typeof visibleColumns]}
                      onChange={(e) => handleColumnToggle(key, e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize select-none">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleShowAllColumns}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                >
                  Show All Columns
                </button>
                <button
                  onClick={handleHideAllColumns}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                >
                  Hide All Columns
                </button>
                <button
                  onClick={() => setShowColumnSelector(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTrackingDashboard;
