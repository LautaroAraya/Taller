import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export default async function ProductList() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">No hay productos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
