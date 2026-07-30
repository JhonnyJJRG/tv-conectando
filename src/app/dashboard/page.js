"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const handleCerrarSesion = async () => {
    await supabase.auth.signOut(); // Le dice a Supabase que cierre la sesión
    router.push('/'); // Redirige a la página de Login (cambia '/' por '/login' si esa es tu ruta)
    router.refresh();
  };
  const [stats, setStats] = useState({
    ingresosMes: 0,
    clientesActivos: 0,
    cobrosHoy: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarEstadisticas() {
      const hoy = new Date();
      
      // 1. Fechas para calcular el mes actual (Desde el día 1 hasta el último día del mes)
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      // 2. Fecha para calcular los cobros exclusivos de "Hoy"
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

      // Ejecutamos las 3 consultas a la base de datos al mismo tiempo para que sea más rápido
      const [resClientes, resPagosMes, resPagosHoy] = await Promise.all([
        // Cuenta total de clientes
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        // Extrae los montos de los pagos realizados este mes
        supabase.from('pagos').select('monto').gte('created_at', primerDiaMes).lte('created_at', ultimoDiaMes),
        // Cuenta cuántos pagos se hicieron hoy
        supabase.from('pagos').select('id', { count: 'exact', head: true }).gte('created_at', inicioHoy)
      ]);

      // Sumamos todo el dinero del mes usando un reduce
      const totalIngresos = resPagosMes.data 
        ? resPagosMes.data.reduce((suma, pago) => suma + Number(pago.monto), 0) 
        : 0;

      // Actualizamos los estados en la pantalla
      setStats({
        clientesActivos: resClientes.count || 0,
        ingresosMes: totalIngresos,
        cobrosHoy: resPagosHoy.count || 0
      });
      
      setCargando(false);
    }

    cargarEstadisticas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Menú de Navegación */}
      <nav className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
        <div className="flex space-x-6 items-center">
          <span className="font-bold text-xl">TV Conectando</span>
          <Link href="/dashboard" className="font-bold border-b-2 border-white pb-1">Dashboard</Link>
          <Link href="/clientes" className="text-gray-300 hover:text-white">Clientes</Link>
          <Link href="/pagos" className="text-gray-300 hover:text-white">Pagos</Link>
        </div>
        <button onClick={handleCerrarSesion} className="bg-red-500 px-4 py-2 rounded font-medium hover:bg-red-600">
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido del Panel */}
      <div className="p-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Panel de Control</h1>
        <p className="text-gray-500 mb-8">Resumen general de ingresos y clientes.</p>

        {cargando ? (
          <div className="flex justify-center py-10">
            <p className="text-lg text-slate-500">Calculando métricas en tiempo real...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta de Ingresos */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-gray-500 tracking-wider mb-2">INGRESOS DEL MES</h3>
              <p className="text-4xl font-black text-slate-800">
                S/ {stats.ingresosMes.toFixed(2)}
              </p>
            </div>

            {/* Tarjeta de Clientes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-gray-500 tracking-wider mb-2">CLIENTES ACTIVOS</h3>
              <p className="text-4xl font-black text-slate-800">
                {stats.clientesActivos}
              </p>
            </div>

            {/* Tarjeta de Cobros de Hoy */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-gray-500 tracking-wider mb-2">COBROS REGISTRADOS HOY</h3>
              <p className="text-4xl font-black text-slate-800">
                {stats.cobrosHoy}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}