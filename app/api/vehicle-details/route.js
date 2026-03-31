import { NextResponse } from 'next/server';

// Updated 2026-03-24: Credentials for token API.
const credentials = {
  username: 'shyamal@ansgujarat.in',
  password: 'Horizon@0906',
};

// Updated 2026-03-24: Cookies required by token/data APIs.
const TOKEN_COOKIE =
  'JSESSIONID=CBE37DC7D348F8BD489A1CDFB9B0D2CC; JSESSIONID=0A148E37FE80F80FF9BD32584DA04FD2';
const DATA_COOKIE =
  'JSESSIONID=CBE37DC7D348F8BD489A1CDFB9B0D2CC; JSESSIONID=2356C787F0B6539092BFFFE8E57261C6';

async function getAuthCode() {
  // Updated 2026-03-24: Token API call.
  const res = await fetch('http://13.233.185.89/webservice?token=generateAccessToken', {
    method: 'POST', // ✅ Use POST here instead of GET
    headers: {
      'Content-Type': 'application/json',
      'Cookie': TOKEN_COOKIE,
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

export async function GET() {
  try {
    const token = await getAuthCode();
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = await getAuthCode();
    const payload = await request.json();

    // Updated 2026-03-24: Admin data API call.
    const res = await fetch('http://13.233.185.89/webservice?token=getAdminData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-code': token,
        'Cookie': DATA_COOKIE,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Data fetch failed: ${res.status} - ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
