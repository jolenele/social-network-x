import { NextResponse } from 'next/server';

// Exchange authorization code for tokens and set a session cookie (1 day)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      // User denied consent or another error from Google
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const params = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      console.error('Failed to exchange code:', await tokenRes.text());
      return NextResponse.redirect(new URL('/', request.url));
    }

    const tokenJson = await tokenRes.json();
    const idToken = tokenJson.id_token; // JWT

    // Set session cookie containing the id_token (simple approach). Cookie expires in 1 day.
    const maxAge = 60 * 60 * 24; // 1 day in seconds
    const isProd = process.env.NODE_ENV === 'production';
    const cookieValue = encodeURIComponent(idToken ?? '');

    const res = NextResponse.redirect(new URL('/', request.url));
    const setCookie = `session=${cookieValue}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax;${
      isProd ? ' Secure;' : ''
    }`;
    res.headers.append('Set-Cookie', setCookie);
    return res;
  } catch (e) {
    console.error('Callback error', e);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
