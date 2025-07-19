import { NextRequest, NextResponse } from 'next/server';
import { appendErpData, writeErpData, cleanOldErpData, readErpData, needsErpDataFetch, getErpDataAge } from '@/Utils/dataStorage';

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

async function fetchAllErpVehicles() {
  const token = await getAuthCode();
  
  try {
    const res = await fetch('http://13.233.185.89/webservice?token=getERPVehicleData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-code': token,
        'Cookie': `JSESSIONID=${JSESSIONID}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ERP data fetch failed: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    
    if (!data?.data || !Array.isArray(data.data)) {
      console.log('⚠️ No ERP vehicles found in API response or invalid data format');
      return [];
    }

    console.log(`📊 Fetched ${data.data.length} ERP vehicles from API`);
    return data.data;
  } catch (error) {
    console.error('Error fetching ERP vehicles:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 ERP Cron job triggered - checking data freshness...');
    
    // Parse request body to check for overwrite parameter
    let shouldOverwrite = false;
    try {
      const body = await request.json();
      shouldOverwrite = body.overwrite || false;
      console.log(`📋 ERP Overwrite mode: ${shouldOverwrite}`);
    } catch (error) {
      console.log('📋 No ERP overwrite parameter provided, using default logic');
    }
    
    // Get current data age and vehicle count
    const dataAge = await getErpDataAge();
    const currentData = await readErpData();
    const currentVehicleCount = currentData?.vehicles?.length || 0;
    
    console.log(`📊 Current ERP data age: ${dataAge?.toFixed(1)} hours, vehicles: ${currentVehicleCount}`);
    
    // Check if data is from today
    const currentDate = new Date();
    const todayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    
    let isDataFromToday = false;
    if (currentData?.metadata?.startDate) {
      const dataDate = currentData.metadata.startDate.split(' ')[0]; // Extract date part
      isDataFromToday = dataDate === todayString;
      console.log(`📅 ERP data date: ${dataDate}, Today: ${todayString}, Is from today: ${isDataFromToday}`);
    }
    
    // Force fetch if there are 0 vehicles, regardless of data age
    if (currentVehicleCount === 0) {
      console.log('🚨 No ERP vehicles found - forcing fetch from external API');
    }
    // Check if data is from today and fresh (less than 1 hour old) and not in overwrite mode
    else if (!shouldOverwrite && isDataFromToday && dataAge !== null && dataAge < 1) {
      console.log('✅ ERP data is from today and fresh (less than 1 hour old) - skipping fetch');
      return NextResponse.json({
        success: true,
        message: 'ERP data is from today and fresh, no fetch needed',
        type: 'skip_fresh',
        dataAge: dataAge,
        vehicleCount: currentVehicleCount,
        isDataFromToday: true,
        timestamp: new Date().toISOString()
      });
    }
    // Data is from previous day or overwrite mode - ALWAYS fetch new data
    else if (!isDataFromToday || shouldOverwrite) {
      console.log(shouldOverwrite ? '🔄 ERP overwrite mode enabled - fetching fresh data' : '📅 ERP data is from previous day - fetching fresh data for today');
    }
    // Data is from today but older than 1 hour - refresh
    else {
      console.log('🔄 ERP data is from today but older than 1 hour - refreshing data');
    }
    
    console.log('🚀 Fetching fresh ERP data from API...');

    // Fetch all vehicles from the API
    const vehicles = await fetchAllErpVehicles();
    
    if (vehicles.length === 0) {
      console.log('⚠️ No ERP vehicles found in API response');
      return NextResponse.json({ 
        success: true,
        message: 'No ERP vehicles found',
        type: 'empty',
        newVehicles: 0,
        totalVehicles: 0,
        lastUpdated: new Date().toISOString(),
        timestamp: new Date().toISOString()
      });
    }

    // Get today's date range for metadata
    const todayForMetadata = new Date();
    const yyyy = todayForMetadata.getFullYear();
    const mm = String(todayForMetadata.getMonth() + 1).padStart(2, "0");
    const dd = String(todayForMetadata.getDate()).padStart(2, "0");
    const startDate = `${yyyy}-${mm}-${dd} 00:00:00`;
    const endDate = `${yyyy}-${mm}-${dd} 23:59:59`;

    // Prepare metadata
    const metadata = {
      adminCode: "CUS-UT002",
      projectId: "16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77",
      startDate,
      endDate
    };

    // Store new data (overwrite if from previous day, append if from today)
    let success;
    if (shouldOverwrite || !isDataFromToday) {
      // Overwrite completely for previous day data
      const vehiclesWithMetadata = vehicles.map((vehicle: any) => ({
        ...vehicle,
        fetchedAt: new Date().toISOString(),
        startDate: metadata.startDate,
        endDate: metadata.endDate
      }));
      
      const updatedData = {
        vehicles: vehiclesWithMetadata,
        lastUpdated: new Date().toISOString(),
        totalRecords: vehiclesWithMetadata.length,
        metadata
      };
      
      success = await writeErpData(updatedData);
      console.log(`🔄 Completely overwrote ERP vehicle data with ${vehiclesWithMetadata.length} new vehicles`);
    } else {
      // Append for same day data
      success = await appendErpData(vehicles, metadata);
    }
    
    if (!success) {
      throw new Error('Failed to store ERP vehicle data');
    }

    // Clean old data (keep last 30 days)
    const cleaned = await cleanOldErpData(30);
    if (cleaned) {
      console.log('🧹 Old ERP data cleaned successfully');
    }

    // Refresh filter options after data update
    try {
      const filterOptionsResponse = await fetch(`${request.nextUrl.origin}/api/erp-vehicles/filter-options`, {
        method: 'POST'
      });
      if (filterOptionsResponse.ok) {
        console.log('🔄 ERP filter options refreshed successfully');
      }
    } catch (error) {
      console.log('⚠️ Failed to refresh ERP filter options:', error);
    }

    // Get updated data for response
    const updatedData = await readErpData();
    
    console.log(`✅ ERP Cron job completed successfully`);
    console.log(`📁 Total ERP vehicles stored: ${updatedData?.totalRecords || 0}`);

    return NextResponse.json({
      success: true,
      message: 'ERP Cron job completed successfully',
      type: 'cron_refresh',
      newVehicles: vehicles.length,
      totalVehicles: updatedData?.totalRecords || 0,
      lastUpdated: updatedData?.lastUpdated || new Date().toISOString(),
      dataAge: dataAge,
      isDataFromToday: true,
      dataDate: todayString,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in ERP cron job:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 