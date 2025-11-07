"use client";

import { useState } from "react";
import "@fontsource/lexend";

export default function GalleryPage() {

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  // Example placeholders for Original and Styled photos
  const originalPhotos = Array.from({ length: 72 }, (_, i) => `Original ${i + 1}`);
  const styledPhotos = Array.from({ length: 72 }, (_, i) => `Styled ${i + 1}`);

  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 24;
  const totalPages = Math.ceil(originalPhotos.length / photosPerPage);

  // Calculate which photos to display for current page
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Gallery</h1>
      <p className="text-sm text-muted-foreground mb-6">Photos from your connected accounts will appear here.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* placeholder cards; replace with fetched thumbnails */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
            Photo {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}