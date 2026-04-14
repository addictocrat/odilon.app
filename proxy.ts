import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define protected and public routes
  const isProtectedRoute = path.startsWith("/dashboard");
  const isPublicRoute = path === "/login" || path === "/signup" || path === "/forgot-password" || path === "/reset-password";

  const cookie = request.cookies.get("odilon_session")?.value;
  let session = null;

  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie, encodedKey, {
        algorithms: ["HS256"],
      });
      session = payload;
    } catch (err) {
      // Session invalid or expired
    }
  }

  // Redirect to /login if the user is not authenticated and trying to access a protected route
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Redirect to /dashboard if the user is authenticated and trying to access a public auth route
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
