export default function GalleryPage() {
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