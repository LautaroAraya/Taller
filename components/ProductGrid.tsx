'use client';

import { Suspense } from 'react';
import ProductSkeleton from '@/components/ProductSkeleton';

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductGridWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      {children}
    </Suspense>
  );
}
