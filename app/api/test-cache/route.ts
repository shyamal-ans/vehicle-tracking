import { NextResponse } from 'next/server';
import { getDataStats, clearAllVehicleData, readVehicleData, needsDataFetch, getDataAge } from '@/Utils/dataStorage';
import { getCacheInfo } from '@/Utils/cache';

export async function GET() {
  try {
    const dataStats = getDataStats();
    const cacheInfo = getCacheInfo();
    const vehicleData = readVehicleData();
    const needsFetch = needsDataFetch();
    const dataAge = getDataAge();
    
    return NextResponse.json({
      success: true,
      dataStats,
      cacheInfo,
      hasData: !!vehicleData,
      needsFetch,
      dataAge,
      sampleVehicles: vehicleData?.vehicles?.slice(0, 3) || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test cache endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache info',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const success = clearAllVehicleData();
    
    return NextResponse.json({
      success,
      message: success ? 'All vehicle data cleared successfully' : 'Failed to clear vehicle data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 