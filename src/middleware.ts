import { getToken } from "next-auth/jwt";
import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const pathName = req.nextUrl.pathname;

    // Check if the user is authenticated
    const token = await getToken({ req });
    const isLoginPage = pathName === "/login";

    // Define sensitive routes that require authentication
    const protectedRoutes = ["/dashboard"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathName.startsWith(route)
    );

    // Redirect logged-in users away from the login page
    if (isLoginPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Redirect non-authenticated users trying to access protected routes
    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect root path to the dashboard if authenticated, otherwise to login
    if (pathName === "/") {
      return NextResponse.redirect(
        new URL(token ? "/dashboard" : "/login", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized({}) {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
