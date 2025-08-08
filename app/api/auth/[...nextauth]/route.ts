import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

console.log("NextAuth route loaded") // Debug log

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const authOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	pages: {
		signIn: "/auth/signin",
		error: "/api/auth/error",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	cookies: {
		sessionToken: {
			name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: process.env.NODE_ENV === "production",
			},
		},
	},
	debug: process.env.NODE_ENV === "development",
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async signIn({ user, account }: any) {
			console.log("SignIn callback triggered:", { user: user.email, provider: account?.provider })

			if (account?.provider === "google") {
				// Check if user email has the required domain
				const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "@irbid.42.tech"
				if (!user.email || !user.email.endsWith(allowedDomain)) {
					console.log("❌ Access denied: Invalid domain for email:", user.email)
					console.log("Required domain:", allowedDomain)
					return false
				}

				console.log("✅ Domain validation passed:", user.email)

				try {
					// Check if user exists in staff table
					const { data: staff, error } = await supabase
						.from("staff")
						.select("*")
						.eq("email", user.email)
						.single()

					if (error && error.code === "PGRST116") {
						// User doesn't exist, create new staff member
						console.log("Creating new staff member:", user.email)
						const { error: insertError } = await supabase
							.from("staff")
							.insert({
								email: user.email,
								name: user.name,
								google_id: user.id,
								avatar_url: user.image,
								role: "staff",
							})

						if (insertError) {
							console.error("Error creating staff member:", insertError)
							return false
						}
						console.log("Staff member created successfully")
					} else if (error) {
						console.error("Error checking staff member:", error)
						return false
					} else {
						console.log("Existing staff member found:", staff.email)
					}

					return true
				} catch (error) {
					console.error("Sign in error:", error)
					return false
				}
			}

			console.log("Invalid provider:", account?.provider)
			return false
		},
		async jwt({ token, user, account }: any) {
			// Persist the OAuth access_token to the token right after signin
			if (account && user) {
				token.user = user
				
				// Get user role from database
				try {
					const { data: staff } = await supabase
						.from("staff")
						.select("role, id")
						.eq("email", user.email)
						.single()

					if (staff) {
						token.user.role = staff.role
						token.user.id = staff.id
					}
				} catch (error) {
					console.error("JWT callback error:", error)
				}
			}
			return token
		},
		async session({ session, token }: any) {
			// Send properties to the client
			if (token?.user) {
				session.user = token.user
			}
			return session
		},
	},
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
