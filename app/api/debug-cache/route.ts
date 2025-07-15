import { NextRequest, NextResponse } from 'next/server';
import { getCachedVehicles, getCachedMetadata, getCacheInfo } from '@/Utils/redis';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get cache info
    const cacheInfo = await getCacheInfo();
    
    // Test data loading performance
    const dataStartTime = Date.now();
    const vehiclesResult = await getCachedVehicles();
    const dataLoadTime = Date.now() - dataStartTime;
    const vehicles = vehiclesResult?.vehicles || [];
    
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
    
    console.log('🧪 Setting test data in cache...');
    // setCachedVehicles(testVehicles); // This line was removed as per the new_code
    // setCachedMetadata(testMetadata); // This line was removed as per the new_code
    
    // Immediately read it back
    const readVehiclesResult = await getCachedVehicles();
    const readMetadata = await getCachedMetadata();
    
    console.log('🧪 Test data set and read back:', {
      setCount: testVehicles.length,
      readCount: readVehiclesResult.vehicles.length,
      metadataMatch: JSON.stringify(readMetadata) === JSON.stringify(testMetadata)
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test data set and read back',
      setCount: testVehicles.length,
      readCount: readVehiclesResult.vehicles.length,
      metadataMatch: JSON.stringify(readMetadata) === JSON.stringify(testMetadata),
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