"use client";

export const dynamic = 'force-dynamic'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function HistorialPagos() {
  const supabase = createClient();
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarPagos() {
      // Consultamos los pagos y cruzamos los datos con la tabla clientes para obtener el nombre
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          id,
          monto,
          metodo_pago,
          created_at,
          clientes ( nombre_completo )
        `)
        .order('created_at', { ascending: false }); // Los más recientes primero

      if (data) {
        setPagos(data);
      }
      setCargando(false);
    }
    cargarPagos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Menú de Navegación */}
      <nav className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
        <div className="flex space-x-6 items-center">
          <span className="font-bold text-xl">TV Conectando</span>
          <Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link href="/clientes" className="text-gray-300 hover:text-white">Clientes</Link>
          <Link href="/pagos" className="font-bold border-b-2 border-white pb-1">Pagos</Link>
          <Link href="/reportes" className="text-gray-300 hover:text-white">Reportes</Link>
        </div>
        <button className="bg-red-500 px-4 py-2 rounded font-medium hover:bg-red-600">Cerrar Sesión</button>
      </nav>

      {/* Contenido Principal */}
      <div className="p-10 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Historial de Cobros</h1>
            <p className="text-gray-500">Administra los ingresos registrados en tus rutas comerciales.</p>
          </div>
          <Link 
            href="/pagos/nuevo" 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm"
          >
            + Registrar Cobro
          </Link>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">FECHA</th>
                <th className="px-6 py-4">CLIENTE</th>
                <th className="px-6 py-4">MONTO</th>
                <th className="px-6 py-4">MÉTODO</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" className="text-center py-10">Cargando pagos...</td></tr>
              ) : pagos.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10">No hay pagos registrados.</td></tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(pago.created_at).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {pago.clientes?.nombre_completo || 'Cliente Desconocido'}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      S/ {pago.monto.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {pago.metodo_pago}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}