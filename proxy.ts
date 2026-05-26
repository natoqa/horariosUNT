import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/login', '/recuperar', '/cambiar-password', '/preview'];

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { url, anonKey };
}

export async function proxy(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));

  if (!user && !isPublicRoute && !path.startsWith('/api') && path !== '/') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const userRole = (user.user_metadata?.role as string) || 'docente';

    if (isPublicRoute || path === '/') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${userRole}`;
      return NextResponse.redirect(redirectUrl);
    }

    const protectedRoles = ['director', 'secretaria', 'docente'];
    const firstSegment = path.split('/')[1];
    if (protectedRoles.includes(firstSegment) && firstSegment !== userRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${userRole}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
