import { NextRequest, NextResponse } from 'next/server';
import { getCacheInfo, hasCachedData } from '@/Utils/cache';

export async function GET() {
  try {
    const cacheInfo = getCacheInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        ...cacheInfo,
        hasData: hasCachedData(),
        environment: process.env.NODE_ENV,
        isVercel: process.env.VERCEL === '1',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting cache status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 