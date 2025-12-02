"use client"; // Marks this component as a Client Component in Next.js

import { useEffect, useRef, useState } from 'react'; // Import React hooks
import Link from 'next/link'; // Import Next.js Link component for navigation
import Image from 'next/image'; // Import optimized Next.js Image component

// Define a User type with optional fields for name, email, and picture
type User = { name?: string | null; email?: string | null; picture?: string | null };

export default function AuthButton() { // Export default AuthButton component
  const [loading, setLoading] = useState(true); // Tracks whether authentication check is still loading
  const [authenticated, setAuthenticated] = useState(false); // Tracks whether the user is authenticated
  const [user, setUser] = useState<User | null>(null); // Stores user info returned from API
  const [menuOpen, setMenuOpen] = useState(false); // Controls whether the dropdown menu is open
  const containerRef = useRef<HTMLDivElement | null>(null); // Ref to detect clicks outside the dropdown

  useEffect(() => { // Runs after component mounts
    let mounted = true; // Flag to avoid state updates after unmount

    async function check() { // Function to fetch authentication status
      try {
        const res = await fetch('/api/auth/me'); // Make request to auth API
        const data = await res.json(); // Parse JSON response
        if (!mounted) return; // If unmounted, do nothing
        setAuthenticated(!!data.authenticated); // Update authentication state
        setUser(data.user ?? null); // Store user info or null
      } catch (e) {
        console.error('Failed to fetch auth status', e); // Log error if fetch fails
        if (!mounted) return; // Avoid state update if unmounted
        setAuthenticated(false); // Mark user as not authenticated
        setUser(null); // Clear user data
      } finally {
        if (mounted) setLoading(false); // Stop loading regardless of success/failure
      }
    }

    function handleDocClick(e: MouseEvent) { // Handler for clicks anywhere on the document
      if (!containerRef.current) return; // If no ref element, skip
      if (!(e.target instanceof Node)) return; // Ensure click target is a DOM node
      if (!containerRef.current.contains(e.target)) { // If clicked outside the dropdown container
        setMenuOpen(false); // Close the menu
      }
    }

    check(); // Run authentication check on mount
    document.addEventListener('click', handleDocClick); // Add listener for outside clicks

    return () => { // Cleanup on component unmount
      mounted = false; // Mark as unmounted
      document.removeEventListener('click', handleDocClick); // Remove event listener
    };
  }, []); // Empty dependency array ensures this runs only once

  if (loading) { // If still checking authentication, show loading UI
    return (
      <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500">
        Loading...
      </span>
    );
  }

  async function handleLogout() { // Function to log the user out
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Call logout endpoint
      window.location.href = '/'; // Redirect to home page
    } catch (e) {
      console.error('Logout failed', e); // Log if logout request fails
    }
  }

  if (authenticated) { // UI shown when the user IS logged in
    return (
      <div ref={containerRef} className="relative inline-flex items-center">
        {user?.picture ? ( // If user has a profile picture, render it
          <Image
            src={user.picture} // Profile image URL
            alt={user.name ?? 'avatar'} // Alt text (fallback to "avatar")
            width={36} // Avatar width
            height={36} // Avatar height
            className="ml-3 rounded-full cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
            onClick={() => setMenuOpen((s) => !s)} // Toggle dropdown on click
            tabIndex={0} // Make image focusable for keyboard accessibility
            onKeyDown={(e) => { // Allow Enter/Space to toggle menu
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent scrolling on spacebar
                setMenuOpen((s) => !s); // Toggle menu open state
              }
            }}
          />
        ) : (
          // Fallback button if no profile picture is available
          <button
            onClick={() => setMenuOpen((s) => !s)} // Toggle dropdown
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200 rounded-md hover:bg-gray-50"
          >
            Account
          </button>
        )}

        {menuOpen ? ( // Conditionally render dropdown menu
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden animate-slide-down">
            <div className="px-4 py-3 border-b border-gray-200"> {/* Dropdown header */}
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? 'User'}</p> {/* Username */}
              {user?.email && ( // Show email if available
                <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout} // Call logout function
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              Sign Out
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  // UI shown when the user is NOT logged in
  return (
    <Link
      href="/api/auth/google" // Clicking signs user in via Google OAuth
      className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
    >
      Sign In
    </Link>
  );
}

