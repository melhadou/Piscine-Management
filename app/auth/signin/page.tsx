"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome } from "lucide-react"

export default function SignInPage() {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const checkSession = async () => {
			const session = await getSession()
			if (session) {
				router.push('/dashboard')
			}
		}

		checkSession()
	}, [router])

	const handleGoogleSignIn = async () => {
		try {
			setIsLoading(true)
			await signIn('google', {
				callbackUrl: '/dashboard'
			})
		} catch (error) {
			console.error('Google sign in error:', error)
			setIsLoading(false)
		}
	}

	// Rest of your component stays exactly the same...
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">Sign in to Piscine Dashboard</CardTitle>
					<CardDescription className="text-center">Access the 42 School piscine management system</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button variant="outline" className="w-full bg-transparent" onClick={handleGoogleSignIn} disabled={isLoading}>
						<Chrome className="mr-2 h-4 w-4" />
						{isLoading ? "Signing in..." : "Continue with Google"}
					</Button>
					<div className="text-center text-sm text-muted-foreground">
						<p>Use your <strong>@irbid.42.tech</strong> Google account to sign in</p>
						<p className="text-xs mt-1 opacity-75">Only Irbid 42 School staff can access this system</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
