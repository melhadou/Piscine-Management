"use client"

import { createClient } from "@supabase/supabase-js"
import { useState } from "react"

export default function TestConnection() {
	const [testResults, setTestResults] = useState<any[]>([])
	const [loading, setLoading] = useState(false)

	// Debug environment variables
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	console.log('Environment Debug:', {
		hasUrl: !!supabaseUrl,
		hasKey: !!supabaseAnonKey,
		urlLength: supabaseUrl?.length,
		keyLength: supabaseAnonKey?.length
	})

	const supabase = createClient(
		supabaseUrl || '',
		supabaseAnonKey || ''
	)

	const runTest = async (testName: string, testFunction: () => Promise<any>) => {
		console.log(`Running ${testName}...`)
		setLoading(true)

		try {
			const result = await testFunction()
			const testResult = {
				name: testName,
				success: true,
				result: result,
				timestamp: new Date().toLocaleTimeString()
			}
			setTestResults(prev => [...prev, testResult])
			console.log(`✅ ${testName} passed:`, result)
			return result
		} catch (error) {
			const testResult = {
				name: testName,
				success: false,
				error: error,
				timestamp: new Date().toLocaleTimeString()
			}
			setTestResults(prev => [...prev, testResult])
			console.error(`❌ ${testName} failed:`, error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	const testBasicConnection = () => runTest("Basic Connection", async () => {
		const { data, error } = await supabase
			.from('staff')
			.select('count', { count: 'exact', head: true })

		if (error) throw error
		return { message: "Connection successful", count: data }
	})

	const testCreateStaffTable = () => runTest("Create Staff Table", async () => {
		// This will try to create the table - it's safe to run multiple times
		const { error } = await supabase.rpc('exec_sql', {
			sql: `
        CREATE TABLE IF NOT EXISTS staff (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          google_id VARCHAR(255),
          avatar_url TEXT,
          role VARCHAR(50) DEFAULT 'staff',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
		})

		if (error) throw error
		return { message: "Staff table created or already exists" }
	})

	const testFetchStaff = () => runTest("Fetch Staff Data", async () => {
		const { data, error } = await supabase
			.from('staff')
			.select('*')
			.limit(10)

		if (error) throw error
		return {
			message: `Found ${data?.length || 0} staff records`,
			data: data
		}
	})

	const testInsertSampleData = () => runTest("Insert Sample Staff", async () => {
		// Try to insert a test user (will fail if email already exists, which is fine)
		const { data, error } = await supabase
			.from('staff')
			.insert({
				email: 'test@example.com',
				name: 'Test User',
				role: 'staff'
			})
			.select()

		// If user already exists, that's okay - just fetch existing user
		if (error && error.code === '23505') { // Unique violation
			const { data: existingData, error: fetchError } = await supabase
				.from('staff')
				.select('*')
				.eq('email', 'test@example.com')
				.single()

			if (fetchError) throw fetchError
			return {
				message: "Test user already exists",
				data: existingData
			}
		}

		if (error) throw error
		return {
			message: "Test user created successfully",
			data: data
		}
	})

	const testAuthentication = () => runTest("Test Authentication", async () => {
		// Test if we can access auth functions
		const { data: { user }, error } = await supabase.auth.getUser()

		return {
			message: user ? "User is authenticated" : "No authenticated user",
			user: user
		}
	})

	const runAllTests = async () => {
		setTestResults([])
		try {
			await testBasicConnection()
			await testFetchStaff()
			await testInsertSampleData()
			await testAuthentication()
			console.log("🎉 All tests completed!")
		} catch (error) {
			console.error("Tests stopped due to error:", error)
		}
	}

	const clearResults = () => {
		setTestResults([])
		console.clear()
	}

	return (
		<div className="p-8 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Supabase Connection Tests</h1>

			<div className="mb-6 p-4 bg-blue-50 rounded-lg">
				<h2 className="text-lg font-semibold mb-2">Environment Status</h2>
				<p>NEXT_PUBLIC_SUPABASE_URL: {supabaseUrl ? '✅ Set' : '❌ Not set'}</p>
				<p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {supabaseAnonKey ? '✅ Set' : '❌ Not set'}</p>
				{supabaseUrl && <p className="text-xs text-gray-600">URL: {supabaseUrl}</p>}
				{supabaseAnonKey && <p className="text-xs text-gray-600">Key: {supabaseAnonKey.substring(0, 20)}...</p>}
			</div>

			<div className="space-x-4 mb-6">
				<button
					onClick={runAllTests}
					disabled={loading}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
				>
					{loading ? 'Running Tests...' : 'Run All Tests'}
				</button>

				<button
					onClick={testBasicConnection}
					disabled={loading}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
				>
					Test Connection
				</button>

				<button
					onClick={testFetchStaff}
					disabled={loading}
					className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
				>
					Fetch Staff Data
				</button>

				<button
					onClick={testInsertSampleData}
					disabled={loading}
					className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
				>
					Insert Test Data
				</button>

				<button
					onClick={clearResults}
					className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
				>
					Clear Results
				</button>
			</div>

			{testResults.length > 0 && (
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">Test Results</h2>
					{testResults.map((result, index) => (
						<div
							key={index}
							className={`p-4 rounded-lg border ${result.success
								? 'bg-green-50 border-green-200'
								: 'bg-red-50 border-red-200'
								}`}
						>
							<div className="flex items-center justify-between mb-2">
								<h3 className="font-semibold flex items-center">
									{result.success ? '✅' : '❌'} {result.name}
								</h3>
								<span className="text-sm text-gray-500">{result.timestamp}</span>
							</div>

							{result.success ? (
								<div>
									<p className="text-green-700 mb-2">{result.result.message}</p>
									{result.result.data && (
										<details className="mt-2">
											<summary className="cursor-pointer text-sm text-green-600">View Data</summary>
											<pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">
												{JSON.stringify(result.result.data, null, 2)}
											</pre>
										</details>
									)}
								</div>
							) : (
								<div>
									<p className="text-red-700">{result.error.message}</p>
									<details className="mt-2">
										<summary className="cursor-pointer text-sm text-red-600">View Error Details</summary>
										<pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
											{JSON.stringify(result.error, null, 2)}
										</pre>
									</details>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<h3 className="font-semibold mb-2">Instructions:</h3>
				<ol className="list-decimal list-inside space-y-1 text-sm">
					<li>First, make sure your staff table exists in Supabase</li>
					<li>Click "Test Connection" to verify basic connectivity</li>
					<li>Click "Fetch Staff Data" to try reading from the database</li>
					<li>Click "Insert Test Data" to try writing to the database</li>
					<li>Click "Run All Tests" to run everything in sequence</li>
					<li>Check browser console for detailed logs</li>
				</ol>
			</div>
		</div>
	)
}
