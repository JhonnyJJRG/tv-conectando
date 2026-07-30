"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NuevoPago() {
  const router = useRouter();
  const supabase = createClient();

  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: '',
    monto: '',
    metodo_pago: 'Efectivo'
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarClientes() {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre_completo')
        .order('nombre_completo', { ascending: true });

      if (data) {
        setClientes(data);
      }
      setCargando(false);
    }
    cargarClientes();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();

    if (!formData.cliente_id) {
      alert("Por favor selecciona un cliente.");
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      alert("Error: No se pudo identificar tu sesión. Por favor vuelve a iniciar sesión.");
      return;
    }

    const { error } = await supabase
      .from('pagos')
      .insert([
        { 
          cliente_id: formData.cliente_id,
          monto: parseFloat(formData.monto),
          metodo_pago: formData.metodo_pago,
          cobrador_id: authData.user.id
        }
      ]);

    if (!error) {
      alert("Pago registrado correctamente");
      router.push('/pagos'); // <-- Aquí ya está la corrección lista
    } else {
      alert("Hubo un error al registrar el pago: " + error.message);
    }
  };

  if (cargando) return <p className="p-10">Cargando sistema de cobros...</p>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registrar Nuevo Pago</h1>

      <form onSubmit={handleGuardar} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <select 
            className="w-full border p-2 rounded bg-white"
            value={formData.cliente_id}
            onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
            required
          >
            <option value="" disabled>-- Selecciona un cliente --</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto (S/)</label>
          <input 
            type="number" 
            step="0.10"
            min="0"
            className="w-full border p-2 rounded"
            placeholder="0.00"
            value={formData.monto}
            onChange={(e) => setFormData({...formData, monto: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
          <select 
            className="w-full border p-2 rounded bg-white"
            value={formData.metodo_pago}
            onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
            required
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Transferencia">Transferencia Bancaria</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button 
            type="button" 
            onClick={() => router.push('/pagos')}
            className="bg-gray-200 px-4 py-2 rounded text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
          >
            Registrar Cobro
          </button>
        </div>
      </form>
    </div>
  );
}