import { NextRequest, NextResponse } from 'next/server';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

// In-memory storage for cron jobs (in production, use a database)
let cronJobs: { [key: string]: cron.ScheduledTask } = {};

// Check if vehicle data file exists
function checkVehicleDataExists() {
  const dataDir = path.join(process.cwd(), 'data');
  const vehiclesFile = path.join(dataDir, 'vehicles.json');
  const metadataFile = path.join(dataDir, 'metadata.json');
  return fs.existsSync(vehiclesFile) && fs.existsSync(metadataFile);
}

// Check if data is from today
function isDataFromToday() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const metadataFile = path.join(dataDir, 'metadata.json');
    
    if (!fs.existsSync(metadataFile)) {
      return false;
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
    const currentDate = new Date();
    const todayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    
    if (metadata.metadata?.startDate) {
      const dataDate = metadata.metadata.startDate.split(' ')[0];
      return dataDate === todayString;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking data freshness:', error instanceof Error ? error.message : error);
    return false;
  }
}

// Vehicle data fetch function
async function fetchVehicleData() {
  try {
    console.log('🚀 Starting scheduled vehicle data fetch...');
    console.log('🔗 Calling API endpoint: /api/cron/fetch-vehicles');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/fetch-vehicles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'default-secret'}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 API Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Scheduled vehicle fetch completed:', result.message);
      console.log('📊 Fetch result:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.error('❌ Scheduled vehicle fetch failed:', response.status, response.statusText);
      console.error('❌ Error details:', errorText);
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Error in scheduled vehicle fetch:', error instanceof Error ? error.message : error);
    console.error('❌ Full error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, schedule, jobId } = await request.json();
    
    if (action === 'start') {
      // Check if cron job already exists
      if (cronJobs[jobId]) {
        return NextResponse.json({ 
          success: true, 
          message: `Cron job ${jobId} is already running` 
        });
      }
      
      // Start a new cron job
      const cronJob = cron.schedule(schedule || '0 2 * * *', async () => {
        console.log(`⏰ Cron job ${jobId} triggered at ${new Date().toISOString()}`);
        await fetchVehicleData();
      }, {
        scheduled: true,
        timezone: "UTC"
      });
      
      cronJobs[jobId] = cronJob;
      
      // Check if we need to fetch data immediately
      console.log('📁 Checking if vehicle data exists and is fresh...');
      
      if (!checkVehicleDataExists()) {
        console.log('📁 No vehicle data file found. Running initial fetch...');
        await fetchVehicleData();
      } else {
        console.log('📁 Vehicle data file exists. Checking if data is from today...');
        
        if (!isDataFromToday()) {
          console.log('📅 Data is stale. Running immediate fetch...');
          await fetchVehicleData();
        } else {
          console.log('✅ Data is fresh. Waiting for next scheduled fetch.');
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Cron job ${jobId} started with schedule: ${schedule}`,
        immediateFetch: !checkVehicleDataExists() || !isDataFromToday()
      });
    }
    
    if (action === 'stop') {
      // Stop a cron job
      if (cronJobs[jobId]) {
        cronJobs[jobId].stop();
        delete cronJobs[jobId];
        return NextResponse.json({ 
          success: true, 
          message: `Cron job ${jobId} stopped` 
        });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    });
    
  } catch (error) {
    console.error('Error in cron schedule API:', error instanceof Error ? error.message : error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  // Return list of active cron jobs
  const activeJobs = Object.keys(cronJobs);
  return NextResponse.json({ 
    success: true, 
    activeJobs,
    count: activeJobs.length,
    dataExists: checkVehicleDataExists(),
    dataIsFresh: isDataFromToday()
  });
} 