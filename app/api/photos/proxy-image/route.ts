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
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    console.log('Proxying image:', imageUrl);

    // Fetch the image with authorization header
    const imageRes = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decodedToken}`,
      },
    });

    if (!imageRes.ok) {
      console.error('Image fetch error:', imageRes.status, imageRes.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: imageRes.status }
      );
    }

    // Get the image as a buffer
    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (e) {
    console.error('Proxy image error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
