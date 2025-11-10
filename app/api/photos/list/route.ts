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

    console.log('=== PHOTOS LIST REQUEST ===');
    console.log('Has access_token cookie:', !!accessToken);

    if (!accessToken) {
      console.error('No access token found in cookies');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decodedToken = decodeURIComponent(accessToken);
    console.log('Token length:', decodedToken.length);
    
    // Verify token has the right scope
    try {
      const tokenInfoUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(decodedToken)}`;
      const tokenCheckRes = await fetch(tokenInfoUrl);
      if (tokenCheckRes.ok) {
        const tokenInfo = await tokenCheckRes.json();
        console.log('Token scopes:', tokenInfo.scope);
        console.log('Has photoslibrary scope:', tokenInfo.scope?.includes('photoslibrary'));
      }
    } catch (e) {
      console.error('Token check failed:', e);
    }

    const url = new URL(request.url);
    const pageToken = url.searchParams.get('pageToken');

    // Request to list media items from Google Photos
    const photosUrl = pageToken
      ? `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=50&pageToken=${pageToken}`
      : 'https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=50';

    const photosRes = await fetch(photosUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${decodedToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Photos API response status:', photosRes.status);
    console.log('Photos API response ok:', photosRes.ok);

    if (!photosRes.ok) {
      const errorText = await photosRes.text();
      console.error('=== FULL ERROR FROM GOOGLE ===');
      console.error('Status:', photosRes.status);
      console.error('Error text:', errorText);
      console.error('Request URL:', photosUrl);
      console.error('==============================');
      
      let errorMessage = 'Failed to fetch photos';
      let parsedError = null;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson;
        errorMessage = errorJson.error?.message || errorJson.error || errorMessage;
        
        // Check for specific error codes
        if (errorJson.error?.code === 403) {
          console.error('403 Error Details:', errorJson.error);
          if (errorJson.error.status === 'PERMISSION_DENIED') {
            errorMessage = `Permission Denied: ${errorJson.error.message}\n\nPossible causes:\n- Photos Library API not enabled in the correct project\n- API is enabled but not yet propagated (wait 2-3 minutes)\n- Account has no photos`;
          }
        }
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: errorText, 
          status: photosRes.status,
          parsedError: parsedError 
        },
        { status: photosRes.status }
      );
    }

    const photosData = await photosRes.json();

    return NextResponse.json({
      mediaItems: photosData.mediaItems || [],
      nextPageToken: photosData.nextPageToken || null,
    });
  } catch (e) {
    console.error('Photos list error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
