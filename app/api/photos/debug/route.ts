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
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const accessToken = cookies['access_token'];

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const decodedToken = decodeURIComponent(accessToken);

  console.log('\n==========================================');
  console.log('COMPREHENSIVE PHOTOS API DIAGNOSTIC');
  console.log('==========================================\n');

  // Test the Photos API with detailed error info
  const photosUrl = 'https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=1';
  
  console.log('Request URL:', photosUrl);
  console.log('Authorization header:', `Bearer ${decodedToken.substring(0, 20)}...`);
  console.log('\nSending request...\n');

  const photosRes = await fetch(photosUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${decodedToken}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('Response Status:', photosRes.status, photosRes.statusText);
  console.log('Response OK:', photosRes.ok);
  
  const allHeaders: Record<string, string> = {};
  photosRes.headers.forEach((value, key) => {
    allHeaders[key] = value;
  });
  console.log('Response Headers:', JSON.stringify(allHeaders, null, 2));

  const responseText = await photosRes.text();
  console.log('\n=== RESPONSE BODY ===');
  console.log(responseText);
  console.log('=====================\n');

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
    
    if (parsedResponse.error) {
      console.log('ERROR OBJECT:');
      console.log(JSON.stringify(parsedResponse.error, null, 2));
      
      if (parsedResponse.error.details) {
        console.log('\nERROR DETAILS:');
        console.log(JSON.stringify(parsedResponse.error.details, null, 2));
      }
    }
  } catch (e) {
    parsedResponse = { rawText: responseText };
  }

  console.log('==========================================\n');

  return NextResponse.json({
    status: photosRes.status,
    statusText: photosRes.statusText,
    ok: photosRes.ok,
    headers: allHeaders,
    body: parsedResponse,
  }, { status: 200 });
}
