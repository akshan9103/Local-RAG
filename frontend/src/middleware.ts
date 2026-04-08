import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const publicPaths = ['/', '/login', '/register', '/unauthorized'];

  // 1. Handling users with NO token
  if (!token) {
    // Allow access to public paths
    if (publicPaths.includes(pathname)) {
      return NextResponse.next();
    }
    // Redirect everything else to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. Handling users WITH a token
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = (payload.role as string)?.toLowerCase(); // Normalize to lowercase

    // A. Logic for users hitting Public Paths (Login/Register/Root)
    // We bounce them to their respective "Home" pages
    if (publicPaths.includes(pathname) && pathname !== '/unauthorized') {
      const homePath = role === 'admin' ? '/dashboard' : '/knowledge-bases';
      return NextResponse.redirect(new URL(homePath, req.url));
    }

    // B. Admin-Only Protection for Dashboard
    if (pathname.startsWith('/dashboard')) {
      if (role !== 'admin') {
        console.log('Access Denied: Role is', role);
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // C. Authorized access to protected routes (chat, test, etc.)
    return NextResponse.next();

  } catch (error) {
    // If token is expired or invalid
    console.error('JWT Verification failed:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token'); 
    return response;
  }
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/unauthorized',
    '/dashboard/:path*',
    '/chat/:path*',
    '/knowledge-bases/:path*',
  ],
};