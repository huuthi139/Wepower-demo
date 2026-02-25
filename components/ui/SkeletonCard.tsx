export function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] rounded-xl overflow-hidden border border-white/[0.06] animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="aspect-video bg-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="p-5">
        {/* Category */}
        <div className="h-3 w-16 bg-white/[0.06] rounded mb-3" />

        {/* Title */}
        <div className="h-5 w-full bg-white/[0.06] rounded mb-2" />
        <div className="h-5 w-3/4 bg-white/[0.06] rounded mb-3" />

        {/* Instructor */}
        <div className="h-4 w-32 bg-white/[0.06] rounded mb-4" />

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-3 w-20 bg-white/[0.06] rounded" />
          <div className="h-3 w-16 bg-white/[0.06] rounded" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-3 w-14 bg-white/[0.06] rounded" />
          <div className="h-3 w-20 bg-white/[0.06] rounded" />
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-white/10">
          <div className="h-6 w-28 bg-white/[0.06] rounded" />
        </div>

        {/* Button */}
        <div className="mt-4 h-10 w-full bg-white/[0.06] rounded-lg" />
      </div>
    </div>
  );
}
