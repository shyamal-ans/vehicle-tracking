import fs from 'fs';
import path from 'path';

// Types for our data structure
export interface VehicleData {
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
  fetchedAt: string; // When this data was fetched
  startDate: string; // Date range start for this fetch
  endDate: string; // Date range end for this fetch
}

export interface StoredVehicleData {
  lastUpdated: string;
  totalRecords: number;
  vehicles: VehicleData[];
  metadata: {
    adminCode: string;
    projectId: string;
    startDate: string;
    endDate: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const VEHICLE_DATA_FILE = path.join(DATA_DIR, 'vehicle-data.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// Read existing vehicle data
export const readVehicleData = (): StoredVehicleData | null => {
  try {
    ensureDataDirectory();
    
    if (!fs.existsSync(VEHICLE_DATA_FILE)) {
      return null;
    }
    
    const data = fs.readFileSync(VEHICLE_DATA_FILE, 'utf-8');
    return JSON.parse(data) as StoredVehicleData;
  } catch (error) {
    console.error('Error reading vehicle data:', error);
    return null;
  }
};

// Write vehicle data (overwrites existing)
export const writeVehicleData = (data: StoredVehicleData): void => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(VEHICLE_DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Vehicle data written successfully. Total records: ${data.vehicles.length}`);
  } catch (error) {
    console.error('Error writing vehicle data:', error);
    throw error;
  }
};

// Append new vehicle data to existing data
export const appendVehicleData = (
  newVehicles: VehicleData[],
  metadata: {
    adminCode: string;
    projectId: string;
    startDate: string;
    endDate: string;
  }
): StoredVehicleData => {
  try {
    ensureDataDirectory();
    
    // Read existing data
    const existingData = readVehicleData();
    const isInitialFetch = !existingData;
    
    // Create new data structure
    const now = new Date().toISOString();
    const updatedVehicles = existingData?.vehicles || [];
    
    // Add fetchedAt timestamp and date range to new vehicles
    const vehiclesWithMetadata = newVehicles.map(vehicle => ({
      ...vehicle,
      fetchedAt: now,
      startDate: metadata.startDate,
      endDate: metadata.endDate
    }));
    
    // Append new vehicles (avoid duplicates by IMEI)
    const existingImeis = new Set(updatedVehicles.map(v => v.imeiNo));
    const uniqueNewVehicles = vehiclesWithMetadata.filter(v => !existingImeis.has(v.imeiNo));
    
    const finalVehicles = [...updatedVehicles, ...uniqueNewVehicles];
    
    const newData: StoredVehicleData = {
      lastUpdated: now,
      totalRecords: finalVehicles.length,
      vehicles: finalVehicles,
      metadata: {
        ...metadata,
        startDate: existingData?.metadata.startDate || metadata.startDate,
        endDate: metadata.endDate // Always update to latest end date
      }
    };
    
    // Write the updated data
    writeVehicleData(newData);
    
    if (isInitialFetch) {
      console.log(`📁 Initial data fetch: Created ${finalVehicles.length} vehicle records`);
    } else {
      console.log(`📁 Data append: Added ${uniqueNewVehicles.length} new vehicles. Total: ${finalVehicles.length}`);
    }
    
    return newData;
  } catch (error) {
    console.error('Error appending vehicle data:', error);
    throw error;
  }
};

// Get vehicles with optional filtering
export const getVehicles = (
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
): { vehicles: VehicleData[]; total: number; page: number; pageSize: number } => {
  try {
    const data = readVehicleData();
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

// Clean old data (keep only last N days)
export const cleanOldData = (daysToKeep: number = 30): void => {
  try {
    const data = readVehicleData();
    if (!data) return;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredVehicles = data.vehicles.filter(vehicle => {
      const fetchedDate = new Date(vehicle.fetchedAt);
      return fetchedDate >= cutoffDate;
    });
    
    if (filteredVehicles.length !== data.vehicles.length) {
      const cleanedData: StoredVehicleData = {
        ...data,
        vehicles: filteredVehicles,
        totalRecords: filteredVehicles.length,
        lastUpdated: new Date().toISOString()
      };
      
      writeVehicleData(cleanedData);
      console.log(`🧹 Cleaned old data. Removed ${data.vehicles.length - filteredVehicles.length} old records.`);
    }
  } catch (error) {
    console.error('Error cleaning old data:', error);
  }
}; 