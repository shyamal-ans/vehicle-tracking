import { promises as fs } from 'fs';
import path from 'path';

// File paths for data storage
const DATA_DIR = path.join(process.cwd(), 'data');
const VEHICLES_FILE = path.join(DATA_DIR, 'vehicles.json');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');

// Simple in-memory cache (DISABLED FOR TESTING)
let dataCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('📁 Created data directory');
  }
};

// Read vehicle data from JSON file with caching
export const readVehicleData = async (): Promise<any> => {
  try {
    await ensureDataDir();
    
    // Check cache first (DISABLED FOR TESTING)
    // const now = Date.now();
    // if (dataCache && (now - cacheTimestamp) < CACHE_TTL) {
    //   console.log(`📋 Using cached data (${dataCache.vehicles.length} vehicles)`);
    //   return dataCache;
    // }
    
    // Read files with performance optimization
    const startTime = Date.now();
    
    // Read both files in parallel
    const [vehiclesData, metadataData] = await Promise.all([
      fs.readFile(VEHICLES_FILE, 'utf-8'),
      fs.readFile(METADATA_FILE, 'utf-8')
    ]);
    
    const vehicles = JSON.parse(vehiclesData);
    const metadata = JSON.parse(metadataData);
    
    const loadTime = Date.now() - startTime;
    console.log(`📋 Loaded ${vehicles.length} vehicles from JSON file in ${loadTime}ms (RAW PERFORMANCE)`);
    
    const result = {
      vehicles,
      lastUpdated: metadata.lastUpdated,
      totalRecords: vehicles.length,
      metadata: metadata.metadata
    };
    
    // Update cache (DISABLED FOR TESTING)
    // dataCache = result;
    // cacheTimestamp = now;
    
    return result;
  } catch (error) {
    console.log('📁 No existing data found, starting fresh');
    return null;
  }
};

// Write vehicle data to JSON file with optimization
export const writeVehicleData = async (data: any): Promise<boolean> => {
  try {
    await ensureDataDir();
    
    const startTime = Date.now();
    
    // Write files in parallel with optimized JSON formatting
    await Promise.all([
      fs.writeFile(VEHICLES_FILE, JSON.stringify(data.vehicles)), // Remove pretty formatting for smaller file size
      fs.writeFile(METADATA_FILE, JSON.stringify({
        lastUpdated: data.lastUpdated,
        metadata: data.metadata
      }, null, 2))
    ]);
    
    const writeTime = Date.now() - startTime;
    console.log(`💾 Saved ${data.vehicles.length} vehicles to JSON file in ${writeTime}ms`);
    
    // Invalidate cache
    dataCache = null;
    
    return true;
  } catch (error) {
    console.error('Error writing vehicle data:', error);
    return false;
  }
};

// Append vehicle data (replace data for same date range)
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

// Clear all vehicle data
export const clearAllVehicleData = async (): Promise<boolean> => {
  try {
    await ensureDataDir();
    
    // Write empty data
    await Promise.all([
      fs.writeFile(VEHICLES_FILE, JSON.stringify([])),
      fs.writeFile(METADATA_FILE, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        metadata: {}
      }, null, 2))
    ]);
    
    console.log('🗑️ All vehicle data cleared successfully');
    
    // Invalidate cache
    dataCache = null;
    
    return true;
  } catch (error) {
    console.error('Error clearing vehicle data:', error);
    return false;
  }
};

// Clean old data (keep last N days)
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

// Get data age in hours
export const getDataAge = async (): Promise<number | null> => {
  try {
    const data = await readVehicleData();
    if (!data?.lastUpdated) return null;
    
    const lastUpdated = new Date(data.lastUpdated);
    const now = new Date();
    const ageInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    
    return ageInHours;
  } catch (error) {
    console.error('Error calculating data age:', error);
    return null;
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

// Check if data needs to be fetched
export const needsDataFetch = async (): Promise<boolean> => {
  try {
    const data = await readVehicleData();
    if (!data || !data.vehicles || data.vehicles.length === 0) {
      return true; // No data, need to fetch
    }
    
    const dataAge = await getDataAge();
    if (dataAge === null || dataAge >= 24) {
      return true; // Data is stale or can't determine age
    }
    
    return false; // Data is fresh
  } catch (error) {
    console.error('Error checking if data needs fetch:', error);
    return true; // Error occurred, assume we need to fetch
  }
};

// Clear cache (useful for testing)
export const clearCache = () => {
  dataCache = null;
  cacheTimestamp = 0;
  console.log('🧹 Cache cleared');
};

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