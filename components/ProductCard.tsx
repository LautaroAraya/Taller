'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = () => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const sendToWhatsApp = () => {
    const message = cart.map(item =>
      `• ${item.product.name} x${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const fullMessage = `*Consulta de Productos*\n\n${message}\n\n*Total: $${total.toFixed(2)}*`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const inStock = product.stock > 0;

  return (
    <>
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
            onClick={addToCart}
            disabled={!inStock}
            className={`w-full mt-4 py-2 rounded-lg font-semibold transition-colors ${
              inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {inStock ? 'Agregar al Carrito' : 'No Disponible'}
          </button>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && cart.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Carrito de Compras</h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                  </div>
                  <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  ${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCart(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={sendToWhatsApp}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                💬 Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
