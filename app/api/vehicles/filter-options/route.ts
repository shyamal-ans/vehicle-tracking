import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData } from '@/Utils/dataStorage';

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
    const servers = Array.from(new Set(data.vehicles.map(v => v.ip))).sort();
    const companies = Array.from(new Set(data.vehicles.map(v => v.companyName))).sort();
    const platforms = Array.from(new Set(data.vehicles.map(v => v.projectName))).sort();
    const regions = Array.from(new Set(data.vehicles.map(v => v.region))).sort();
    const projects = Array.from(new Set(data.vehicles.map(v => v.projectName))).sort();

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
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch filter options',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 