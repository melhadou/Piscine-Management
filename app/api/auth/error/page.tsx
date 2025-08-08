"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

function AuthErrorContent() {
	const searchParams = useSearchParams()
	const [currentUrl, setCurrentUrl] = useState('')
	const error = searchParams?.get('error')

	useEffect(() => {
		// Set the URL only on the client side
		setCurrentUrl(window.location.href)
	}, [])

	const getErrorMessage = (error: string | null) => {
		switch (error) {
			case 'Configuration':
				return 'There is a problem with the server configuration.'
			case 'AccessDenied':
				return 'Access denied. Only users with @irbid.42.tech email addresses can access this system. Please sign in with your official Irbid 42 School Google account.'
			case 'Verification':
				return 'The verification token has expired or has already been used.'
			case 'OAuthCallback':
				return 'Error in handling the response from the OAuth provider.'
			case 'OAuthCreateAccount':
				return 'Could not create OAuth account in the database.'
			case 'EmailCreateAccount':
				return 'Could not create email account in the database.'
			case 'Callback':
				return 'Error in the OAuth callback handler route'
			case 'OAuthAccountNotLinked':
				return 'The account is not linked. Sign in with the same account you used originally.'
			case 'EmailSignin':
				return 'Sending the e-mail with the verification token failed.'
			case 'CredentialsSignin':
				return 'Sign in failed. Check the details you provided are correct.'
			case 'SessionRequired':
				return 'The content of this page requires you to be signed in at all times.'
			default:
				return 'An unknown error occurred during authentication.'
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-red-600">
						<AlertCircle className="mx-auto h-8 w-8 mb-2" />
						Authentication Error
					</CardTitle>
					<CardDescription className="text-center">
						There was a problem signing you in
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-4 bg-red-50 rounded-lg">
						<p className="text-red-700 text-sm">
							<strong>Error:</strong> {error || 'Unknown'}
						</p>
						<p className="text-red-600 text-sm mt-2">
							{getErrorMessage(error)}
						</p>
					</div>

					<Button
						onClick={() => window.location.href = '/auth/signin'}
						className="w-full"
					>
						Try Again
					</Button>

					{/* Debug info */}
					<details className="text-xs text-gray-500">
						<summary className="cursor-pointer">Debug Information</summary>
						<pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
							{JSON.stringify({
								error: error,
								url: currentUrl,
								searchParams: Object.fromEntries(searchParams?.entries() || [])
							}, null, 2)}
						</pre>
					</details>
				</CardContent>
			</Card>
		</div>
	)
}

export default function AuthError() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<Card className="w-full max-w-md">
					<CardContent className="p-6">
						<div className="text-center">Loading...</div>
					</CardContent>
				</Card>
			</div>
		}>
			<AuthErrorContent />
		</Suspense>
	)
}
