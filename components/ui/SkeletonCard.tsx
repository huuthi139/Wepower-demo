export function SkeletonCard() {
  return (
    <div className="bg-black rounded-xl overflow-hidden border border-white/10 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5">
        {/* Category */}
        <div className="h-3 w-16 bg-gray-800 rounded mb-3" />

        {/* Title */}
        <div className="h-5 w-full bg-gray-800 rounded mb-2" />
        <div className="h-5 w-3/4 bg-gray-800 rounded mb-3" />

        {/* Instructor */}
        <div className="h-4 w-32 bg-gray-800 rounded mb-4" />

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-3 w-20 bg-gray-800 rounded" />
          <div className="h-3 w-16 bg-gray-800 rounded" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-3 w-14 bg-gray-800 rounded" />
          <div className="h-3 w-20 bg-gray-800 rounded" />
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-white/10">
          <div className="h-6 w-28 bg-gray-800 rounded" />
        </div>

        {/* Button */}
        <div className="mt-4 h-10 w-full bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
