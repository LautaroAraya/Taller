'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
}

interface SearchBarProps {
  products: Product[];
}

export default function SearchBar({ products }: SearchBarProps) {
  const [searchName, setSearchName] = useState('');

  // Filtrar productos basado en búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesName = product.name.toLowerCase().includes(searchName.toLowerCase());
      return matchesName;
    });
  }, [products, searchName]);

  const handleClear = () => {
    setSearchName('');
  };

  return (
    <div>
      {/* Search Bar Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Filtrar Productos</h3>
        
        <div className="flex gap-4 items-end">
          {/* Search by Name */}
          <div className="flex-1">
            <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nombre
            </label>
            <input
              id="search-name"
              type="text"
              placeholder="Ej: filtro, aceite..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 bg-white font-medium"
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium whitespace-nowrap"
          >
            Limpiar
          </button>
        </div>

        {/* Results counter */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando <span className="font-semibold text-gray-800">{filteredProducts.length}</span> de <span className="font-semibold text-gray-800">{products.length}</span> productos
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg mb-2">No se encontraron productos.</p>
          <p className="text-gray-400 text-sm">Intenta con otros criterios de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
