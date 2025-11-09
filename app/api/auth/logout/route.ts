import { NextResponse } from 'next/server';

function clearSessionResponse(request: Request) {
  const res = NextResponse.redirect(new URL('/', request.url));
  // Clear the cookie by setting Max-Age=0
  const isProd = process.env.NODE_ENV === 'production';
  const setCookie = `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;${isProd ? ' Secure;' : ''}`;
  res.headers.append('Set-Cookie', setCookie);
  return res;
}

export async function POST(request: Request) {
  return clearSessionResponse(request);
}

export async function GET(request: Request) {
  // Allow GET for convenience from a browser
  return clearSessionResponse(request);
}
