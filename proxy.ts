import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isPublicRoute = path === '/login' || path === '/recuperar';

  if (!user && !isPublicRoute && !path.startsWith('/api') && path !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user) {
    const userRole = user.user_metadata?.role || 'docente';

    if (isPublicRoute || path === '/') {
      const url = request.nextUrl.clone();
      url.pathname = `/${userRole}`;
      return NextResponse.redirect(url);
    }

    const protectedRoles = ['director', 'secretaria', 'docente'];
    const firstSegment = path.split('/')[1];
    if (protectedRoles.includes(firstSegment) && firstSegment !== userRole) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userRole}`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
