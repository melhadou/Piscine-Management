"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { signIn, getProviders, getSession } from "next-auth/react" // Add these imports
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Chrome, Mail, Lock } from "lucide-react"

export default function SignInPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [providers, setProviders] = useState<any>(null) // Add this
	const router = useRouter()

	// Add this useEffect
	useEffect(() => {
		const setupProviders = async () => {
			const res = await getProviders()
			setProviders(res)
		}

		const checkSession = async () => {
			const session = await getSession()
			if (session) {
				router.push('/dashboard')
			}
		}

		setupProviders()
		checkSession()
	}, [router])

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		// Simulate sign in process (keep as is for now)
		setTimeout(() => {
			setIsLoading(false)
			router.push("/dashboard")
		}, 1000)
	}

	// Replace this function
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
						Continue with Google
					</Button>
					{/* Rest of your existing JSX stays the same */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<Separator className="w-full" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
						</div>
					</div>
					<form onSubmit={handleEmailSignIn} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									type="email"
									placeholder="staff@42school.fr"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign in"}
						</Button>
					</form>
					<div className="text-center text-sm text-muted-foreground">
						<p>Demo Mode - Any credentials will work</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
