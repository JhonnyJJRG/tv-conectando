"use client";

import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation'; // 1. Importamos el enrutador

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); // 2. Inicializamos el enrutador
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales incorrectas o usuario no registrado.');
      setLoading(false);
      return;
    }

    console.log('¡Autenticación exitosa!', data);
    
    // 3. Redireccionamos al usuario a la ruta protegida del Dashboard
    router.push('/dashboard'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            TV Conectando
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Sistema Web de Gestión y Control de Pagos
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 mt-8">
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="usuario@tvconectando.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 active:scale-[0.98] hover:shadow-lg'}`}
          >
            {loading ? 'Validando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>

      </div>
    </div>
  );
}