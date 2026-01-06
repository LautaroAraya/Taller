'use client';

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-300" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Category */}
        <div className="h-5 bg-blue-100 rounded w-1/3" />

        {/* Price and Stock */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 bg-green-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>

        {/* Button */}
        <div className="h-10 bg-blue-200 rounded-lg mt-4" />
      </div>
    </div>
  );
}
