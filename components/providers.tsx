"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { StudentCacheProvider } from "@/contexts/StudentCacheContext"

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider
			// Add error handling
			onError={(error) => {
				console.warn("NextAuth client error:", error)
			}}
			// Reduce refetch interval to avoid spam
			refetchInterval={0}
			refetchOnWindowFocus={false}
		>
			<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
				<StudentCacheProvider>
					{children}
				</StudentCacheProvider>
			</ThemeProvider>
		</SessionProvider>
	)
}
