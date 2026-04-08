import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Sadece ADMIN görebilir
const ADMIN_ONLY_PATHS = ["/finance", "/shoots", "/customers", "/employees"]

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const pathname = req.nextUrl.pathname

        // ADMIN kontrolü gerektiren sayfa mı?
        const isAdminPath = ADMIN_ONLY_PATHS.some(path => pathname.startsWith(path))

        if (isAdminPath && token?.role !== "ADMIN") {
            // ADMIN olmayanları kısıtla (Dashboard'a yönlendir)
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)



export const config = {
    matcher: [
        "/dashboard/:path*",
        "/finance/:path*",
        "/shoots/:path*",
        "/customers/:path*",
        "/employees/:path*",
        "/calendar/:path*",
        "/tasks/:path*",
        "/dashboard",
        "/finance",
        "/shoots",
        "/customers",
        "/employees",
        "/calendar",
        "/tasks",
    ],
}

