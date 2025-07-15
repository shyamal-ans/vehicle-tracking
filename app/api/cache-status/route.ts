import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple cache info without Redis
    const cacheInfo = {
      type: 'file',
      status: 'available',
      source: 'JSON file'
    };
    
    const hasData = true; // Always true since we're using file storage
    
    return NextResponse.json({
      success: true,
      data: {
        ...cacheInfo,
        hasData,
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