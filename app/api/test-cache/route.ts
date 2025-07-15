import { NextResponse } from 'next/server';
import { getDataStats, clearAllVehicleData, readVehicleData, needsDataFetch, getDataAge } from '@/Utils/dataStorage';

export async function GET() {
  try {
    const dataStats = await getDataStats();
    const vehicleData = await readVehicleData();
    const needsFetch = await needsDataFetch();
    const dataAge = await getDataAge();
    
    // Simple cache info without Redis
    const cacheInfo = {
      type: 'file',
      status: 'available',
      source: 'JSON file'
    };
    
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
    const success = await clearAllVehicleData();
    
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