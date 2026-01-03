import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if user is approved
    if (token && !token.approved && path !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }

    // Admin routes protection
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow public routes
        if (
          path === "/" ||
          path === "/login" ||
          path === "/register" ||
          path === "/pending-approval" ||
          path.startsWith("/api/auth") ||
          path === "/api/allowance/process" // Cron job (auth handled by CRON_SECRET)
        ) {
          return true;
        }
        // Require authentication for other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
