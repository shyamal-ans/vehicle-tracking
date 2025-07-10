import { NextResponse } from 'next/server';
import { readVehicleData, needsDataFetch, getDataAge, getDataStats } from '@/Utils/dataStorage';
import { getCacheInfo } from '@/Utils/cache';

export async function GET() {
  try {
    const vehicleData = readVehicleData();
    const needsFetch = needsDataFetch();
    const dataAge = getDataAge();
    const dataStats = getDataStats();
    const cacheInfo = getCacheInfo();
    
    // Determine status
    let status = 'unknown';
    let message = '';
    
    if (needsFetch) {
      status = 'needs_fetch';
      message = 'No data available, fetch needed';
    } else if (dataAge !== null) {
      if (dataAge < 1) {
        status = 'fresh';
        message = 'Data is fresh (less than 1 hour old)';
      } else if (dataAge < 24) {
        status = 'recent';
        message = `Data is recent (${dataAge.toFixed(1)} hours old)`;
      } else {
        status = 'stale';
        message = `Data is stale (${dataAge.toFixed(1)} hours old)`;
      }
    } else {
      status = 'no_data';
      message = 'No data available';
    }
    
    return NextResponse.json({
      success: true,
      status,
      message,
      data: {
        hasData: !!vehicleData,
        totalVehicles: vehicleData?.totalRecords || 0,
        lastUpdated: vehicleData?.lastUpdated || null,
        dataAge,
        needsFetch,
        dataStats,
        cacheInfo
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting vehicle status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get vehicle status',
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 'error',
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 