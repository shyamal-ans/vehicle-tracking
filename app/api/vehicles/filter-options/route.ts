import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    console.log('🔍 Filter options request:', { forceRefresh });

    const endpointUrl = new URL('/api/vehicles/stored', request.nextUrl.origin);
    endpointUrl.searchParams.set('page', '1');
    endpointUrl.searchParams.set('pageSize', '999999');
    if (forceRefresh) {
      endpointUrl.searchParams.set('refresh', 'true');
    }

    console.log('🔄 Fetching live vehicle data for filter options from', endpointUrl.toString());
    const storedResponse = await fetch(endpointUrl.toString(), {
      cache: 'no-store',
    });
    const result = await storedResponse.json();

    if (!result.success || !Array.isArray(result.data)) {
      console.warn('⚠️ Live stored vehicle data unavailable, falling back to empty filter options');
      return NextResponse.json({
        success: true,
        data: {
          servers: [],
          companies: [],
          platforms: [],
          regions: [],
          projects: []
        },
        timestamp: new Date().toISOString(),
        source: 'fallback'
      });
    }

    const vehicles = result.data;
    console.log('📊 Computing filter options from', vehicles.length, 'live vehicles');

    const servers = Array.from(new Set(vehicles.map((v: any) => v.ip))).filter(Boolean).sort();
    const companies = Array.from(new Set(vehicles.map((v: any) => v.companyName))).filter(Boolean).sort();
    const platforms = Array.from(new Set(vehicles.map((v: any) => v.projectName))).filter(Boolean).sort();
    const regions = Array.from(new Set(vehicles.map((v: any) => v.region))).filter(Boolean).sort();
    const projects = Array.from(new Set(vehicles.map((v: any) => v.projectName))).filter(Boolean).sort();

    const filterOptions = {
      servers,
      companies,
      platforms,
      regions,
      projects
    };

    return NextResponse.json({
      success: true,
      data: filterOptions,
      timestamp: new Date().toISOString(),
      source: 'live',
      vehicleCount: vehicles.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      }
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
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Force refreshing filter options...');

    const endpointUrl = new URL('/api/vehicles/stored', request.nextUrl.origin);
    endpointUrl.searchParams.set('page', '1');
    endpointUrl.searchParams.set('pageSize', '999999');

    const response = await fetch(endpointUrl.toString(), {
      cache: 'no-store',
    });
    const storedData = await response.json();

    const vehicles = Array.isArray(storedData.data) ? storedData.data : [];
    if (vehicles.length === 0) {
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

    const servers = Array.from(new Set(vehicles.map((v: any) => v.ip))).filter(Boolean).sort();
    const companies = Array.from(new Set(vehicles.map((v: any) => v.companyName))).filter(Boolean).sort();
    const platforms = Array.from(new Set(vehicles.map((v: any) => v.projectName))).filter(Boolean).sort();
    const regions = Array.from(new Set(vehicles.map((v: any) => v.region))).filter(Boolean).sort();
    const projects = Array.from(new Set(vehicles.map((v: any) => v.projectName))).filter(Boolean).sort();

    const filterOptions = {
      servers,
      companies,
      platforms,
      regions,
      projects
    };

    return NextResponse.json({
      success: true,
      message: 'Filter options refreshed successfully',
      data: filterOptions,
      vehicleCount: vehicles.length,
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