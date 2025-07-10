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
    
    // Get filter parameters
    const server = searchParams.get('server') || undefined;
    const status = searchParams.get('status') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const company = searchParams.get('company') || undefined;
    const region = searchParams.get('region') || undefined;
    const project = searchParams.get('project') || undefined;

    // Get vehicles with filters
    const result = getVehicles({
      search,
      page,
      pageSize,
      startDate,
      endDate,
      server,
      status,
      platform,
      company,
      region,
      project
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
    
    // Return empty data instead of error for better UX
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        pageSize: 100,
        total: 0,
        totalPages: 1
      },
      metadata: null,
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get filters from request body
    const { 
      search, 
      page = 1, 
      pageSize = 100, 
      startDate, 
      endDate,
      server,
      status,
      platform,
      company,
      region,
      project
    } = body;

    // Get vehicles with filters
    const result = getVehicles({
      search,
      page,
      pageSize,
      startDate,
      endDate,
      server,
      status,
      platform,
      company,
      region,
      project
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
    
    // Return empty data instead of error for better UX
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        pageSize: 100,
        total: 0,
        totalPages: 1
      },
      metadata: null,
      timestamp: new Date().toISOString()
    });
  }
} 