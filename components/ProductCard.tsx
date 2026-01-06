'use client';

import Image from 'next/image';
import { useCart } from '@/lib/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-6xl">📦</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              SIN STOCK
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        )}
        {product.category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
            {product.category}
          </span>
        )}
        <div className="flex justify-between items-center mt-3">
          <span className="text-2xl font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => addItem(product)}
          disabled={!inStock}
          className={`w-full mt-4 py-2 rounded-lg font-semibold transition-colors ${
            inStock
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {inStock ? '🛒 Agregar al Carrito' : 'No Disponible'}
        </button>
      </div>
    </div>
  );
}
