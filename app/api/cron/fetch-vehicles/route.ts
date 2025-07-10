import { NextRequest, NextResponse } from 'next/server';
import { appendVehicleData, cleanOldData, readVehicleData } from '@/Utils/dataStorage';

const credentials = {
  username: 'shyamal@ansgujarat.in',
  password: 'Shyamal@1986',
};

const JSESSIONID = '7120FB4EB2CE3E647CE658410348647D';

async function getAuthCode() {
  const res = await fetch('http://13.233.185.89/webservice?token=generateAccessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `JSESSIONID=${JSESSIONID}`,
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Auth token failed: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  const token = data?.data?.token;
  if (!token) throw new Error('Auth token not found');
  return token;
}

async function fetchAllVehicles() {
  const token = await getAuthCode();
  const allVehicles: any[] = [];
  let pageNo = 1;
  const pageSize = 100;
  
  // Get today's date range
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const startDate = `${yyyy}-${mm}-${dd} 00:00:00`;
  const endDate = `${yyyy}-${mm}-${dd} 23:59:59`;

  const payload = {
    adminCode: "CUS-UT002",
    projectId: "16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77",
    startDate,
    endDate,
    pageNo,
    pageSize,
  };

  try {
    while (true) {
      const res = await fetch('http://13.233.185.89/webservice?token=getAdminData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-code': token,
          'Cookie': `JSESSIONID=${JSESSIONID}`,
        },
        body: JSON.stringify({ ...payload, pageNo }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Data fetch failed: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      
      if (!data?.data || data.data.length === 0) {
        break; // No more data
      }

      allVehicles.push(...data.data);
      
      // Check if we've reached the last page
      if (data.data.length < pageSize) {
        break;
      }
      
      pageNo++;
    }

    return allVehicles;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting vehicle data fetch...');
    
    // Check if this is initial fetch or append
    const existingData = readVehicleData();
    const isInitialFetch = !existingData;

    console.log(`🚀 Starting vehicle data fetch (${isInitialFetch ? 'INITIAL' : 'APPEND'})...`);

    // Fetch all vehicles from the API
    const vehicles = await fetchAllVehicles();
    
    if (vehicles.length === 0) {
      console.log('⚠️ No vehicles found in API response');
      return NextResponse.json({ 
        success: true,
        message: 'No vehicles found',
        type: isInitialFetch ? 'initial' : 'append',
        newVehicles: 0,
        totalVehicles: 0,
        lastUpdated: new Date().toISOString(),
        timestamp: new Date().toISOString()
      });
    }

    // Get today's date range for metadata
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const startDate = `${yyyy}-${mm}-${dd} 00:00:00`;
    const endDate = `${yyyy}-${mm}-${dd} 23:59:59`;

    // Prepare metadata
    const metadata = {
      adminCode: "CUS-UT002",
      projectId: "16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77",
      startDate,
      endDate
    };

    // Append new data to existing data
    const success = appendVehicleData(vehicles, metadata);
    
    if (!success) {
      throw new Error('Failed to store vehicle data');
    }

    // Clean old data (keep last 30 days)
    cleanOldData(30);

    // Get updated data for response
    const updatedData = readVehicleData();
    
    const actionType = isInitialFetch ? 'created' : 'updated';
    console.log(`✅ Vehicle data ${actionType} successfully`);
    console.log(`📁 Total vehicles stored: ${updatedData?.totalRecords || 0}`);

    return NextResponse.json({
      success: true,
      message: `Vehicle data ${actionType} successfully`,
      type: isInitialFetch ? 'initial' : 'append',
      newVehicles: vehicles.length,
      totalVehicles: updatedData?.totalRecords || 0,
      lastUpdated: updatedData?.lastUpdated || new Date().toISOString(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in vehicle data fetch:', error);
    
    // Return a more graceful error response
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vehicle data',
      message: error instanceof Error ? error.message : 'Unknown error',
      newVehicles: 0,
      totalVehicles: 0,
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 