import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData, VehicleData } from '@/Utils/dataStorage';

export async function GET() {
  try {
    const data = readVehicleData();
    
    if (!data || !data.vehicles || data.vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          servers: [],
          companies: [],
          platforms: [],
          regions: [],
          projects: []
        },
        timestamp: new Date().toISOString()
      });
    }

    // Extract unique values for each filter
    const servers = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.ip))).sort();
    const companies = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.companyName))).sort();
    const platforms = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectName))).sort();
    const regions = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.region))).sort();
    const projects = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectId))).sort(); // Use projectId instead of projectName

    return NextResponse.json({
      success: true,
      data: {
        servers,
        companies,
        platforms,
        regions,
        projects
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    
    // Return empty data instead of error for better UX
    return NextResponse.json({
      success: true,
      data: {
        servers: [],
        companies: [],
        platforms: [],
        regions: [],
        projects: []
      },
      timestamp: new Date().toISOString()
    });
  }
} 