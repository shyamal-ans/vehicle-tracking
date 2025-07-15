import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData } from '@/Utils/dataStorage';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10000'); // Default to 10k per page
    
    // Load from JSON file
    console.log('🔄 Loading data from JSON file...');
    const data = await readVehicleData();
    
    if (!data) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: 10000,
          total: 0,
          totalPages: 1,
          hasMore: false
        },
        metadata: null,
        timestamp: new Date().toISOString(),
        loadTime: `${Date.now() - startTime}ms`,
        source: 'file'
      });
    }
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVehicles = data.vehicles.slice(startIndex, endIndex);
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ API loaded ${paginatedVehicles.length}/${data.vehicles.length} vehicles (page ${page}) from JSON file in ${loadTime}ms`);
    
    const responseData = {
      success: true,
      data: paginatedVehicles,
      pagination: {
        page,
        pageSize,
        total: data.vehicles.length,
        totalPages: Math.ceil(data.vehicles.length / pageSize),
        hasMore: (page * pageSize) < data.vehicles.length
      },
      metadata: {
        lastUpdated: data.lastUpdated,
        totalRecords: data.vehicles.length,
        metadata: data.metadata
      },
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      source: 'file'
    };

    // Return with cache headers for browser caching
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes in browser
      }
    });

  } catch (error) {
    console.error('Error fetching stored vehicles:', error);
    
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        pageSize: 10000,
        total: 0,
        totalPages: 1,
        hasMore: false
      },
      metadata: null,
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to trigger data refresh
    console.log('🔄 Manual data refresh requested');
    
    return NextResponse.json({
      success: true,
      message: 'Manual refresh endpoint - use /api/cron/fetch-vehicles to refresh data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual refresh:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process refresh request',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 