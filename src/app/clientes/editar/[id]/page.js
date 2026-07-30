"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function EditarCliente() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; // El ID que viene en la URL
  const supabase = createClient();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    telefono: '',
    direccion: ''
  });
  const [cargando, setCargando] = useState(true);

  // 1. Cargar los datos del cliente al abrir la página
  useEffect(() => {
    async function cargarCliente() {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setFormData({
          nombre_completo: data.nombre_completo || '',
          dni: data.dni || '',
          telefono: data.telefono || '',
          direccion: data.direccion || ''
        });
      }
      setCargando(false);
    }
    cargarCliente();
  }, [id]);

  // 2. Función para Actualizar (UPDATE)
  const handleActualizar = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre_completo: formData.nombre_completo,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion
      })
      .eq('id', id);

    if (!error) {
      alert("Cliente actualizado correctamente");
      router.push('/clientes'); // Regresa a la lista
      router.refresh(); // Refresca los datos
    } else {
      alert("Error al actualizar: " + error.message);
    }
  };

  // 3. Función para Eliminar (DELETE)
  const handleEliminar = async () => {
    const confirmar = confirm("¿Estás seguro de eliminar este cliente?");
    if (!confirmar) return;

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (!error) {
      alert("Cliente eliminado");
      router.push('/clientes');
      router.refresh();
    } else {
      alert("Error al eliminar: " + error.message);
    }
  };

  if (cargando) return <p className="p-10">Cargando datos del cliente...</p>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Cliente</h1>

      <form onSubmit={handleActualizar} className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label className="block text-sm text-gray-600">Nombre Completo</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.nombre_completo}
            onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">DNI / Documento</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.dni}
            onChange={(e) => setFormData({...formData, dni: e.target.value})}
            required
          />
        </div>

        {/* Campo Teléfono */}
        <div>
          <label className="block text-sm text-gray-600">Teléfono</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
          />
        </div>

        {/* Campo Dirección */}
        <div>
          <label className="block text-sm text-gray-600">Dirección</label>
          <input 
            type="text" 
            className="w-full border p-2 rounded"
            value={formData.direccion}
            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
          />
        </div>

        <div className="flex justify-between pt-4">
          <button 
            type="button" 
            onClick={handleEliminar}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Eliminar Cliente
          </button>

          <div className="space-x-2">
            <button 
              type="button" 
              onClick={() => router.push('/clientes')}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}