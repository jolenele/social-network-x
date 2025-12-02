"use client"; // Marks this file as a Client Component in Next.js, allowing hooks and browser-specific behavior

// Import React and hooks for state and lifecycle management
import React, { useEffect, useState } from "react";
// Import the ImageComp component for before/after image comparison
import ImageComp from "@/app/components/ImageComp";
// Import Link component from Next.js for client-side navigation
import Link from "next/link";
// Import Google Analytics helpers for tracking page views and button clicks
import { initGA, sendPageView, trackTryItNowClick } from "@/analytics";

// Flag to ensure Google Analytics is initialized only once
let gaInitialized = false;

// Main Home component
export default function Home() {
  // State to track if user is logged in, initially null (unknown)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Effect to initialize Google Analytics and send page view
  useEffect(() => {
    // Only initialize GA if not already initialized and running in the browser
    if (!gaInitialized && typeof window !== "undefined") {
      initGA(); // Initialize GA
      gaInitialized = true; // Set flag to true
    }
    sendPageView("/"); // Track a page view for the root page
  }, []); // Run once on component mount

  // Effect to fetch authentication status of the user
  useEffect(() => {
    let mounted = true; // Flag to avoid setting state after component unmount

    // Fetch authentication info from API
    fetch("/api/auth/me")
      .then((res) => res.json()) // Parse JSON response
      .then((data) => {
        if (!mounted) return; // Exit if component unmounted
        setIsLoggedIn(Boolean(data?.authenticated)); // Set login state
      })
      .catch(() => {
        if (!mounted) return; // Exit if component unmounted
        setIsLoggedIn(false); // Assume not logged in on error
      });

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, []); // Run once on component mount

  // Determine link destination based on login status
  const href = isLoggedIn ? "/editor" : "/try_it_now";

  // JSX returned by component
  return (
    <div className="min-h-screen bg-white"> {/* Full page container with white background */}

      {/* Hero / Banner Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-gray-50 via-white to-primary/5">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-12 sm:pb-16">
          <div className="text-center animate-fade-in"> {/* Centered text with fade-in animation */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Discover the{" "}
              <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                New You
              </span>
            </h1>
            {/* CTA Button */}
            <Link href={href}>
              <button
                className="inline-flex items-center px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => {
                  // Track metric when Try It Now button is clicked
                  trackTryItNowClick();
                }}
              >
                Try it Now
                {/* Arrow icon for button */}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Before/After Comparison Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Before text */}
            <div className="text-center lg:text-right animate-slide-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Before</h2>
              <p className="text-gray-600">Your original look</p>
            </div>
            {/* Image comparison component */}
            <div className="shrink-0">
              <ImageComp
                firstSrc="/images/before-homepage.png" // Image before transformation
                secondSrc="/images/after-homepage.png" // Image after transformation
                width={500} // Width of comparison
              />
            </div>
            {/* After text */}
            <div className="text-center lg:text-left animate-slide-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">After</h2>
              <p className="text-gray-600">AI-powered transformation</p>
            </div>
          </div>
          {/* Subtext below comparison */}
          <div className="mt-4 text-center">
            <p className="text-2xl font-semibold text-gray-800">
              No more wondering,{" "}
              <span className="text-primary">"Would I pull that off?"</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose NewMe?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of style experimentation with AI-powered technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced AI technology transforms your photos with realistic style changes
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your photos are processed securely with Google authentication
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Simple, intuitive interface that makes style experimentation effortless
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-16 sm:py-20 bg-linear-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Look?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users discovering their new style with AI
          </p>
          {/* CTA Button */}
          <Link href={href}>
            <button
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary bg-white hover:bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                // Track CTA button click
                trackTryItNowClick();
              }}
            >
              Get Started Free
              {/* Arrow icon for button */}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
