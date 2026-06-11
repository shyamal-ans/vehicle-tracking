import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - this API route must never be statically prerendered
export const dynamic = 'force-dynamic';

// Store session cookie in memory
let sessionCookie: string = '';

async function postVehicleBatch(batch: unknown[]) {
    const fetchResponse = await fetch('http://13.233.185.89:5175', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch)
    });

    const rawResponse = await fetchResponse.text();
    let parsedResponse: unknown = rawResponse;
    try {
        parsedResponse = JSON.parse(rawResponse);
    } catch {
        // keep raw text response
    }

    return {
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        data: parsedResponse
    };
}

async function pushVehicleDataWithAutoSplit(batch: unknown[]): Promise<{ pushedCount: number; responses: unknown[] }> {
    const response = await postVehicleBatch(batch);

    if (response.ok) {
        return { pushedCount: batch.length, responses: [response.data] };
    }

    if (response.status === 413 && batch.length > 1) {
        const mid = Math.ceil(batch.length / 2);
        const left = await pushVehicleDataWithAutoSplit(batch.slice(0, mid));
        const right = await pushVehicleDataWithAutoSplit(batch.slice(mid));
        return {
            pushedCount: left.pushedCount + right.pushedCount,
            responses: [...left.responses, ...right.responses]
        };
    }

    throw {
        status: response.status,
        data: response.data
    };
}

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
                    password: 'Shyamal@1166'
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
        else if (tokenType === 'pushVehicleData') {
            const { payloadData } = body;

            if (!Array.isArray(payloadData) || payloadData.length === 0) {
                return NextResponse.json({ error: 'payloadData must be a non-empty array' }, { status: 400 });
            }

            try {
                const pushResult = await pushVehicleDataWithAutoSplit(payloadData);
                return NextResponse.json({
                    result: 1,
                    message: 'Vehicle data pushed successfully',
                    pushedCount: pushResult.pushedCount,
                    totalCount: payloadData.length,
                    batches: pushResult.responses.length,
                    data: pushResult.responses
                });
            } catch (pushError: unknown) {
                const errorObj = pushError as { status?: number; data?: unknown };
                return NextResponse.json(
                    {
                        error: 'Failed to push vehicle data',
                        status: errorObj?.status ?? 500,
                        data: errorObj?.data ?? ''
                    },
                    { status: errorObj?.status ?? 500 }
                );
            }
        }

        return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });

    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
    }
}
