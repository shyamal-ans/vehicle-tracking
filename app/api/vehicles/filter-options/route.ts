import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData, VehicleData } from '@/Utils/dataStorage';
import { getCachedFilterOptions, setCachedFilterOptions } from '@/Utils/cache';

export async function GET() {
  try {
    // Try to get cached filter options first
    const cachedOptions = getCachedFilterOptions();
    if (cachedOptions) {
      return NextResponse.json({
        success: true,
        data: cachedOptions,
        timestamp: new Date().toISOString(),
        source: 'cache'
      });
    }

    const data = readVehicleData();
    
    if (!data || !data.vehicles || data.vehicles.length === 0) {
      const emptyOptions = {
        servers: [],
        companies: [],
        platforms: [],
        regions: [],
        projects: []
      };
      
      // Cache empty options for 24 hours
      setCachedFilterOptions(emptyOptions, 86400); // 24 hours
      
      return NextResponse.json({
        success: true,
        data: emptyOptions,
        timestamp: new Date().toISOString(),
        source: 'empty'
      });
    }

    // Extract unique values for each filter
    const servers = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.ip))).sort();
    const companies = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.companyName))).sort();
    const platforms = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectName))).sort();
    const regions = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.region))).sort();
    const projects = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectId))).sort(); // Use projectId instead of projectName

    const filterOptions = {
      servers,
      companies,
      platforms,
      regions,
      projects
    };

    // Cache the filter options
    setCachedFilterOptions(filterOptions);

    return NextResponse.json({
      success: true,
      data: filterOptions,
      timestamp: new Date().toISOString(),
      source: 'computed'
    });

  } catch (error) {
    console.error('Error fetching filter options:', error);
    
    // Return empty data instead of error for better UX
    const emptyOptions = {
      servers: [],
      companies: [],
      platforms: [],
      regions: [],
      projects: []
    };
    
    return NextResponse.json({
      success: true,
      data: emptyOptions,
      timestamp: new Date().toISOString(),
      source: 'error'
    });
  }
} 