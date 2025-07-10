import { NextResponse } from 'next/server';
import { getCachedVehicles, setCachedVehicles, getCachedMetadata, setCachedMetadata, getCacheInfo } from '@/Utils/cache';

export async function GET() {
  try {
    const cacheInfo = getCacheInfo();
    const vehicles = getCachedVehicles();
    const metadata = getCachedMetadata();
    
    return NextResponse.json({
      success: true,
      cacheInfo,
      vehiclesCount: vehicles.length,
      hasMetadata: !!metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug cache',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
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
    setCachedVehicles(testVehicles);
    setCachedMetadata(testMetadata);
    
    // Immediately read it back
    const readVehicles = getCachedVehicles();
    const readMetadata = getCachedMetadata();
    
    console.log('🧪 Test data set and read back:', {
      setCount: testVehicles.length,
      readCount: readVehicles.length,
      metadataMatch: JSON.stringify(readMetadata) === JSON.stringify(testMetadata)
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test data set and read back',
      setCount: testVehicles.length,
      readCount: readVehicles.length,
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