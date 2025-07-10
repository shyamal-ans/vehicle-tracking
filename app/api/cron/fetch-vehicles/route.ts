import { NextRequest, NextResponse } from 'next/server';
import { appendVehicleData, cleanOldData, readVehicleData } from '@/Utils/dataStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting vehicle data fetch...');
    
    // Get existing data to check if we need to fetch
    const existingData = readVehicleData();
    
    // For now, let's fetch data regardless of existing data
    // In production, you might want to add logic to check if data is recent enough
    
    const { getTodayDateStrings } = await import('@/Utils/Utils');
    const { startDate, endDate } = getTodayDateStrings();
    
    // Fetch vehicle data from external API
    const response = await fetch('https://api.example.com/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminCode: process.env.ADMIN_CODE || 'default',
        projectId: process.env.PROJECT_ID || 'default',
        startDate,
        endDate,
        pageNo: 1,
        pageSize: 1000 // Fetch more data per request
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const apiData = await response.json();
    
    if (!apiData.data || !Array.isArray(apiData.data)) {
      throw new Error('Invalid API response format');
    }

    console.log(`📊 Fetched ${apiData.data.length} vehicles from API`);

    // Prepare metadata
    const metadata = {
      adminCode: process.env.ADMIN_CODE || 'default',
      projectId: process.env.PROJECT_ID || 'default',
      startDate,
      endDate
    };

    // Append new data to existing data
    const success = appendVehicleData(apiData.data, metadata);
    
    if (!success) {
      throw new Error('Failed to store vehicle data');
    }

    // Clean old data (keep last 30 days)
    cleanOldData(30);

    // Get updated data for response
    const updatedData = readVehicleData();
    
    console.log(`✅ Vehicle data fetch completed successfully`);
    console.log(`📁 Total vehicles stored: ${updatedData?.totalRecords || 0}`);

    return NextResponse.json({
      success: true,
      message: 'Vehicle data fetched and stored successfully',
      newVehicles: apiData.data.length,
      totalVehicles: updatedData?.totalRecords || 0,
      lastUpdated: updatedData?.lastUpdated || new Date().toISOString(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in vehicle data fetch:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vehicle data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 