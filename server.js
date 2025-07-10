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
  const dataFile = path.join(dataDir, 'vehicle-data.json');
  return fs.existsSync(dataFile);
}

// Vehicle data fetch function
async function fetchVehicleData() {
  try {
    console.log('🚀 Starting scheduled vehicle data fetch...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/fetch-vehicles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'default-secret'}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Scheduled vehicle fetch completed:', result.message);
    } else {
      console.error('❌ Scheduled vehicle fetch failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error in scheduled vehicle fetch:', error.message);
  }
}

// Setup cron job to run every 24 hours at 2 AM
function setupCronJob() {
  // Schedule: 0 2 * * * = Every day at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    console.log('⏰ Cron job triggered: Fetching vehicle data...');
    fetchVehicleData();
  }, {
    scheduled: true,
    timezone: "UTC" // You can change this to your timezone
  });

  console.log('📅 Cron job scheduled: Vehicle data fetch every 24 hours at 2 AM UTC');
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
      console.log('📁 Vehicle data file exists. Waiting for next scheduled fetch (2 AM UTC).');
    }
  });
});