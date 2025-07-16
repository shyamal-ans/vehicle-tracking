import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Start the vehicle data fetch cron job
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'default-secret'}`
      },
      body: JSON.stringify({
        action: 'start',
        jobId: 'vehicle-data-fetch',
        schedule: '0 2 * * *' // Every day at 2 AM UTC
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cron job initialized successfully:', result);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Cron job initialized successfully',
        result 
      });
    } else {
      console.error('❌ Failed to initialize cron job:', response.status);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to initialize cron job' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error initializing cron job:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if cron job is running
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cron/schedule`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'default-secret'}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({ 
        success: true, 
        cronStatus: result 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to check cron status' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error checking cron status:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
} 