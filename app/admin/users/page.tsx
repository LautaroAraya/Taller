'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'EMPLOYEE',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session.user?.role !== 'ADMIN') {
      router.push('/admin/panel');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchUsers();
        resetForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload: any = { name: editing.name };
    if (editing.role) payload.role = editing.role;
    if ((editing as any).password && (editing as any).password.length >= 6) {
      payload.password = (editing as any).password;
    }
    try {
      const res = await fetch(`/api/users/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditing(null);
        fetchUsers();
        // Si el admin edita su propio perfil, recargar para refrescar nombre del header
        if (session?.user?.id === editing.id) {
          window.location.reload();
        }
      } else {
        alert('Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'EMPLOYEE',
    });
    setShowForm(false);
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
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <Link href="/admin/panel" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50">
              ← Volver
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
        >
          {showForm ? 'Cancelar' : '+ Agregar Usuario'}
        </button>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Contraseña *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Rol *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                  required
                >
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Crear Usuario
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Nombre</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Email</th>
                <th className="px-4 py-3 text-center font-bold text-gray-900">Rol</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Creado</th>
                <th className="px-4 py-3 text-center font-bold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setEditing(user)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Editar Usuario</h3>
                <button onClick={() => setEditing(null)} className="text-2xl text-gray-500">×</button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Rol</label>
                  <select
                    value={editing.role}
                    onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900"
                    disabled={session?.user?.id === editing.id}
                  >
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  {session?.user?.id === editing.id && (
                    <p className="text-xs text-gray-600 mt-1">No podés cambiar tu propio rol.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    onChange={(e) => setEditing({ ...(editing as any), password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                    placeholder="Dejar vacío para no cambiar"
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Guardar</button>
                  <button type="button" onClick={() => setEditing(null)} className="bg-gray-300 text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
