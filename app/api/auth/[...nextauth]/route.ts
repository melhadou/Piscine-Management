import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in staff table
          const { data: staff, error } = await supabase.from("staff").select("*").eq("email", user.email).single()

          if (error && error.code === "PGRST116") {
            // User doesn't exist, create new staff member
            const { error: insertError } = await supabase.from("staff").insert({
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
          } else if (error) {
            console.error("Error checking staff member:", error)
            return false
          }

          return true
        } catch (error) {
          console.error("Sign in error:", error)
          return false
        }
      }
      return false
    },
    async session({ session, token }) {
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
          }
        } catch (error) {
          console.error("Session error:", error)
        }
      }
      return session
    },
  },
})

export { handlers as GET, handlers as POST }
