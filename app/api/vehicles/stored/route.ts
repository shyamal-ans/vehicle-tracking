import { NextRequest, NextResponse } from 'next/server';

const credentials = {
  username: 'shyamal@ansgujarat.in',
  password: 'Horizon@0906',
};

const JSESSIONID = '7120FB4EB2CE3E647CE658410348647D';

async function getAuthCode() {
  const res = await fetch('http://13.233.185.89/webservice?token=generateAccessToken', {
    method: 'POST',
    cache: 'no-store',
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

async function fetchLiveVehicleData() {
  const token = await getAuthCode();
  const allVehicles: any[] = [];
  let pageNo = 1;
  const pageSize = 100;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const startDate = `${yyyy}-${mm}-${dd} 00:00:00`;
  const endDate = `${yyyy}-${mm}-${dd} 23:59:59`;

  while (true) {
    const response = await fetch('http://13.233.185.89/webservice?token=getAdminData', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'auth-code': token,
        'Cookie': `JSESSIONID=${JSESSIONID}`,
      },
      body: JSON.stringify({
        adminCode: 'CUS-UT002',
        projectId: '16,17,21,22,34,37,40,41,46,48,49,52,53,58,59,72,77',
        startDate,
        endDate,
        pageNo,
        pageSize,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Live vehicle fetch failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!data?.data || data.data.length === 0) break;

    allVehicles.push(...data.data);
    if (data.data.length < pageSize) break;
    pageNo++;
  }

  return allVehicles;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '100');

  try {
    console.log('🔄 Fetching live vehicle data from external API...');
    const vehicles = await fetchLiveVehicleData();
    const total = vehicles.length;
    const safePageSize = pageSize > 0 ? pageSize : total || 1;
    const startIndex = (page > 0 ? page - 1 : 0) * safePageSize;
    const pagedData = vehicles.slice(startIndex, startIndex + safePageSize);
    const totalPages = safePageSize > 0 ? Math.max(1, Math.ceil(total / safePageSize)) : 1;
    const loadTime = Date.now() - startTime;

    const responseData = {
      success: true,
      data: pagedData,
      pagination: {
        page: page > 0 ? page : 1,
        pageSize: safePageSize,
        total,
        totalPages,
        hasMore: startIndex + safePageSize < total,
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalRecords: total,
        metadata: {
          source: 'live',
          fetchedAt: new Date().toISOString(),
        },
      },
      timestamp: new Date().toISOString(),
      loadTime: `${loadTime}ms`,
      source: 'live',
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching live vehicle data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching live vehicle data',
      data: [],
      pagination: {
        page: page > 0 ? page : 1,
        pageSize: pageSize > 0 ? pageSize : 0,
        total: 0,
        totalPages: 1,
        hasMore: false,
      },
      metadata: null,
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to trigger data refresh
    console.log('🔄 Manual data refresh requested');
    
    return NextResponse.json({
      success: true,
      message: 'Manual refresh endpoint - use /api/cron/fetch-vehicles to refresh data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual refresh:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process refresh request',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 