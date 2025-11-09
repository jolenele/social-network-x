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
    const session = cookies['session'];

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    const idToken = decodeURIComponent(session || '');

    // Verify token with Google tokeninfo endpoint
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      idToken,
    )}`;

    const verifyRes = await fetch(tokenInfoUrl);
    if (!verifyRes.ok) {
      return NextResponse.json({ authenticated: false });
    }

    const info = await verifyRes.json();
    // info contains fields like email, name, picture, exp, aud
    return NextResponse.json({
      authenticated: true,
      user: {
        name: info.name ?? null,
        email: info.email ?? null,
        picture: info.picture ?? null,
      },
    });
  } catch (e) {
    console.error('Auth/me error', e);
    return NextResponse.json({ authenticated: false });
  }
}
