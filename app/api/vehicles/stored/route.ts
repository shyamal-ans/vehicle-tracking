import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData } from '@/Utils/dataStorage';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Load all data from JSON file
    console.log('🔄 Loading all data from JSON file...');
    const data = await readVehicleData();
    
    if (!data) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          pageSize: 0,
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
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ API loaded all ${data.vehicles.length} vehicles from JSON file in ${loadTime}ms`);
    
    const responseData = {
      success: true,
      data: data.vehicles, // Return all vehicles
      pagination: {
        page: 1,
        pageSize: data.vehicles.length,
        total: data.vehicles.length,
        totalPages: 1,
        hasMore: false
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

    // Return without caching to ensure fresh data
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
        pageSize: 0,
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