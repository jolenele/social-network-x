"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AuthAwareEditor() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!mounted) return;
        setAuthenticated(!!data.authenticated);
      } catch (e) {
        if (!mounted) return;
        setAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !authenticated) return null;

  return (
    <Link
      href="/editor"
      className="inline-flex items-center px-3 py-2 text-black text-2xl font-medium hover:underline font-['Comfortaa',sans-serif]"
    >
      Editor
    </Link>
  );
}
