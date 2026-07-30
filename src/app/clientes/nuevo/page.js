"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/client'; 

export default function NuevoClientePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '', 
    telefono: '',
    direccion: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Insertamos el registro en Supabase
    const { error: insertError } = await supabase
      .from('clientes')
      .insert([
        {
          nombre_completo: formData.nombre_completo,
          dni: formData.dni,
          telefono: formData.telefono,
          direccion: formData.direccion,
          activo: true // Lo creamos como activo por defecto
        }
      ]);

    if (insertError) {
      setError('Hubo un error al guardar el cliente: ' + insertError.message);
      setLoading(false);
      return;
    }

    // Si todo salió bien, regresamos a la tabla de clientes
    router.push('/clientes');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Encabezado y botón volver */}
        <div className="mb-8">
          <Link href="/clientes" className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block">
            &larr; Volver a Clientes
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-800">Registrar Nuevo Cliente</h2>
          <p className="text-slate-500 mt-1">Ingresa los datos del nuevo usuario para el servicio.</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="nombre_completo"
                required
                value={formData.nombre_completo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">DNI / Documento *</label>
                <input
                  type="text"
                  name="dni"
                  required
                  value={formData.dni}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Ej. 12345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Ej. 987654321"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                placeholder="Ej. Av. Principal 123, Distrito"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link
                href="/clientes"
                className="px-6 py-3 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg text-white font-medium shadow-md transition-all ${
                  loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {loading ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}