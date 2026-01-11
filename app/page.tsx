import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SearchBar from '@/components/SearchBar';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Obtener configuración del taller
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        shopName: 'Taller Mecánico',
        shopSubtitle: 'Repuestos y Mercadería',
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {settings.logo && (
                <Image
                  src={settings.logo}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="object-contain bg-white rounded-lg p-1"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{settings.logo ? settings.shopName : `🔧 ${settings.shopName}`}</h1>
                <p className="text-blue-100 mt-1">{settings.shopSubtitle}</p>
              </div>
            </div>
            {session && (
              <Link
                href="/admin"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Panel Admin
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Catálogo de Productos</h2>
          <p className="text-gray-600">Consultá disponibilidad y precios. Pedí por WhatsApp.</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No hay productos disponibles en este momento.</p>
          </div>
        ) : (
          <SearchBar products={products} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-6">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-700/70 mt-6 mb-4"></div>
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">&copy; 2026 Taller Mecánico. Todos los derechos reservados.</p>
            <p className="text-xs">Diseñado y desarrollado por <span className="text-white font-semibold">Rey Sofia - Araya Lautaro</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
