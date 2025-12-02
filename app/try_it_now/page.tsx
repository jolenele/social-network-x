// Importing the Link component from Next.js for client-side navigation
import Link from "next/link";

// Exporting the TryitNow component as the default export
export default function TryitNow() {
  // Returning the JSX structure that renders the "Try it Now" page
  return (
    // Main outer container with full-screen height and gradient background
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-primary/5">
      {/* Wrapper for content width, centering, padding, and vertical spacing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        {/* Container for fade-in animation and centered text */}
        <div className="text-center animate-fade-in">

          {/* Header Section */}
          {/* Main page title with large responsive font sizes and bold styling */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Start Your{" "}
            {/* Highlighted text with gradient effect */}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              Style Adventure
            </span>
          </h1>

          {/* Subtitle paragraph explaining the purpose of the feature */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Explore new hairstyles and colors from your Google Photos! It's fun, easy, and completely safe.
          </p>

          {/* Google Sign-In Button Section */}
          <div className="mb-12 animate-slide-up">
            {/* Link component that redirects user to Google OAuth sign-in route */}
            <Link href="/api/auth/google">
              {/* Button styling container with hover animations and shadow effects */}
              <div className="inline-flex items-center justify-center gap-4 bg-white text-gray-900 rounded-xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 cursor-pointer group">
                {/* Google logo image with hover effect */}
                <img
                  src="/images/google_logo.png"
                  alt="Google Logo"
                  className="w-8 h-8 transition-transform group-hover:scale-110"
                />
                {/* Button text label */}
                <span className="text-lg font-semibold">Sign in with Google</span>
              </div>
            </Link>
          </div>

          {/* Features List Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

            {/* Feature #1: "Your Photos" */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
              {/* Icon container with colored background */}
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                {/* SVG icon representing photo access */}
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {/* Title for the feature */}
              <h3 className="font-semibold text-gray-900 mb-1">Your Photos</h3>
              {/* Description */}
              <p className="text-sm text-gray-600">Access your Google Photos securely</p>
            </div>

            {/* Feature #2: "AI Magic" */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
              {/* Icon container */}
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                {/* SVG icon representing AI transformation */}
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-1">AI Magic</h3>
              {/* Description */}
              <p className="text-sm text-gray-600">Transform with advanced AI</p>
            </div>

            {/* Feature #3: "Instant Results" */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
              {/* Icon container */}
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                {/* SVG icon for results visualization */}
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-1">Instant Results</h3>
              {/* Description */}
              <p className="text-sm text-gray-600">See your new look in seconds</p>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center animate-fade-in">
            {/* Encouraging message */}
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              So close to seeing the magic…
            </p>
            {/* Additional CTA message */}
            <p className="text-lg text-gray-600">
              Just a click away
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
