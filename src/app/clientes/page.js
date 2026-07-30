"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

export default function ClientesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarClientes() {
      // Consultamos todos los registros de la tabla clientes
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false }); // Los más recientes primero

      if (!error && data) {
        setClientes(data);
      }
      setLoading(false);
    }

    cargarClientes();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Barra de Navegación Superior */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">TV Conectando</h1>
          
          {/* Menú de navegación interno */}
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-blue-200 hover:text-white transition-colors text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/clientes" className="text-white border-b-2 border-white pb-1 transition-colors text-sm font-medium">
              Clientes
            </Link>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Gestión de Clientes</h2>
            <p className="text-slate-500 mt-1">Administra la base de datos de usuarios del servicio.</p>
          </div>
          
          {/* Botón que nos llevará a la ruta de registro (que crearemos en el siguiente paso) */}
          <Link href="/clientes/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center gap-2">
            <span>+</span> Nuevo Cliente
          </Link>
        </div>

        {/* Tabla de Clientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nombre Completo</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Dirección</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      No hay clientes registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{cliente.nombre_completo}</td>
                      <td className="px-6 py-4">{cliente.dni || cliente.documento_identidad || '-'}</td>
                      <td className="px-6 py-4">{cliente.telefono || '-'}</td>
                      <td className="px-6 py-4">{cliente.direccion || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cliente.activo !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {cliente.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/clientes/editar/${cliente.id}`} className="text-blue-600 hover:underline">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
                
              </tbody>
            </table>
          </div>
        </div>
      </main>

    </div>
  );
}