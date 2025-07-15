import { NextRequest, NextResponse } from 'next/server';
import { readVehicleData } from '@/Utils/dataStorage';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Simple cache info without Redis
    const cacheInfo = {
      type: 'file',
      status: 'available',
      source: 'JSON file'
    };
    
    // Test data loading performance
    const dataStartTime = Date.now();
    const data = await readVehicleData();
    const dataLoadTime = Date.now() - dataStartTime;
    const vehicles = data?.vehicles || [];
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      performance: {
        totalTime: `${totalTime}ms`,
        dataLoadTime: `${dataLoadTime}ms`,
        vehicleCount: vehicles.length,
        dataSize: JSON.stringify(vehicles).length,
        compressedSize: vehicles.length > 0 ? 'N/A' : 'N/A'
      },
      cacheInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in debug cache:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST() {
  try {
    // Test setting some data
    const testVehicles = [
      { id: 1, name: 'Test Vehicle 1' },
      { id: 2, name: 'Test Vehicle 2' }
    ];
    
    const testMetadata = {
      lastUpdated: new Date().toISOString(),
      metadata: { test: true }
    };
    
    console.log('🧪 Test data created (no Redis cache to set)');
    
    return NextResponse.json({
      success: true,
      message: 'Test data created (no Redis cache)',
      setCount: testVehicles.length,
      readCount: 0, // No Redis to read from
      metadataMatch: false, // No Redis to compare
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug cache test:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test cache',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 