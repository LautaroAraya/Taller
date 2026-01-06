'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';

interface SettingsResponse {
  shopPhone?: string | null;
}

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [shopPhone, setShopPhone] = useState<string>('');
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const validate = () => {
    const next: { name?: string; phone?: string } = {};
    if (!customerName.trim()) next.name = 'Ingresá el nombre del cliente';
    if (!customerPhone.trim()) {
      next.phone = 'Ingresá el teléfono';
    } else if (!isValidPhone(customerPhone)) {
      next.phone = 'Teléfono inválido (mín. 7 dígitos)';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Cargar teléfono del taller desde Settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data: SettingsResponse = await res.json();
          const digits = String(data.shopPhone || '').replace(/\D/g, '');
          setShopPhone(digits);
        }
      } catch (e) {
        console.error('Error cargando configuración', e);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const sendToWhatsApp = async () => {
    if (items.length === 0) return;
    if (!validate()) return;
    // Validar teléfono del taller
    if (!shopPhone || !isValidPhone(shopPhone)) {
      alert('Teléfono del taller no configurado o inválido. Configuralo en Ajustes.');
      return;
    }

    setCreatingOrder(true);
    // Crear pedido en backend
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Cliente',
          customerPhone: customerPhone || '—',
          total: getTotal(),
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        }),
      });
      const orderData = await orderRes.json();

      // Marcar como enviado por WhatsApp
      if (orderData?.id) {
        await fetch(`/api/orders/${orderData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SENT' }),
        });
      }

      const message = items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
      )
      .join('\n');

      const total = getTotal();
      const fullMessage = `*Pedido ${orderData?.orderNumber ?? ''}*\n*Cliente:* ${customerName || 'Cliente'}\n*Teléfono:* ${customerPhone || '—'}\n\n${message}\n\n*Total: $${total.toFixed(2)}*`;

      const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodeURIComponent(fullMessage)}`;
      window.open(whatsappUrl, '_blank');
      setIsOpen(false);
      clearCart();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <>
      {/* Floating Cart Button */}
      {items.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-40 flex-col text-xs font-bold"
        >
          <span className="text-xl">🛒</span>
          <span>{items.length}</span>
        </button>
      )}

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Carrito de Compras</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">El carrito está vacío</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 border rounded-lg p-3 bg-gray-50"
                    >
                      {item.image && (
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {item.name}
                        </h4>
                        <p className="text-green-600 font-bold text-sm">
                          ${item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            −
                          </button>
                          <span className="font-bold text-lg w-8 text-center text-gray-900 bg-white rounded px-1 border border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-red-600 hover:text-red-700 text-sm font-bold"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  {/* Datos del cliente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nombre del cliente"
                        className={`border rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {errors.name && (
                        <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Teléfono del cliente"
                        className={`border rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 w-full ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        inputMode="tel"
                        required
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mb-4">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-green-600">
                      ${getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      clearCart();
                    }}
                    className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Limpiar Carrito
                  </button>
                  <button
                    onClick={sendToWhatsApp}
                    disabled={
                      creatingOrder ||
                      !customerName.trim() ||
                      !isValidPhone(customerPhone) ||
                      loadingSettings ||
                      !shopPhone ||
                      !isValidPhone(shopPhone)
                    }
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-70"
                  >
                    {creatingOrder ? 'Creando pedido...' : '💬 WhatsApp'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
