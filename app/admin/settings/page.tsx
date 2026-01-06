'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Settings {
  id: string;
  shopName: string;
  shopSubtitle: string;
  logo: string | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    shopName: '',
    shopSubtitle: '',
    logo: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session.user?.role !== 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session.user?.role === 'ADMIN') {
      fetchSettings();
    }
  }, [status, session]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          shopName: data.shopName,
          shopSubtitle: data.shopSubtitle,
          logo: data.logo || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let logoUrl = formData.logo;

      // Si hay un nuevo logo, subirlo primero
      if (logoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', logoFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          logoUrl = url;
        } else {
          const error = await uploadRes.json();
          alert(error.error || 'Error al subir logo');
          setSaving(false);
          return;
        }
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, logo: logoUrl }),
      });

      if (res.ok) {
        alert('Configuración guardada exitosamente');
        fetchSettings();
        setLogoFile(null);
        setLogoPreview('');
      } else {
        alert('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!session || session.user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Configuración del Taller</h1>
            <Link href="/admin/dashboard" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
              ← Volver
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalizar Taller</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Nombre del Taller *</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                required
                placeholder="Ej: Taller Mecánico"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Subtítulo *</label>
              <input
                type="text"
                value={formData.shopSubtitle}
                onChange={(e) => setFormData({ ...formData, shopSubtitle: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                required
                placeholder="Ej: Repuestos y Mercadería"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Logo del Taller</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {(logoPreview || formData.logo) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 mb-2">Vista previa:</p>
                  <img 
                    src={logoPreview || formData.logo} 
                    alt="Logo" 
                    className="h-24 object-contain rounded-lg border bg-white p-2"
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
