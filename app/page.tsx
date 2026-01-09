import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 mb-8 bg-gradient-to-r from-gray-900/60 via-gray-900/40 to-gray-800/40 border border-gray-700/60 rounded-xl p-4 shadow-inner">
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-wide mb-1">Contáctanos</h3>
              <p className="text-sm text-gray-400 mb-3">Escríbenos y respondemos rápido.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                <a 
                  href="https://www.instagram.com/digital.servicios1?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/40 border border-gray-700 text-pink-500 hover:text-pink-400 hover:border-pink-500 hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                  </svg>
                  Digital&Servicios
                </a>
                <a
                  href="https://wa.me/3498401394"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/40 border border-gray-700 text-green-500 hover:text-green-400 hover:border-green-500 hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 3C9.383 3 4 8.383 4 15c0 2.254.625 4.412 1.813 6.297L4 29l8.047-1.75C13.852 27.75 14.93 28 16 28c6.617 0 12-5.383 12-12S22.617 3 16 3zm0 2c5.532 0 10 4.468 10 10s-4.468 10-10 10c-.953 0-1.91-.152-2.844-.453l-.398-.129-.41.088-4.32.94.932-4.34.09-.418-.223-.363C7.582 19.07 7 17.062 7 15c0-5.532 4.468-10 10-10zm-3.012 5.004c-.23-.006-.504.02-.777.366-.273.347-1.02 1.063-1.02 2.594 0 1.531 1.043 3.011 1.188 3.219.145.207 2.027 3.242 5.004 4.42 2.477.974 2.977.781 3.516.73.539-.051 1.73-.707 1.977-1.391.246-.684.246-1.27.176-1.395-.07-.125-.27-.199-.559-.348-.289-.148-1.715-.848-1.98-.945-.266-.098-.461-.148-.656.148-.195.293-.754.945-.926 1.137-.172.195-.34.219-.629.07-.289-.145-1.219-.449-2.322-1.387-.859-.762-1.438-1.707-1.609-1.996-.172-.293-.02-.453.129-.602.133-.133.289-.348.434-.52.145-.172.191-.293.289-.488.098-.195.051-.367-.027-.516-.078-.145-.695-1.676-.953-2.297-.246-.594-.496-.609-.727-.617z" />
                  </svg>
                  Sofia
                </a>
                <a
                  href="https://wa.me/3498619624"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/40 border border-gray-700 text-green-500 hover:text-green-400 hover:border-green-500 hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 3C9.383 3 4 8.383 4 15c0 2.254.625 4.412 1.813 6.297L4 29l8.047-1.75C13.852 27.75 14.93 28 16 28c6.617 0 12-5.383 12-12S22.617 3 16 3zm0 2c5.532 0 10 4.468 10 10s-4.468 10-10 10c-.953 0-1.91-.152-2.844-.453l-.398-.129-.41.088-4.32.94.932-4.34.09-.418-.223-.363C7.582 19.07 7 17.062 7 15c0-5.532 4.468-10 10-10zm-3.012 5.004c-.23-.006-.504.02-.777.366-.273.347-1.02 1.063-1.02 2.594 0 1.531 1.043 3.011 1.188 3.219.145.207 2.027 3.242 5.004 4.42 2.477.974 2.977.781 3.516.73.539-.051 1.73-.707 1.977-1.391.246-.684.246-1.27.176-1.395-.07-.125-.27-.199-.559-.348-.289-.148-1.715-.848-1.98-.945-.266-.098-.461-.148-.656.148-.195.293-.754.945-.926 1.137-.172.195-.34.219-.629.07-.289-.145-1.219-.449-2.322-1.387-.859-.762-1.438-1.707-1.609-1.996-.172-.293-.02-.453.129-.602.133-.133.289-.348.434-.52.145-.172.191-.293.289-.488.098-.195.051-.367-.027-.516-.078-.145-.695-1.676-.953-2.297-.246-.594-.496-.609-.727-.617z" />
                  </svg>
                  Lautaro
                </a>
              </div>
            </div>
          </div>
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
