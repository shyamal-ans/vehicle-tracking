import { NextResponse } from 'next/server';
import { readVehicleData } from '@/Utils/dataStorage';

export async function GET() {
  try {
    const data = await readVehicleData();
    
    // Sample some project names from the data
    const sampleProjects = data?.vehicles?.slice(0, 5).map((v: any) => ({
      projectName: v.projectName,
      projectId: v.projectId
    })) || [];
    
    return NextResponse.json({
      success: true,
      cachedOptions: null, // No Redis cache
      hasCachedOptions: false, // No Redis cache
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
    console.log('🧹 No cache to clear (Redis removed)');
    
    return NextResponse.json({
      success: true,
      message: 'No cache to clear (Redis removed)',
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