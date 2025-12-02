// Importing the Link component from Next.js to enable client-side navigation
import Link from "next/link";

// Importing the optimized Image component from Next.js for better image performance
import Image from "next/image";

// Importing a custom authentication button component
import AuthButton from "./AuthButton";

// Importing a component that shows the Gallery link only when the user is authenticated
import AuthAwareGallery from "./AuthAwareGallery";

// Importing a component that shows the Editor link only when the user is authenticated
import AuthAwareEditor from "./AuthAwareEditor";

// Importing the Comfortaa font for UI typography styling
import "@fontsource/comfortaa";

// Exporting the Navbar component as the default export of this module
export default function Navbar() {
  // Returning the JSX structure of the navigation bar
  return (
    // Header element that remains fixed at the top due to `sticky top-0`
    // `z-50` ensures it stays above other content, and styling adds blur, borders, and shadow
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      {/* Main navigation bar container */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex container to align items horizontally and space them apart */}
        <div className="flex h-12 items-center justify-between">
          
          {/* Left side of the navbar: Logo and site name */}
          <div className="flex items-center">
            {/* Link to the homepage with added accessibility and hover effects */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 no-underline group transition-opacity hover:opacity-80" 
              aria-label="Home"
            >
              {/* Wrapper for the logo image */}
              <div className="relative">
                {/* Logo image using Next.js Image optimization */}
                <Image
                  src="/images/logo.png"        // Path to the logo image file
                  alt="NewMe logo"              // Accessible description of the image
                  width={40}                    // Image display width
                  height={40}                   // Image display height
                  className="w-10 h-10 object-contain transition-transform group-hover:scale-105" // Styling including hover scale
                />
              </div>

              {/* Text showing the application name with gradient styling */}
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-geist">
                NewMe
              </span>
            </Link>
          </div>

          {/* Middle section of navbar: Only appears on medium screens and larger */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Conditionally rendered Gallery navigation button depending on auth status */}
            <AuthAwareGallery />

            {/* Conditionally rendered Editor navigation button depending on auth status */}
            <AuthAwareEditor />
          </div>

          {/* Right side of navbar: Authentication button */}
          <div className="flex items-center">
            {/* Component that shows login/logout depending on user authentication */}
            <AuthButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
