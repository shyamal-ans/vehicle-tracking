import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData, VehicleData } from '@/Utils/dataStorage';
import { getCachedFilterOptions, setCachedFilterOptions, clearFilterOptionsCache } from '@/Utils/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    console.log('🔍 Filter options request:', { forceRefresh });
    
    // Clear cache if force refresh is requested
    if (forceRefresh) {
      console.log('🔄 Force refresh requested - clearing filter options cache');
      clearFilterOptionsCache();
    }
    
    // Try to get cached filter options first (unless force refresh)
    if (!forceRefresh) {
      const cachedOptions = await getCachedFilterOptions();
      if (cachedOptions) {
        console.log('📋 Using cached filter options');
        return NextResponse.json({
          success: true,
          data: cachedOptions,
          timestamp: new Date().toISOString(),
          source: 'cache'
        });
      }
    }

    console.log('🔄 Computing filter options from cached data...');
    const data = await readVehicleData();
    
    console.log('📊 Data status:', {
      hasData: !!data,
      hasVehicles: !!data?.vehicles,
      vehicleCount: data?.vehicles?.length || 0
    });
    
    if (!data || !data.vehicles || data.vehicles.length === 0) {
      console.log('⚠️ No vehicle data available for filter options');
      const emptyOptions = {
        servers: [],
        companies: [],
        platforms: [],
        regions: [],
        projects: []
      };
      
      // Cache empty options for 24 hours
      await setCachedFilterOptions(emptyOptions, 86400); // 24 hours
      
      return NextResponse.json({
        success: true,
        data: emptyOptions,
        timestamp: new Date().toISOString(),
        source: 'empty'
      });
    }

    // Extract unique values for each filter from ALL cached data
    console.log('🔍 Extracting filter options from', data.vehicles.length, 'vehicles');
    
    const servers = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.ip))).sort();
    const companies = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.companyName))).sort();
    const platforms = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectName))).sort();
    const regions = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.region))).sort();
    const projects = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectName))).sort();

    const filterOptions = {
      servers,
      companies,
      platforms,
      regions,
      projects
    };

    console.log('📊 Filter options computed:', {
      servers: servers.length,
      companies: companies.length,
      platforms: platforms.length,
      regions: regions.length,
      projects: projects.length
    });

    // Cache the filter options
    await setCachedFilterOptions(filterOptions);

    return NextResponse.json({
      success: true,
      data: filterOptions,
      timestamp: new Date().toISOString(),
      source: 'computed',
      vehicleCount: data.vehicles.length
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

// Force refresh filter options
export async function POST() {
  try {
    console.log('🔄 Force refreshing filter options...');
    
    // Clear cached filter options
    await clearFilterOptionsCache();
    
    // Recompute from fresh data
    const data = await readVehicleData();
    
    if (!data || !data.vehicles || data.vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data available to compute filter options',
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
    const projects = Array.from(new Set(data.vehicles.map((v: VehicleData) => v.projectName))).sort();

    const filterOptions = {
      servers,
      companies,
      platforms,
      regions,
      projects
    };

    // Cache the filter options
    await setCachedFilterOptions(filterOptions);

    return NextResponse.json({
      success: true,
      message: 'Filter options refreshed successfully',
      data: filterOptions,
      vehicleCount: data.vehicles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing filter options:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh filter options',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 