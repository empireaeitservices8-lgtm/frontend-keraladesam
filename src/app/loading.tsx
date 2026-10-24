import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-48 md:h-72 bg-neutral-200 rounded-xl mb-6" />

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 rounded w-full" />
          <div className="h-4 bg-neutral-200 rounded w-5/6" />
          <div className="h-64 bg-neutral-200 rounded-lg mt-4" />
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/2" />
          <div className="h-20 bg-neutral-200 rounded-lg" />
          <div className="h-20 bg-neutral-200 rounded-lg" />
          <div className="h-20 bg-neutral-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
