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
  orderNumber?: string | null;
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SENT' | 'PAID' | 'CANCELLED'>('ALL');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
      fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error:', error);
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
        const updated = await res.json();
        // Mantener abierto el modal mostrando el pedido actualizado
        setSelectedOrder(updated);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    const confirmDel = window.confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.');
    if (!confirmDel) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedOrder?.id === id) setSelectedOrder(null);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const printOrder = (order: Order) => {
    const shopName = settings?.shopName || 'Taller Mecánico';
    const shopSubtitle = settings?.shopSubtitle || '';
    const logo = settings?.logo || '';
    const shopAddress = settings?.shopAddress || '';
    const shopPhone = settings?.shopPhone || '';
    const dateStr = new Date(order.createdAt).toLocaleString('es-AR');
    const itemsHtml = order.items
      .map(
        (i) => `
          <tr>
            <td style="padding:6px 4px;border-bottom:1px solid #e5e7eb">${i.product.name}</td>
            <td style="padding:6px 4px;text-align:center;border-bottom:1px solid #e5e7eb">${i.quantity}</td>
            <td style="padding:6px 4px;text-align:right;border-bottom:1px solid #e5e7eb">$${(i.price).toFixed(2)}</td>
            <td style="padding:6px 4px;text-align:right;border-bottom:1px solid #e5e7eb">$${(i.price * i.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const html = `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Boleta ${order.orderNumber || ''}</title>
      <style>
        @media print { .no-print { display:none } body { -webkit-print-color-adjust: exact; } }
        body { font-family: ui-sans-serif, system-ui, Arial, Helvetica, sans-serif; color:#111827; }
      </style>
    </head>
    <body>
      <div style="max-width:780px;margin:0 auto;padding:24px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:12px">
            ${logo ? `<img src="${logo}" alt="logo" style="height:60px;width:60px;object-fit:contain;border:1px solid #e5e7eb;border-radius:8px;padding:4px" />` : ''}
            <div>
              <div style="font-size:20px;font-weight:700">${shopName}</div>
              ${shopSubtitle ? `<div style="font-size:12px;color:#6b7280">${shopSubtitle}</div>` : ''}
              ${shopAddress || shopPhone ? `<div style="font-size:12px;color:#6b7280">${[shopAddress, shopPhone].filter(Boolean).join(' · ')}</div>` : ''}
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;color:#6b7280">Fecha</div>
            <div style="font-weight:600">${dateStr}</div>
          </div>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 16px 0">
          <div>
            <div style="font-size:12px;color:#6b7280">Cliente</div>
            <div style="font-weight:600">${order.customerName}</div>
            <div style="font-size:12px;color:#374151">${order.customerPhone}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;color:#6b7280">N° de Orden</div>
            <div style="font-weight:700">${order.orderNumber || '—'}</div>
            <div style="font-size:12px;color:#16a34a;font-weight:700">Pagado</div>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f3f4f6">
              <th style="text-align:left;padding:8px 4px">Producto</th>
              <th style="text-align:center;padding:8px 4px">Cant.</th>
              <th style="text-align:right;padding:8px 4px">Precio</th>
              <th style="text-align:right;padding:8px 4px">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <div style="min-width:240px">
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:700">
              <span>Total</span>
              <span style="color:#16a34a">$${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style="text-align:center;margin-top:16px;color:#6b7280;font-size:12px">Gracias por su compra</div>
      </div>
      <script>window.print();</script>
    </body>
    </html>`;

    const win = window.open('', '_blank', 'width=820,height=900');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!session) return null;

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendiente',
      SENT: 'Enviado por WhatsApp',
      PAID: 'Pagado',
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
        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              { key: 'ALL', label: 'Todos' },
              { key: 'PENDING', label: 'Pendientes' },
              { key: 'SENT', label: 'Enviados WhatsApp' },
              { key: 'PAID', label: 'Pagados' },
              { key: 'CANCELLED', label: 'Cancelados' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                statusFilter === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-900">N° Orden</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Cliente</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Teléfono</th>
                <th className="px-4 py-3 text-right font-bold text-gray-900">Total</th>
                <th className="px-4 py-3 text-center font-bold text-gray-900">Estado</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Fecha</th>
                <th className="px-4 py-3 text-center font-bold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(statusFilter === 'ALL'
                ? orders
                : orders.filter((o) => o.status === statusFilter)
              ).map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{order?.orderNumber ?? '—'}</td>
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
                    <div className="flex items-center justify-center gap-3">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'SENT')}
                          className="text-blue-600 hover:underline"
                          title="Marcar como enviado por WhatsApp"
                        >
                          Enviar WSP ✓
                        </button>
                      )}
                      {order.status === 'PAID' && (
                        <button
                          onClick={() => printOrder(order)}
                          className="text-gray-900 hover:underline"
                          title="Imprimir boleta"
                        >
                          🖨️ Boleta
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:underline"
                      >
                        Ver Detalles
                      </button>
                      {(session?.user as any)?.role === 'ADMIN' && (
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:underline"
                          title="Eliminar pedido"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
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
                <p className="text-gray-700 font-mono text-sm">N° Orden: {selectedOrder.orderNumber ?? '—'}</p>
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

            <div className="flex gap-2">
              {selectedOrder.status !== 'PAID' ? (
                <>
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'SENT')}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      ↗ Marcar Enviado por WhatsApp
                    </button>
                  )}
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'PAID')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✓ Pagado
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    ✗ Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => printOrder(selectedOrder)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  🖨️ Imprimir Boleta
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
