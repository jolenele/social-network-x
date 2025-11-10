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

    // List selected media items from the session
    const mediaItemsUrl = `https://photospicker.googleapis.com/v1/sessions/${sessionId}/mediaItems`;
    
    const mediaRes = await fetch(mediaItemsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decodedToken}`,
      },
    });

    if (!mediaRes.ok) {
      const errorText = await mediaRes.text();
      console.error('List media items error:', mediaRes.status, errorText);
      return NextResponse.json(
        { error: 'Failed to list media items', details: errorText },
        { status: mediaRes.status }
      );
    }

    const mediaData = await mediaRes.json();
    
    return NextResponse.json({
      mediaItems: mediaData.mediaItems || [],
    });
  } catch (e) {
    console.error('List media items error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
