import { NextResponse } from 'next/server';

// This endpoint tests the Photos Library API configuration
export async function GET() {
  const checks = {
    envVars: {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
    },
    apiKeyTest: null as any,
  };

  // Test if we can access the Photos Library API with the API key
  if (process.env.GOOGLE_API_KEY) {
    try {
      // Try to access the Photos Library API discovery document
      const discoveryUrl = `https://photoslibrary.googleapis.com/$discovery/rest?version=v1&key=${process.env.GOOGLE_API_KEY}`;
      const response = await fetch(discoveryUrl);
      
      checks.apiKeyTest = {
        status: response.status,
        ok: response.ok,
        message: response.ok 
          ? '✅ Photos Library API is accessible'
          : `❌ API returned ${response.status}`,
      };

      if (!response.ok) {
        const errorText = await response.text();
        checks.apiKeyTest.error = errorText;
      }
    } catch (e) {
      checks.apiKeyTest = {
        error: String(e),
        message: '❌ Failed to contact Photos Library API',
      };
    }
  }

  return NextResponse.json(checks);
}
