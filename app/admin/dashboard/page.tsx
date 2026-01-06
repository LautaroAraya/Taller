'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string | null;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.user?.role === 'ADMIN';
  const lowStockProducts = products.filter(p => p.stock < 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-blue-100 text-sm">
                Bienvenido, {session.user?.name} ({session.user?.role})
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Ver Tienda
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-800 text-sm font-bold">Total Productos</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{products.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-800 text-sm font-bold">Pedidos Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingOrders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-800 text-sm font-bold">Stock Bajo</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-800 text-sm font-bold">Sin Stock</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{outOfStockProducts.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/products"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">📦 Gestionar Productos</h3>
            <p className="text-gray-800">Agregar, editar o eliminar productos del catálogo</p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">📋 Ver Pedidos</h3>
            <p className="text-gray-800">Confirmar ventas y gestionar pedidos</p>
          </Link>
          {isAdmin && (
            <Link
              href="/admin/users"
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">👥 Gestionar Usuarios</h3>
              <p className="text-gray-800">Administrar usuarios del sistema</p>
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/settings"
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">⚙️ Configuración</h3>
              <p className="text-gray-800">Personalizar nombre y logo del taller</p>
            </Link>
          )}
        </div>

        {/* Alerts */}
        {outOfStockProducts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <h3 className="font-bold text-red-800 mb-2">⚠️ Productos Sin Stock</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {outOfStockProducts.map(p => (
                <li key={p.id}>• {p.name}</li>
              ))}
            </ul>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <h3 className="font-bold text-yellow-800 mb-2">⚡ Stock Bajo (menos de 5 unidades)</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              {lowStockProducts.map(p => (
                <li key={p.id}>• {p.name} - {p.stock} unidades</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
