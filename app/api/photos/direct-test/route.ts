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

    // Test 1: Verify token
    console.log('\n=== DIRECT API TEST ===');
    const tokenInfoUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(decodedToken)}`;
    const tokenRes = await fetch(tokenInfoUrl);
    const tokenInfo = await tokenRes.json();
    
    console.log('Token valid:', tokenRes.ok);
    console.log('Token scopes:', tokenInfo.scope);
    console.log('Has photoslibrary scope:', tokenInfo.scope?.includes('photoslibrary.readonly'));

    // Test 2: Try to access Photos API
    const photosUrl = 'https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=1';
    console.log('\nTrying to fetch from:', photosUrl);
    
    const photosRes = await fetch(photosUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decodedToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', photosRes.status);
    console.log('Response ok:', photosRes.ok);

    const responseText = await photosRes.text();
    console.log('Response body:', responseText);
    console.log('Response headers:', Object.fromEntries(photosRes.headers.entries()));

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      if (responseData.error) {
        console.error('ERROR FROM GOOGLE:', JSON.stringify(responseData.error, null, 2));
      }
    } catch (e) {
      responseData = responseText;
    }

    return NextResponse.json({
      tokenValid: tokenRes.ok,
      tokenScopes: tokenInfo.scope?.split(' ') || [],
      hasPhotosScope: tokenInfo.scope?.includes('photoslibrary.readonly') || false,
      photosApiStatus: photosRes.status,
      photosApiOk: photosRes.ok,
      photosApiResponse: responseData,
    });
  } catch (e) {
    console.error('Direct API test error:', e);
    return NextResponse.json(
      { error: 'Test failed', details: String(e) },
      { status: 500 }
    );
  }
}
