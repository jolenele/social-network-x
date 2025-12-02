"use client"; 
// Marks this component as a Client Component so it can use hooks like useState and useEffect.

import { useEffect, useState } from 'react';
// Imports React hooks: useState for state variables, useEffect for running side effects.

import Link from 'next/link';
// Imports Next.js Link component for client-side navigation.

export default function AuthAwareEditor() {
// Exports a React component that conditionally shows a link to the editor based on authentication.

  const [loading, setLoading] = useState(true);
  // loading = true means authentication status is still being checked.

  const [authenticated, setAuthenticated] = useState(false);
  // authenticated indicates whether the user is logged in.

  useEffect(() => {
  // Runs once when the component mounts to check authentication.

    let mounted = true;
    // Tracks whether the component is still mounted to avoid state updates after unmount.

    async function check() {
    // Defines an async function that performs the authentication check.

      try {
        const res = await fetch('/api/auth/me');
        // Sends a request to the backend to get the user's authentication status.

        const data = await res.json();
        // Parses the JSON response from the server.

        if (!mounted) return;
        // Prevents updating state if the component has unmounted.

        setAuthenticated(!!data.authenticated);
        // Sets authenticated state to true or false based on server response.

      } catch (e) {
        // Catches any network or fetch errors.

        if (!mounted) return;
        // Again ensures no state update if unmounted.

        setAuthenticated(false);
        // If an error occurs, treat user as unauthenticated.

      } finally {
        // This block runs whether or not there was an error.

        if (mounted) setLoading(false);
        // Once done checking, mark loading as false (only if still mounted).
      }
    }

    check();
    // Calls the authentication check function when effect runs.

    return () => {
      mounted = false;
      // Cleanup function: marks component as unmounted when it unmounts.
    };

  }, []);
  // Empty dependency array ensures this effect runs only once on mount.

  if (loading || !authenticated) return null;
  // If still checking OR user is not authenticated, render nothing.

  return (
    <Link
      href="/editor"
      // Navigates to the editor page.

      className="inline-flex items-center mr-20 px-4 py-2 text-xl font-semibold sm:text-lg text-gray-700 hover:text-primary transition-colors duration-200 rounded-md hover:bg-gray-50"
      // Tailwind CSS classes for styling the link.
    >
      Editor
      // Text displayed for the link.
    </Link>
  );
}

