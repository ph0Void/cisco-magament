import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { envConfig } from "@/config/EnvConfig";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|auth\\.jpg|.*\\.svg).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const publicRoutes = [
    "/auth",
    "/auth/register",
    // "/api/network",
    "/api/test",
    "/api/seed",
  ];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  const cookieName = envConfig.COOKIE_NAME || "cisco-cookie";
  const token = request.cookies.get(cookieName)?.value;


  let isValidToken = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch (error) {
      console.error("Token inválido o expirado:", error);
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.delete(cookieName);
      return response;
    }
  }

  // usuario auntenticado en ruta publica
  if (isValidToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // usuario no autenticado en ruta privada
  if (!isValidToken && !isPublicRoute) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // otra ruta
  return NextResponse.next();
}
