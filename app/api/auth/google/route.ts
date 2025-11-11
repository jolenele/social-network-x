import { NextResponse } from 'next/server';

export async function GET() {
  // Validate required environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('Missing required environment variables:', {
      GOOGLE_CLIENT_ID: !!clientId,
      GOOGLE_REDIRECT_URI: !!redirectUri,
    });
    return NextResponse.json(
      {
        error: 'Server configuration error',
        message: 'Google OAuth is not properly configured. Missing required environment variables.',
        details: {
          GOOGLE_CLIENT_ID: !clientId ? 'missing' : 'present',
          GOOGLE_REDIRECT_URI: !redirectUri ? 'missing' : 'present',
        },
      },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
    access_type: 'offline',
    prompt: 'consent select_account',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(url);
}