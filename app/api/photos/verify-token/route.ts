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

  console.log('\n===========================================');
  console.log('TOKEN SCOPE VERIFICATION');
  console.log('===========================================\n');

  // Check token with both endpoints
  const v1Url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(decodedToken)}`;
  const v3Url = `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(decodedToken)}`;

  console.log('Checking token with v1 endpoint...');
  const v1Res = await fetch(v1Url);
  const v1Data = await v1Res.json();
  console.log('V1 Result:', JSON.stringify(v1Data, null, 2));

  console.log('\nChecking token with v3 endpoint...');
  const v3Res = await fetch(v3Url);
  const v3Data = await v3Res.json();
  console.log('V3 Result:', JSON.stringify(v3Data, null, 2));

  console.log('\n=== SCOPE ANALYSIS ===');
  const v1Scopes = v1Data.scope?.split(' ') || [];
  const v3Scopes = v3Data.scope?.split(' ') || [];
  
  console.log('V1 Scopes:', v1Scopes);
  console.log('V3 Scopes:', v3Scopes);
  
  const hasPhotosV1 = v1Scopes.some((s: string) => s.includes('photoslibrary'));
  const hasPhotosV3 = v3Scopes.some((s: string) => s.includes('photoslibrary'));
  
  console.log('V1 has photoslibrary:', hasPhotosV1);
  console.log('V3 has photoslibrary:', hasPhotosV3);
  
  console.log('\n=== EXACT SCOPE NEEDED ===');
  console.log('Required:', 'https://www.googleapis.com/auth/photoslibrary.readonly');
  console.log('V1 has exact match:', v1Scopes.includes('https://www.googleapis.com/auth/photoslibrary.readonly'));
  console.log('V3 has exact match:', v3Scopes.includes('https://www.googleapis.com/auth/photoslibrary.readonly'));

  console.log('===========================================\n');

  return NextResponse.json({
    v1: v1Data,
    v3: v3Data,
    analysis: {
      v1Scopes,
      v3Scopes,
      hasPhotosV1,
      hasPhotosV3,
      requiredScope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
      v1HasExact: v1Scopes.includes('https://www.googleapis.com/auth/photoslibrary.readonly'),
      v3HasExact: v3Scopes.includes('https://www.googleapis.com/auth/photoslibrary.readonly'),
    }
  });
}
