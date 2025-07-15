import { NextResponse } from 'next/server';
import { getCachedFilterOptions, clearFilterOptionsCache } from '@/Utils/redis';
import { readVehicleData } from '@/Utils/dataStorage';

export async function GET() {
  try {
    const cachedOptions = await getCachedFilterOptions();
    const data = await readVehicleData();
    
    // Sample some project names from the data
    const sampleProjects = data?.vehicles?.slice(0, 5).map((v: any) => ({
      projectName: v.projectName,
      projectId: v.projectId
    })) || [];
    
    return NextResponse.json({
      success: true,
      cachedOptions,
      hasCachedOptions: !!cachedOptions,
      sampleProjects,
      totalVehicles: data?.total || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug filter options:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug filter options',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🧹 Clearing filter options cache...');
    await clearFilterOptionsCache();
    
    return NextResponse.json({
      success: true,
      message: 'Filter options cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing filter options cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear filter options cache',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 