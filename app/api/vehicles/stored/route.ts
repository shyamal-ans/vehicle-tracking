import { NextRequest, NextResponse } from 'next/server';
import { getVehicles, readVehicleData } from '@/Utils/dataStorage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '100');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Get vehicles with filters
    const result = getVehicles({
      search,
      page,
      pageSize,
      startDate,
      endDate
    });

    // Get metadata about the stored data
    const storedData = readVehicleData();
    const metadata = storedData ? {
      lastUpdated: storedData.lastUpdated,
      totalRecords: storedData.totalRecords,
      metadata: storedData.metadata
    } : null;

    return NextResponse.json({
      success: true,
      data: result.vehicles,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize)
      },
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching stored vehicles:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stored vehicle data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get filters from request body
    const { search, page = 1, pageSize = 100, startDate, endDate } = body;

    // Get vehicles with filters
    const result = getVehicles({
      search,
      page,
      pageSize,
      startDate,
      endDate
    });

    // Get metadata about the stored data
    const storedData = readVehicleData();
    const metadata = storedData ? {
      lastUpdated: storedData.lastUpdated,
      totalRecords: storedData.totalRecords,
      metadata: storedData.metadata
    } : null;

    return NextResponse.json({
      success: true,
      data: result.vehicles,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize)
      },
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching stored vehicles:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stored vehicle data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 