import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request) {
  // Inicializamos la respuesta por defecto
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Creamos el cliente de Supabase para el entorno del servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Consultamos a la base de datos si existe un usuario activo en las cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Definimos qué rutas queremos proteger (todo lo que empiece con /dashboard)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // Lógica de seguridad: Si no hay usuario y quiere entrar al dashboard, lo pateamos al login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Opcional (Mejora de UX): Si el usuario YA está logueado y va a la raíz (/), lo mandamos al dashboard
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Esta configuración le dice a Next.js en qué rutas ejecutar este middleware
export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (ícono del navegador)
     * - extensiones de imágenes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}