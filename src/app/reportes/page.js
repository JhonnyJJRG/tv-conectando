"use client";
export const dynamic = 'force-dynamic'; // Evitamos errores de compilación estática

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ReportesPage() {
  const supabase = createClient();
  const router = useRouter();

  // Estados para los filtros y datos
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // Estado para los totales matemáticos
  const [resumen, setResumen] = useState({
    total: 0,
    efectivo: 0,
    transferencia: 0,
    yapePlin: 0
  });

  // Al cargar la página, ponemos por defecto el mes actual
  useEffect(() => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const diaHoy = hoy.toISOString().split('T')[0];
    
    setFechaInicio(primerDia);
    setFechaFin(diaHoy);
  }, []);

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Función para buscar en la base de datos
  const generarReporte = async () => {
    setCargando(true);
    
    // Agregamos las horas para abarcar los días completos
    const inicio = new Date(fechaInicio + 'T00:00:00').toISOString();
    const fin = new Date(fechaFin + 'T23:59:59').toISOString();

    const { data, error } = await supabase
      .from('pagos')
      .select(`
        id,
        monto,
        metodo_pago,
        created_at,
        clientes ( * )
      `)
      .gte('created_at', inicio)
      .lte('created_at', fin)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPagos(data);
      
      // Calculamos los totales
      let totalSum = 0, efectivoSum = 0, transSum = 0, ypSum = 0;
      
      data.forEach(pago => {
        const monto = parseFloat(pago.monto);
        totalSum += monto;
        
        const metodo = (pago.metodo_pago || '').toLowerCase();
        if (metodo.includes('efectivo')) efectivoSum += monto;
        else if (metodo.includes('transferencia')) transSum += monto;
        else if (metodo.includes('yape') || metodo.includes('plin')) ypSum += monto;
      });

      setResumen({
        total: totalSum,
        efectivo: efectivoSum,
        transferencia: transSum,
        yapePlin: ypSum
      });
    } else {
      alert("Error al cargar reporte: " + error?.message);
    }
    setCargando(false);
  };

  // Función para descargar Excel (CSV)
  const exportarCSV = () => {
    if (pagos.length === 0) return alert("No hay datos para exportar");

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Cliente,Monto,Metodo de Pago\n";

    pagos.forEach(row => {
      const fecha = new Date(row.created_at).toLocaleDateString();
      // Si tu columna en clientes se llama diferente, ajusta "row.clientes.nombre"
      const cliente = row.clientes?.nombre || row.clientes?.nombre_completo || 'Desconocido';
      csvContent += `${fecha},${cliente},${row.monto},${row.metodo_pago}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Pagos_${fechaInicio}_al_${fechaFin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <nav className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center">
        <div className="flex space-x-6 items-center">
          <span className="font-bold text-xl">TV Conectando</span>
          <Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link href="/clientes" className="text-gray-300 hover:text-white">Clientes</Link>
          <Link href="/pagos" className="text-gray-300 hover:text-white">Pagos</Link>
          <Link href="/reportes" className="font-bold border-b-2 border-white pb-1">Reportes</Link>
        </div>
        <button onClick={handleCerrarSesion} className="bg-red-500 px-4 py-2 rounded font-medium hover:bg-red-600">
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenedor Principal */}
      <div className="p-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Reportes Financieros</h1>
            <p className="text-gray-500">Filtra y exporta los ingresos de tus rutas.</p>
          </div>
          
          {/* Controles de Filtro */}
          <div className="flex space-x-4 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">DESDE</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">HASTA</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="border rounded p-2 text-sm" />
            </div>
            <button onClick={generarReporte} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium text-sm">
              Buscar
            </button>
            <button onClick={exportarCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium text-sm flex items-center">
              ↓ Exportar Excel
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-600">
            <h3 className="text-xs font-bold text-gray-400 mb-1">TOTAL RECAUDADO</h3>
            <p className="text-2xl font-black text-slate-800">S/ {resumen.total.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-gray-400 mb-1">EFECTIVO</h3>
            <p className="text-2xl font-bold text-slate-700">S/ {resumen.efectivo.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-gray-400 mb-1">TRANSFERENCIA</h3>
            <p className="text-2xl font-bold text-slate-700">S/ {resumen.transferencia.toFixed(2)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-gray-400 mb-1">YAPE / PLIN</h3>
            <p className="text-2xl font-bold text-slate-700">S/ {resumen.yapePlin.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {cargando ? (
             <div className="p-10 text-center text-gray-500">Cargando datos...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Método</th>
                  <th className="p-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">No hay cobros en este rango de fechas. Presiona "Buscar".</td></tr>
                ) : (
                  pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{new Date(pago.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-medium text-gray-800">{pago.clientes?.nombre || pago.clientes?.nombre_completo || 'N/A'}</td>
                      <td className="p-4 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{pago.metodo_pago}</span>
                      </td>
                      <td className="p-4 text-sm font-bold text-green-600 text-right">S/ {parseFloat(pago.monto).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}