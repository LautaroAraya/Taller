'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!session) return null;

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
            <Link href="/admin/panel" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
              ← Volver
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Cliente</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Teléfono</th>
                <th className="px-4 py-3 text-right font-bold text-gray-900">Total</th>
                <th className="px-4 py-3 text-center font-bold text-gray-900">Estado</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Fecha</th>
                <th className="px-4 py-3 text-center font-bold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-semibold text-gray-900">{order.customerName}</td>
                  <td className="px-4 py-3 text-gray-900">{order.customerPhone}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-800 font-medium text-lg">
              No hay pedidos registrados
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido</h2>
                <p className="text-gray-800 font-medium mt-1">{new Date(selectedOrder.createdAt).toLocaleString('es-AR')}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Cliente</h3>
              <p className="text-gray-900">{selectedOrder.customerName}</p>
              <p className="text-gray-800">{selectedOrder.customerPhone}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Productos</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-800 font-medium">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-green-700">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Estado Actual</h3>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusBadge(selectedOrder.status)}`}>
                {getStatusText(selectedOrder.status)}
              </span>
            </div>

            {selectedOrder.status === 'PENDING' && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'CONFIRMED')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  ✓ Confirmar Venta
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  ✗ Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
