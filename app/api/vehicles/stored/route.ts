import { NextRequest, NextResponse } from 'next/server';
import { getCachedVehicles, getCachedMetadata } from '@/Utils/redis';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10000'); // Default to 10k per page
    
    // Load from Redis
    console.log('🔄 Loading data from Redis...');
    const [vehiclesResult, metadata] = await Promise.all([
      getCachedVehicles(),
      getCachedMetadata()
    ]);
    
    const { vehicles, total } = vehiclesResult;
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVehicles = vehicles.slice(startIndex, endIndex);
    
    const loadTime = Date.now() - startTime;
    console.log(`⚡ API loaded ${paginatedVehicles.length}/${total} vehicles (page ${page}) from Redis in ${loadTime}ms`);
    
    const responseData = {
      success: true,
      data: paginatedVehicles,
      pagination: {
        page,
        pageSize,
        total: total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: (page * pageSize) < total
      },
      metadata: metadata ? {
        lastUpdated: metadata.lastUpdated,
        totalRecords: total,
        metadata: metadata.metadata
      } : null,
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      source: 'redis'
    };

    // Return with Vercel Edge Cache headers
    return NextResponse.json(responseData, {
      headers: {
        // Cache for 24 hours at the edge
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        // Also cache in browser for 1 hour
        'CDN-Cache-Control': 'public, max-age=3600',
        // Vercel-specific cache headers
        'Vercel-CDN-Cache-Control': 'public, max-age=86400',
        'Vercel-Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('Error fetching stored vehicles:', error);
    
    const errorResponse = {
      success: true,
      data: [],
      pagination: {
        page: 1,
        pageSize: 10000,
        total: 0,
        totalPages: 1,
        hasMore: false
      },
      metadata: null,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' // Cache errors for 5 minutes
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Invalidate Vercel Edge Cache
    revalidatePath('/api/vehicles/stored');
    
    console.log('🔄 Vercel Edge Cache invalidated for /api/vehicles/stored');
    
    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to invalidate cache',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 