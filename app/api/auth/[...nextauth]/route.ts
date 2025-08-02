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
	debug: process.env.NODE_ENV === "development",
	callbacks: {
		async signIn({ user, account }: any) {
			console.log("SignIn callback triggered:", { user: user.email, provider: account?.provider })

			if (account?.provider === "google") {
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
		async session({ session, token }: any) {
			console.log("Session callback triggered:", session.user?.email)

			if (session.user?.email) {
				try {
					// Add user role to session
					const { data: staff } = await supabase
						.from("staff")
						.select("role, id")
						.eq("email", session.user.email)
						.single()

					if (staff) {
						session.user.role = staff.role
						session.user.id = staff.id
						console.log("Session updated with role:", staff.role)
					}
				} catch (error) {
					console.error("Session error:", error)
				}
			}

			return session
		},
	},
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
