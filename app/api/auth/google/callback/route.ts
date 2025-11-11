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

    // Validate required environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing required environment variables in callback:', {
        GOOGLE_CLIENT_ID: !!clientId,
        GOOGLE_CLIENT_SECRET: !!clientSecret,
        GOOGLE_REDIRECT_URI: !!redirectUri,
      });
      return NextResponse.redirect(
        new URL('/?error=server_config', request.url)
      );
    }

    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error('Failed to exchange code for token:', {
        status: tokenRes.status,
        statusText: tokenRes.statusText,
        error: errorText,
      });
      // Redirect with error parameter for debugging
      return NextResponse.redirect(
        new URL(`/?error=token_exchange_failed&status=${tokenRes.status}`, request.url)
      );
    }

    const tokenJson = await tokenRes.json();
    console.log('\n=== TOKEN EXCHANGE RESPONSE ===');
    console.log('Has access_token:', !!tokenJson.access_token);
    console.log('Has refresh_token:', !!tokenJson.refresh_token);
    console.log('Has id_token:', !!tokenJson.id_token);
    console.log('Scope from response:', tokenJson.scope);
    console.log('================================\n');
    
    const idToken = tokenJson.id_token; // JWT
    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;

    // Set session cookies. Cookies expire in 1 day.
    const maxAge = 60 * 60 * 24; // 1 day in seconds
    const isProd = process.env.NODE_ENV === 'production';
    const secureSuffix = isProd ? ' Secure;' : '';

    const res = NextResponse.redirect(new URL('/', request.url));
    
    // Store id_token for user info
    res.headers.append(
      'Set-Cookie',
      `session=${encodeURIComponent(idToken ?? '')}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax;${secureSuffix}`
    );
    
    // Store access_token for API calls
    res.headers.append(
      'Set-Cookie',
      `access_token=${encodeURIComponent(accessToken ?? '')}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax;${secureSuffix}`
    );
    
    // Store refresh_token if provided
    if (refreshToken) {
      res.headers.append(
        'Set-Cookie',
        `refresh_token=${encodeURIComponent(refreshToken)}; HttpOnly; Path=/; Max-Age=${maxAge * 30}; SameSite=Lax;${secureSuffix}`
      );
    }
    
    return res;
  } catch (e) {
    console.error('Callback error', e);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
