import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  // Public fonts
  if (pathname.startsWith("/fonts/")) {
    return NextResponse.next();
  }
  // Public transcript images
  if (
    pathname.startsWith("/transcripts/") &&
    pathname.endsWith("/transcript.png")
  ) {
    return NextResponse.next();
  }
  // =========================================
  // INTERNAL TRANSCRIPT RENDERING
  // =========================================

  const internalSecret = request.headers.get("x-transcript-secret");

  const isInternalTranscriptRequest =
    internalSecret && internalSecret === process.env.TRANSCRIPT_INTERNAL_SECRET;

  if (
    isInternalTranscriptRequest &&
    (pathname.startsWith("/transcript/") ||
      pathname.startsWith("/api/transcripts/"))
  ) {
    return NextResponse.next();
  }

  // =========================================
  // PUBLIC ROUTES
  // =========================================

  // Public reference pages
  if (pathname.startsWith("/ref/")) {
    return NextResponse.next();
  }

  // Admin login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // NextAuth API
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Next.js internal files
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // =========================================
  // CHECK AUTHENTICATION
  // =========================================

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const loginUrl = new URL("/admin/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// =========================================
// MATCHER
// =========================================

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
