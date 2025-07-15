import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const VEHICLES_FILE = path.join(process.cwd(), 'data', 'vehicles.json');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iterations = parseInt(searchParams.get('iterations') || '5');
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      // Raw file read
      const fileContent = await fs.readFile(VEHICLES_FILE, 'utf-8');
      const parseTime = Date.now();
      
      // JSON parse
      const vehicles = JSON.parse(fileContent);
      const endTime = Date.now();
      
      results.push({
        iteration: i + 1,
        fileReadTime: parseTime - startTime,
        jsonParseTime: endTime - parseTime,
        totalTime: endTime - startTime,
        vehicleCount: vehicles.length,
        fileSize: fileContent.length
      });
    }
    
    const avgFileRead = results.reduce((sum, r) => sum + r.fileReadTime, 0) / results.length;
    const avgJsonParse = results.reduce((sum, r) => sum + r.jsonParseTime, 0) / results.length;
    const avgTotal = results.reduce((sum, r) => sum + r.totalTime, 0) / results.length;
    
    return NextResponse.json({
      success: true,
      iterations,
      results,
      averages: {
        fileReadTime: Math.round(avgFileRead),
        jsonParseTime: Math.round(avgJsonParse),
        totalTime: Math.round(avgTotal)
      },
      fileSize: results[0]?.fileSize || 0,
      vehicleCount: results[0]?.vehicleCount || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Performance test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 