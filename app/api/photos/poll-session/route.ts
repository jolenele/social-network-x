import { NextResponse } from 'next/server';

function parseCookies(cookieHeader: string | null) {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    map[key] = val;
  }
  return map;
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const accessToken = cookies['access_token'];

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decodedToken = decodeURIComponent(accessToken);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Poll the session to check if user has finished selecting
    const sessionRes = await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decodedToken}`,
      },
    });

    if (!sessionRes.ok) {
      const errorText = await sessionRes.text();
      console.error('Session poll error:', sessionRes.status, errorText);
      return NextResponse.json(
        { error: 'Failed to poll session', details: errorText },
        { status: sessionRes.status }
      );
    }

    const sessionData = await sessionRes.json();
    
    return NextResponse.json({
      mediaItemsSet: sessionData.mediaItemsSet || false,
      pollingConfig: sessionData.pollingConfig,
    });
  } catch (e) {
    console.error('Poll session error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
