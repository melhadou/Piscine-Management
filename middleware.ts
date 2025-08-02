import { withAuth } from "next-auth/middleware"

export default withAuth(
	function middleware(req) {
		console.log("Middleware: User authenticated for", req.nextUrl.pathname)
	},
	{
		callbacks: {
			authorized: ({ token, req }) => {
				// Check if user has a valid token
				return !!token
			},
		},
		pages: {
			signIn: '/auth/signin',
		},
	}
)

// Protect ALL routes except auth routes and public assets
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api/auth (authentication routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc.)
		 */
		'/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
	],
}
