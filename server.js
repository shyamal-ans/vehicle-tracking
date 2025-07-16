const { createServer } = require("http");
const next = require("next");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Check if vehicle data file exists
function checkVehicleDataExists() {
  const dataDir = path.join(process.cwd(), 'data');
  const vehiclesFile = path.join(dataDir, 'vehicles.json');
  const metadataFile = path.join(dataDir, 'metadata.json');
  return fs.existsSync(vehiclesFile) && fs.existsSync(metadataFile);
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
    } else {
      const errorText = await response.text();
      console.error('❌ Scheduled vehicle fetch failed:', response.status, response.statusText);
      console.error('❌ Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error in scheduled vehicle fetch:', error.message);
    console.error('❌ Full error:', error);
  }
}

// Setup cron job to run every 24 hours at 2 AM
function setupCronJob() {
  // Schedule: 0 2 * * * = Every day at 2:00 AM
  const cronJob = cron.schedule('0 2 * * *', () => {
    const now = new Date();
    console.log(`⏰ Cron job triggered at ${now.toISOString()}: Fetching vehicle data...`);
    fetchVehicleData();
  }, {
    scheduled: true,
    timezone: "UTC" // You can change this to your timezone
  });

  // Log when the next run will be
  console.log(`📅 Cron job scheduled: Vehicle data fetch every 24 hours at 2 AM UTC`);
  console.log(`📅 Next scheduled run: Tomorrow at 2:00 AM UTC`);
  
  // Add error handling for the cron job
  cronJob.on('error', (error) => {
    console.error('❌ Cron job error:', error);
  });
  
  return cronJob;
}

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    
    // Setup cron job after server starts
    setupCronJob();
    
    // Check if vehicle data exists and fetch immediately if not
    if (!checkVehicleDataExists()) {
      console.log('📁 No vehicle data file found. Running initial fetch...');
      fetchVehicleData();
    } else {
      console.log('📁 Vehicle data file exists. Checking if data is from today...');
      
      // Check if data is from today, if not fetch immediately
      const fs = require('fs');
      const dataDir = path.join(process.cwd(), 'data');
      const metadataFile = path.join(dataDir, 'metadata.json');
      
      try {
        if (fs.existsSync(metadataFile)) {
          const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
          const currentDate = new Date();
          const todayString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
          
          console.log(`🔍 Server startup check - Today: ${todayString}, Data date: ${metadata.metadata?.startDate || 'unknown'}`);
          
          if (metadata.metadata?.startDate) {
            const dataDate = metadata.metadata.startDate.split(' ')[0];
            const isDataFromToday = dataDate === todayString;
            
            console.log(`📅 Date comparison - Data: ${dataDate}, Today: ${todayString}, Is from today: ${isDataFromToday}`);
            
            if (!isDataFromToday) {
              console.log(`📅 Data is from ${dataDate}, but today is ${todayString}. Running immediate fetch...`);
              fetchVehicleData();
            } else {
              console.log(`✅ Data is from today (${todayString}). Waiting for next scheduled fetch (2 AM UTC).`);
            }
          } else {
            console.log('📁 No date metadata found. Running immediate fetch...');
            fetchVehicleData();
          }
        } else {
          console.log('📁 No metadata file found. Running immediate fetch...');
          fetchVehicleData();
        }
      } catch (error) {
        console.log('❌ Error checking data date:', error.message);
        console.log('Running immediate fetch...');
        fetchVehicleData();
      }
    }
  });
});