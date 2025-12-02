"use client"; // Tells Next.js that this file must be rendered on the client side

import { useEffect, useState } from 'react'; // Import React hooks for state and side effects
import Link from 'next/link'; // Import Next.js Link component for client-side navigation

export default function AuthAwareGallery() { // Export the component that conditionally shows the Gallery link
  const [loading, setLoading] = useState(true); // Track whether authentication check is still loading
  const [authenticated, setAuthenticated] = useState(false); // Track whether the user is authenticated

  useEffect(() => { // Run an effect on component mount
    let mounted = true; // Flag to avoid updating state if component unmounts

    async function check() { // Define async function to check user authentication
      try {
        const res = await fetch('/api/auth/me'); // Request authentication status from backend
        const data = await res.json(); // Parse the JSON response
        if (!mounted) return; // If component unmounted, stop here
        setAuthenticated(!!data.authenticated); // Set authenticated state based on response
      } catch (e) {
        if (!mounted) return; // Avoid state updates after unmount in error case
        setAuthenticated(false); // If error, assume user is not authenticated
      } finally {
        if (mounted) setLoading(false); // Once done, set loading to false if still mounted
      }
    }

    check(); // Execute the authentication check when component mounts

    return () => {
      mounted = false; // Cleanup: mark as unmounted to prevent state updates
    };
  }, []); // Empty dependency array → effect runs only on mount/unmount

  if (loading || !authenticated) return null; // If still loading or not authenticated, render nothing

  return (
    <Link
      href="/gallery" // Route to navigate to when clicked
      className="inline-flex items-center mr-10 px-4 py-2 text-xl font-semibold sm:text-lg text-gray-700 hover:text-primary transition-colors duration-200 rounded-md hover:bg-gray-50" // Styling classes for the link
    >
      Gallery {/* Text displayed for the navigation link */}
    </Link>
  );
}

