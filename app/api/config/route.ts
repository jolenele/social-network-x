import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? null;
    const apiKey = process.env.GOOGLE_API_KEY ?? null;
    return NextResponse.json({ clientId, apiKey });
  } catch (e) {
    console.error('config route error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}