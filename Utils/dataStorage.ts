import { 
  getCachedVehicles, 
  setCachedVehicles, 
  getCachedMetadata, 
  setCachedMetadata,
  hasCachedData 
} from './redis';

// Read vehicle data - Redis cache only
export const readVehicleData = async (): Promise<any> => {
  try {
    console.log('🔍 readVehicleData: starting...');
    
    // Try Redis cache
    const cachedVehicles = await getCachedVehicles();
    const cachedMetadata = await getCachedMetadata();
    
    console.log(`🔍 readVehicleData: cachedVehicles=${cachedVehicles.vehicles.length}, cachedMetadata=${!!cachedMetadata}`);
    
    if (cachedVehicles.vehicles.length > 0 && cachedMetadata) {
      console.log(`📋 Using cached data: ${cachedVehicles.vehicles.length} vehicles`);
      return {
        vehicles: cachedVehicles,
        lastUpdated: cachedMetadata.lastUpdated,
        totalRecords: cachedVehicles.vehicles.length,
        metadata: cachedMetadata.metadata
      };
    }
    
    console.log('❌ No data available in Redis cache');
    return null;
  } catch (error) {
    console.error('Error reading vehicle data:', error);
    return null;
  }
};

// Check if we need to fetch data (cache is empty)
export const needsDataFetch = async (): Promise<boolean> => {
  const cachedVehicles = await getCachedVehicles();
  const cachedMetadata = await getCachedMetadata();
  
  const hasCachedData = cachedVehicles.vehicles.length > 0 && cachedMetadata;
  
  console.log(`🔍 Data fetch check:`, {
    hasCachedData,
    needsFetch: !hasCachedData,
    cachedVehicleCount: cachedVehicles.vehicles.length
  });
  
  return !hasCachedData;
};

// Get data age in hours
export const getDataAge = async (): Promise<number | null> => {
  try {
    const cachedMetadata = await getCachedMetadata();
    if (!cachedMetadata?.lastUpdated) return null;
    
    const lastUpdated = new Date(cachedMetadata.lastUpdated);
    const now = new Date();
    const ageInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    return ageInHours;
  } catch (error) {
    console.error('Error calculating data age:', error);
    return null;
  }
};

// Write vehicle data - Redis cache only
export const writeVehicleData = async (data: any): Promise<boolean> => {
  try {
    console.log(`💾 writeVehicleData: storing ${data.vehicles?.length || 0} vehicles`);
    
    // Store in Redis cache
    const cacheResult = await setCachedVehicles(data.vehicles);
    const metadataResult = await setCachedMetadata({
      lastUpdated: data.lastUpdated,
      metadata: data.metadata
    });
    
    console.log(`💾 writeVehicleData: cacheResult=${cacheResult}, metadataResult=${metadataResult}`);
    
    return cacheResult && metadataResult;
  } catch (error) {
    console.error('Error writing vehicle data:', error);
    return false;
  }
};

// Append vehicle data - replace data for same date range to prevent duplication
export const appendVehicleData = async (newVehicles: any[], metadata: any): Promise<boolean> => {
  try {
    const existingData = await readVehicleData();
    const currentVehicles = existingData?.vehicles || [];
    
    // Add metadata to each vehicle
    const vehiclesWithMetadata = newVehicles.map(vehicle => ({
      ...vehicle,
      fetchedAt: new Date().toISOString(),
      startDate: metadata.startDate,
      endDate: metadata.endDate
    }));
    
    // Check if we already have data for the same date range
    const existingVehiclesForDateRange = currentVehicles.filter((vehicle: any) => 
      vehicle.startDate === metadata.startDate && vehicle.endDate === metadata.endDate
    );
    
    let updatedVehicles;
    if (existingVehiclesForDateRange.length > 0) {
      // Replace data for the same date range
      const otherVehicles = currentVehicles.filter((vehicle: any) => 
        !(vehicle.startDate === metadata.startDate && vehicle.endDate === metadata.endDate)
      );
      updatedVehicles = [...otherVehicles, ...vehiclesWithMetadata];
      console.log(`🔄 Replaced ${existingVehiclesForDateRange.length} existing vehicles for date range ${metadata.startDate} to ${metadata.endDate} with ${vehiclesWithMetadata.length} new vehicles`);
    } else {
      // Append new data for a different date range
      updatedVehicles = [...currentVehicles, ...vehiclesWithMetadata];
      console.log(`➕ Appended ${vehiclesWithMetadata.length} new vehicles for date range ${metadata.startDate} to ${metadata.endDate}`);
    }
    
    const updatedData = {
      vehicles: updatedVehicles,
      lastUpdated: new Date().toISOString(),
      totalRecords: updatedVehicles.length,
      metadata
    };
    
    return await writeVehicleData(updatedData);
  } catch (error) {
    console.error('Error appending vehicle data:', error);
    return false;
  }
};

// Clean old data (keep last 30 days)
export const cleanOldData = async (daysToKeep: number = 30): Promise<boolean> => {
  try {
    const data = await readVehicleData();
    if (!data || !data.vehicles) return true;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredVehicles = data.vehicles.filter((vehicle: any) => {
      const fetchedDate = new Date(vehicle.fetchedAt);
      return fetchedDate >= cutoffDate;
    });
    
    const updatedData = {
      ...data,
      vehicles: filteredVehicles,
      totalRecords: filteredVehicles.length,
      lastUpdated: new Date().toISOString()
    };
    
    return await writeVehicleData(updatedData);
  } catch (error) {
    console.error('Error cleaning old data:', error);
    return false;
  }
};

// Clear all vehicle data
export const clearAllVehicleData = async (): Promise<boolean> => {
  try {
    await setCachedVehicles([]);
    await setCachedMetadata(null);
    console.log('🗑️ All vehicle data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing vehicle data:', error);
    return false;
  }
};

// Get data statistics
export const getDataStats = async () => {
  try {
    const data = await readVehicleData();
    if (!data || !data.vehicles) {
      return {
        totalVehicles: 0,
        lastUpdated: null,
        dateRanges: [],
        uniqueDates: 0
      };
    }
    
    // Get unique date ranges
    const dateRanges = Array.from(new Set(
      data.vehicles.map((v: any) => `${v.startDate} to ${v.endDate}`)
    ));
    
    return {
      totalVehicles: data.vehicles.length,
      lastUpdated: data.lastUpdated,
      dateRanges,
      uniqueDates: dateRanges.length
    };
  } catch (error) {
    console.error('Error getting data stats:', error);
    return {
      totalVehicles: 0,
      lastUpdated: null,
      dateRanges: [],
      uniqueDates: 0
    };
  }
};

// Get vehicles with optional filtering
export const getVehicles = async (
  filters?: {
    search?: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    server?: string;
    status?: string;
    platform?: string;
    company?: string;
    region?: string;
    project?: string;
  }
): Promise<{ vehicles: VehicleData[]; total: number; page: number; pageSize: number }> => {
  try {
    const data = await readVehicleData();
    if (!data) {
      return { vehicles: [], total: 0, page: 1, pageSize: 10 };
    }
    
    let filteredVehicles = [...data.vehicles];
    
    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredVehicles = filteredVehicles.filter(vehicle =>
        Object.values(vehicle).some((val) =>
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply server filter (IP)
    if (filters?.server) {
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.ip.toLowerCase().includes(filters.server!.toLowerCase())
      );
    }

    // Apply status filter (InActiveDays)
    if (filters?.status) {
      if (filters.status === "Active") {
        filteredVehicles = filteredVehicles.filter(vehicle => vehicle.InActiveDays === 0);
      } else if (filters.status === "Inactive") {
        filteredVehicles = filteredVehicles.filter(vehicle => vehicle.InActiveDays > 0);
      }
    }

    // Apply platform filter (projectName)
    if (filters?.platform) {
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.projectName.toLowerCase().includes(filters.platform!.toLowerCase())
      );
    }

    // Apply company filter
    if (filters?.company) {
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.companyName.toLowerCase().includes(filters.company!.toLowerCase())
      );
    }

    // Apply region filter
    if (filters?.region) {
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.region.toLowerCase().includes(filters.region!.toLowerCase())
      );
    }

    // Apply project filter (projectName)
    if (filters?.project) {
      filteredVehicles = filteredVehicles.filter(vehicle =>
        vehicle.projectName.toLowerCase().includes(filters.project!.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (filters?.startDate || filters?.endDate) {
      filteredVehicles = filteredVehicles.filter(vehicle => {
        const fetchedDate = new Date(vehicle.fetchedAt);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        if (startDate && fetchedDate < startDate) return false;
        if (endDate && fetchedDate > endDate) return false;
        return true;
      });
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = pageSize >= 999999 ? filteredVehicles.length : startIndex + pageSize;
    const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    
    return {
      vehicles: paginatedVehicles,
      total: filteredVehicles.length,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return { vehicles: [], total: 0, page: 1, pageSize: 10 };
  }
};

// Type definitions
export type VehicleData = {
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
  fetchedAt?: string;
  startDate?: string;
  endDate?: string;
}; 