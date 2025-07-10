import fs from 'fs';
import path from 'path';

// In-memory storage for Vercel serverless functions
let inMemoryData: any = null;

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Get the data directory path
const getDataDir = () => {
  if (isServerless) {
    // In serverless, we can't write to filesystem, so use in-memory
    return null;
  }
  
  // In development, use local filesystem
  const dataDir = path.join(process.cwd(), 'data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
      return null;
    }
  }
  
  return dataDir;
};

// Get the data file path
const getDataFilePath = () => {
  const dataDir = getDataDir();
  if (!dataDir) return null;
  return path.join(dataDir, 'vehicles.json');
};

// Read vehicle data
export const readVehicleData = (): any => {
  try {
    if (isServerless) {
      // In serverless environment, return in-memory data
      return inMemoryData;
    }
    
    const filePath = getDataFilePath();
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading vehicle data:', error);
    return null;
  }
};

// Write vehicle data
export const writeVehicleData = (data: any): boolean => {
  try {
    if (isServerless) {
      // In serverless environment, store in memory
      inMemoryData = data;
      return true;
    }
    
    const filePath = getDataFilePath();
    if (!filePath) {
      console.error('Cannot write data: file path is null');
      return false;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing vehicle data:', error);
    return false;
  }
};

// Append vehicle data
export const appendVehicleData = (newVehicles: any[], metadata: any): boolean => {
  try {
    const existingData = readVehicleData();
    const currentVehicles = existingData?.vehicles || [];
    
    // Add metadata to each vehicle
    const vehiclesWithMetadata = newVehicles.map(vehicle => ({
      ...vehicle,
      fetchedAt: new Date().toISOString(),
      startDate: metadata.startDate,
      endDate: metadata.endDate
    }));
    
    const updatedData = {
      vehicles: [...currentVehicles, ...vehiclesWithMetadata],
      lastUpdated: new Date().toISOString(),
      totalRecords: currentVehicles.length + newVehicles.length,
      metadata
    };
    
    return writeVehicleData(updatedData);
  } catch (error) {
    console.error('Error appending vehicle data:', error);
    return false;
  }
};

// Clean old data (keep last 30 days)
export const cleanOldData = (daysToKeep: number = 30): boolean => {
  try {
    const data = readVehicleData();
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
    
    return writeVehicleData(updatedData);
  } catch (error) {
    console.error('Error cleaning old data:', error);
    return false;
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