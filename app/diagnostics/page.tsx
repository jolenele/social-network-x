"use client";
import { useState, useEffect } from "react";

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiagnostics();
  }, []);

  async function loadDiagnostics() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/diagnostics');
      const data = await res.json();
      setDiagnostics(data);
    } catch (err) {
      setDiagnostics({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Google Photos Integration Diagnostics
        </h1>

        {loading && <p className="text-gray-600">Loading diagnostics...</p>}

        {!loading && diagnostics && (
          <div className="space-y-6">
            {/* Environment Variables */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black">
                Environment Variables
              </h2>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                {Object.entries(diagnostics.envConfigured || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className={`mr-2 ${value ? 'text-green-600' : 'text-red-600'}`}>
                      {value ? '✅' : '❌'}
                    </span>
                    <span className="text-black">{key}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black">
                Authentication Cookies
              </h2>
              <div className="bg-gray-50 p-4 rounded space-y-2">
                {Object.entries(diagnostics.cookiesPresent || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className={`mr-2 ${value ? 'text-green-600' : 'text-red-600'}`}>
                      {value ? '✅' : '❌'}
                    </span>
                    <span className="text-black">{key}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Access Token Status */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black">
                Access Token Status
              </h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-black mb-2">
                  <strong>Valid:</strong>{' '}
                  <span className={diagnostics.accessTokenValid ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.accessTokenValid ? '✅ Yes' : '❌ No'}
                  </span>
                </p>
                <p className="text-black mb-2">
                  <strong>Has Photos Scope:</strong>{' '}
                  <span className={diagnostics.hasPhotosScope ? 'text-green-600' : 'text-red-600'}>
                    {diagnostics.hasPhotosScope ? '✅ Yes' : '❌ No'}
                  </span>
                </p>
              </div>
            </section>

            {/* Granted Scopes */}
            {diagnostics.scopes && diagnostics.scopes.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-black">
                  Granted Scopes
                </h2>
                <div className="bg-gray-50 p-4 rounded">
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.scopes.map((scope: string, idx: number) => (
                      <li key={idx} className="text-black">
                        <code className="text-sm">{scope}</code>
                        {scope.includes('photoslibrary') && (
                          <span className="ml-2 text-green-600">✅ Photos scope!</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Token Info */}
            {diagnostics.tokenInfo && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 text-black">
                  Token Details
                </h2>
                <div className="bg-gray-50 p-4 rounded overflow-auto">
                  <pre className="text-xs text-black">
                    {JSON.stringify(diagnostics.tokenInfo, null, 2)}
                  </pre>
                </div>
              </section>
            )}

            {/* Recommendations */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black">
                Recommendations
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <ul className="list-disc list-inside space-y-2 text-black">
                  {!diagnostics.cookiesPresent?.access_token && (
                    <li className="text-red-600">
                      <strong>No access token found.</strong> Please log in with Google.
                    </li>
                  )}
                  {!diagnostics.accessTokenValid && diagnostics.cookiesPresent?.access_token && (
                    <li className="text-red-600">
                      <strong>Access token is invalid or expired.</strong> Please log out and log in again.
                    </li>
                  )}
                  {!diagnostics.hasPhotosScope && diagnostics.accessTokenValid && (
                    <li className="text-red-600">
                      <strong>Missing Google Photos scope!</strong> You need to:
                      <ol className="ml-6 mt-2 space-y-1">
                        <li>1. Log out of the application</li>
                        <li>2. Clear browser cookies</li>
                        <li>3. Log in again</li>
                        <li>4. Make sure you accept the "View your Google Photos library" permission</li>
                      </ol>
                    </li>
                  )}
                  {!Object.values(diagnostics.envConfigured || {}).every(Boolean) && (
                    <li className="text-red-600">
                      <strong>Missing environment variables!</strong> Check your .env.local file.
                    </li>
                  )}
                  {diagnostics.hasPhotosScope && diagnostics.accessTokenValid && (
                    <li className="text-green-600">
                      <strong>Everything looks good!</strong> If you're still getting 403 errors:
                      <ol className="ml-6 mt-2 space-y-1">
                        <li>1. Make sure Photos Library API is enabled in Google Cloud Console</li>
                        <li>2. Add yourself as a test user in OAuth consent screen</li>
                        <li>3. Wait a few minutes for Google's changes to propagate</li>
                      </ol>
                    </li>
                  )}
                </ul>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={loadDiagnostics}
                className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Diagnostics
              </button>
              <a
                href="/TROUBLESHOOTING_403.md"
                target="_blank"
                className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 inline-block"
              >
                View Troubleshooting Guide
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
