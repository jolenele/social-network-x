import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-yellow-200 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-wide text-indigo-600">
          Network-X
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/gallery" className="text-xl text-amber-700 hover:text-indigo-600">
            Gallery
          </Link>
          <Link href="/editor" className="text-xl text-amber-700 hover:text-indigo-600">
            Try it
          </Link>
          <Link href="/about" className="text-xl text-amber-700 hover:text-indigo-600">
            About
          </Link>

          <a
            href="/api/auth/google"
            className="ml-4 inline-flex items-center px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Sign in
          </a>
        </nav>
      </div>
    </header>
  );
}