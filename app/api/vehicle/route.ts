import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - this API route must never be statically prerendered
export const dynamic = 'force-dynamic';

// Store session cookie in memory
let sessionCookie: string = '';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tokenType } = body;

        if (tokenType === 'generateAccessToken') {
           
            // Call the generateAccessToken API
            const fetchResponse = await fetch('http://13.233.185.89/webservice?token=generateAccessToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Referer': 'http://localhost:3001/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
                },
                body: JSON.stringify({
                    username: 'shyamal@ansgujarat.in',
                    password: 'Horizon@0906'
                })
            });

            
            // Extract session cookie from response headers
            const setCookieHeader = fetchResponse.headers.get('set-cookie');
           
            if (setCookieHeader) {
                const match = setCookieHeader.match(/JSESSIONID=([^;]+)/);
                if (match) {
                    sessionCookie = match[1];
                   
                }
            }

            const data = await fetchResponse.json();
            return NextResponse.json(data);
        } 
        else if (tokenType === 'getVehicleTrackLogs') {
            const { vehicle_no, start_date, end_date, authCode } = body;

            // Build cookie header if we have a session
            const cookieHeader = sessionCookie ? `JSESSIONID=${sessionCookie}` : '';

            
            // Call the getVehicleTrackLogs API
            const fetchResponse = await fetch('http://13.233.185.89/webservice?token=getVehicleTrackLogs', {
                method: 'POST',
                headers: {
                    'auth-code': authCode,
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Referer': 'http://localhost:3001/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
                    ...(cookieHeader && { 'Cookie': cookieHeader })
                },
                body: JSON.stringify({
                    vehicle_no,
                    start_date,
                    end_date
                })
            });

            const data = await fetchResponse.json();
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });

    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
    }
}
