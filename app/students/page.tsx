"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentTable } from "@/components/student-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Download, Users, RefreshCw, AlertCircle, Database } from "lucide-react"

interface Student {
	uuid: string
	login: string
	firstName: string
	lastName: string
	email: string
	phone?: string
	campus: string
	cursus: string
	level: number
	wallet: number
	correctionPoint: number
	location: string
	// Enhanced fields (may or may not exist in current DB)
	blocks?: number
	votes_given?: number
	votes_received?: number
	voters?: number
	reviewee?: number
	reviewer?: number
	feedbacks_received?: number
	performance?: number
	communication?: number
	professionalism?: number
	validated_rushes_participated?: string
	passed_exams_registered?: string
	final_exam_validated?: boolean
	last_validated_project?: string
	validated_projects?: number
	age?: number
	gender?: string
	coding_level?: string
	context?: string
	// Other fields
	grades?: {
		[key: string]: {
			grade: number
			status: string
		}
	}
	rushRating?: number
	notes?: Array<{
		id: string
		content: string
		category: string
		priority: string
		author: string
		createdAt: string
	}>
	hasExamData?: boolean
	hasRushData?: boolean
	created_at?: string
	updated_at?: string
}

interface StudentsResponse {
	success: boolean
	students: Student[]
	total: number
	summary?: {
		totalStudents: number
		withExamData: number
		withRushData: number
		activeStudents: number
		averageLevel?: string
		averagePerformance?: string
	}
	error?: string
	message?: string
	details?: string
}

export default function StudentsPage() {
	const [students, setStudents] = useState<Student[]>([])
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [levelFilter, setLevelFilter] = useState("all")
	const [rushFilter, setRushFilter] = useState("all")
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [summary, setSummary] = useState<StudentsResponse['summary'] | null>(null)
	const [debugInfo, setDebugInfo] = useState<string | null>(null)

	// Fetch students data from API
	const fetchStudents = async () => {
		try {
			setIsLoading(true)
			setError(null)
			setDebugInfo(null)

			console.log('🔍 Fetching students from API...')
			const response = await fetch('/api/students')

			console.log('📡 Response status:', response.status)
			console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

			// Get the raw response text first
			const responseText = await response.text()
			console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500))

			// Try to parse as JSON
			let data: StudentsResponse
			try {
				data = JSON.parse(responseText)
			} catch (parseError) {
				console.error('❌ JSON parse error:', parseError)
				throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`)
			}

			console.log('📊 Parsed API Response:', data)

			if (!response.ok) {
				const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`
				const details = data.details || data.message || 'No additional details'
				console.error('❌ API Error:', errorMessage, details)
				setDebugInfo(`API Error: ${errorMessage}\nDetails: ${details}`)
				throw new Error(errorMessage)
			}

			if (data.success) {
				console.log('✅ Successfully loaded students:', data.students?.length || 0)

				// Log sample student to verify data structure
				if (data.students && data.students.length > 0) {
					const sampleStudent = data.students[0]
					console.log('📋 Sample student data:', {
						username: sampleStudent.login,
						name: sampleStudent.firstName,
						email: sampleStudent.email,
						profileImageUrl: sampleStudent.profileImageUrl,
						level: sampleStudent.level,
						performance: sampleStudent.performance
					})
				}

				setStudents(data.students || [])
				setFilteredStudents(data.students || [])
				setSummary(data.summary || null)
				setDebugInfo(`Successfully loaded ${data.students?.length || 0} students with clean names and images`)
			} else {
				const errorMessage = data.message || data.error || 'Failed to load students'
				console.error('❌ API returned success=false:', errorMessage)
				setDebugInfo(`API Error: ${errorMessage}`)
				throw new Error(errorMessage)
			}

		} catch (error) {
			console.error('❌ Error fetching students:', error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to load students'
			setError(errorMessage)
			setDebugInfo(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	// Load data on component mount
	useEffect(() => {
		fetchStudents()
	}, [])

	const handleSearch = (term: string) => {
		setSearchTerm(term)
		applyFilters(term, statusFilter, levelFilter, rushFilter)
	}

	const handleStatusFilter = (status: string) => {
		setStatusFilter(status)
		applyFilters(searchTerm, status, levelFilter, rushFilter)
	}

	const handleLevelFilter = (level: string) => {
		setLevelFilter(level)
		applyFilters(searchTerm, statusFilter, level, rushFilter)
	}

	const handleRushFilter = (rush: string) => {
		setRushFilter(rush)
		applyFilters(searchTerm, statusFilter, levelFilter, rush)
	}

	const getAverageGrade = (student: Student) => {
		if (!student.grades || typeof student.grades !== "object") {
			return 0
		}

		const grades = Object.entries(student.grades)
		if (grades.length === 0) return 0

		let totalScore = 0
		let validExams = 0

		grades.forEach(([examName, gradeData]) => {
			if (gradeData && gradeData.grade > 0) {
				// Apply proper validation thresholds
				let isValid = false
				if (examName === 'final_exam') {
					isValid = gradeData.grade >= 42 // Final exam valid at 42+
				} else {
					isValid = gradeData.grade >= 50 // Other exams valid at 50+
				}

				if (isValid) {
					totalScore += gradeData.grade
					validExams++
				}
			}
		})

		return validExams > 0 ? Math.round(totalScore / validExams) : 0
	}

	const getStudentStatus = (student: Student) => {
		const averageGrade = getAverageGrade(student)
		const level = student.level || 0
		const rushRating = getBestRushRating(student)
		const performance = student.performance || 0

		// Count valid exams with proper thresholds
		let validExams = 0
		let totalExams = 0

		if (student.grades && typeof student.grades === "object") {
			Object.entries(student.grades).forEach(([examName, gradeData]) => {
				if (gradeData && gradeData.grade > 0) {
					totalExams++
					// Apply proper validation thresholds
					if (examName === 'final_exam' && gradeData.grade >= 42) {
						validExams++
					} else if (examName !== 'final_exam' && gradeData.grade >= 50) {
						validExams++
					}
				}
			})
		}

		// Peer-to-peer evaluation
		const reviewsGiven = student.reviewer || 0
		const reviewsReceived = student.reviewee || 0
		const votesGiven = student.votes_given || 0
		const votesReceived = student.votes_received || 0

		// Check for potential cheaters
		// Level is max 5, if someone has high level but no valid exam scores, suspicious
		if (level > 2.0 && validExams === 0) {
			return {
				status: 'cheater',
				label: 'Potential Cheater',
				color: 'bg-red-100 text-red-800 border-red-300',
				description: 'High level but no valid exam scores'
			}
		}

		// Check for other cheating patterns - level too high for valid exam performance
		if (level > 3.0 && averageGrade > 0 && averageGrade < 30) {
			return {
				status: 'cheater',
				label: 'Suspicious Activity',
				color: 'bg-red-100 text-red-800 border-red-300',
				description: 'Level too high for exam performance'
			}
		}

		// Check peer-to-peer behavior (only if they have received enough feedback)
		const isPoorPeer = reviewsGiven < (reviewsReceived / 2) && reviewsReceived > 10
		const isSelfish = votesGiven < (votesReceived / 3) && votesReceived > 15

		// Excellence criteria (level max 5, so 4+ is excellent)
		// Updated criteria: high level + good performance + valid exams
		if (level >= 4.0 && (performance >= 80 || averageGrade >= 70) && validExams >= 3) {
			if (isPoorPeer || isSelfish) {
				return {
					status: 'excellent-selfish',
					label: 'Excellent (Poor Peer)',
					color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
					description: 'Great student but doesn\'t help others enough'
				}
			}
			return {
				status: 'excellent',
				label: 'Excellent',
				color: 'bg-green-100 text-green-800 border-green-300',
				description: 'Outstanding performance and collaborative'
			}
		}

		// Good criteria - relaxed for better classification
		if (level >= 3.0 && (performance >= 70 || averageGrade >= 60) && validExams >= 2) {
			if (isPoorPeer || isSelfish) {
				return {
					status: 'good-selfish',
					label: 'Good (Poor Peer)',
					color: 'bg-orange-100 text-orange-800 border-orange-300',
					description: 'Good student but low peer participation'
				}
			}
			return {
				status: 'good',
				label: 'Good',
				color: 'bg-blue-100 text-blue-800 border-blue-300',
				description: 'Good performance and collaborative'
			}
		}

		// Average criteria
		if (level >= 2.0 && (performance >= 50 || averageGrade >= 50) && validExams >= 1) {
			return {
				status: 'average',
				label: 'Average',
				color: 'bg-gray-100 text-gray-800 border-gray-300',
				description: 'Meets basic requirements'
			}
		}

		// Inactive check
		if (student.location === "unavailable") {
			return {
				status: 'inactive',
				label: 'Inactive',
				color: 'bg-slate-100 text-slate-600 border-slate-300',
				description: 'Not currently active'
			}
		}

		// Needs attention - only for truly poor performance
		return {
			status: 'needs-attention',
			label: 'Needs Attention',
			color: 'bg-red-100 text-red-600 border-red-300',
			description: 'Below expected performance or no valid exams'
		}
	}

	const getBestRushRating = (student: Student) => {
		return student.rushRating || 0
	}

	const applyFilters = (search: string, status: string, level: string, rush: string) => {
		let filtered = students

		// Search filter
		if (search) {
			filtered = filtered.filter(
				(student) =>
					`${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
					student.login.toLowerCase().includes(search.toLowerCase()) ||
					student.email.toLowerCase().includes(search.toLowerCase()),
			)
		}

		// Status filter - updated to use new status calculation
		if (status !== "all") {
			filtered = filtered.filter((student) => {
				const studentStatus = getStudentStatus(student)

				switch (status) {
					case "excellent":
						return studentStatus.status === 'excellent'
					case "good":
						return studentStatus.status === 'good' || studentStatus.status === 'good-selfish'
					case "average":
						return studentStatus.status === 'average'
					case "inactive":
						return studentStatus.status === 'inactive'
					case "needs-attention":
						return studentStatus.status === 'needs-attention'
					case "cheater":
						return studentStatus.status === 'cheater'
					case "poor-peer":
						return studentStatus.status === 'excellent-selfish' || studentStatus.status === 'good-selfish'
					default:
						return true
				}
			})
		}

		// Level filter (adjusted for max level 5)
		if (level !== "all") {
			filtered = filtered.filter((student) => {
				switch (level) {
					case "high":
						return student.level >= 4.0 // High level for max 5
					case "medium":
						return student.level >= 2.0 && student.level < 4.0
					case "low":
						return student.level < 2.0
					default:
						return true
				}
			})
		}

		// Rush filter
		if (rush !== "all") {
			filtered = filtered.filter((student) => {
				const rating = getBestRushRating(student)
				switch (rush) {
					case "excellent":
						return rating >= 4
					case "good":
						return rating === 3
					case "average":
						return rating === 2
					case "needs-improvement":
						return rating === 1
					case "no-rating":
						return rating === 0
					default:
						return true
				}
			})
		}

		setFilteredStudents(filtered)
	}

	const exportData = () => {
		const csvContent = [
			["Name", "Login", "Email", "Level", "Avg Grade", "Rush Rating", "Performance", "Reviews Given", "Reviews Received", "Status", "Location"].join(","),
			...filteredStudents.map((student) => {
				const averageGrade = getAverageGrade(student)
				const rushRating = getBestRushRating(student)
				const studentStatus = getStudentStatus(student)

				return [
					`${student.firstName} ${student.lastName}`,
					student.login,
					student.email,
					student.level.toFixed(2),
					averageGrade,
					rushRating,
					student.performance || 0,
					student.reviewer || 0,
					student.reviewee || 0,
					studentStatus.label,
					student.location,
				].join(",")
			}),
		].join("\n")

		const blob = new Blob([csvContent], { type: "text/csv" })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`
		a.click()
		window.URL.revokeObjectURL(url)
	}

	// Loading skeleton
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-9 w-48" />
						<Skeleton className="h-5 w-96 mt-2" />
					</div>
					<Skeleton className="h-10 w-32" />
				</div>

				<div className="grid gap-4 md:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-4 w-4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-12" />
								<Skeleton className="h-4 w-20 mt-1" />
							</CardContent>
						</Card>
					))}
				</div>

				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex gap-4">
								<Skeleton className="h-10 flex-1" />
								<Skeleton className="h-10 w-40" />
								<Skeleton className="h-10 w-32" />
								<Skeleton className="h-10 w-36" />
							</div>
							<Skeleton className="h-64 w-full" />
						</div>
					</CardContent>
				</Card>

				<div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-blue-800">Loading students data...</p>
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Students</h1>
						<p className="text-muted-foreground">Manage and evaluate student performance across all metrics</p>
					</div>
				</div>

				<Alert className="border-red-200 bg-red-50">
					<AlertCircle className="h-4 w-4 text-red-600" />
					<AlertDescription className="text-red-800">
						<div className="space-y-2">
							<div className="font-medium">Failed to fetch students</div>
							<div className="text-sm">{error}</div>
							{debugInfo && (
								<details className="text-xs">
									<summary className="cursor-pointer">Debug Information</summary>
									<pre className="mt-2 p-2 bg-red-100 rounded text-red-900 overflow-auto">{debugInfo}</pre>
								</details>
							)}
						</div>
					</AlertDescription>
				</Alert>

				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p className="text-muted-foreground mb-4">Failed to load student data</p>
							<div className="space-y-2">
								<Button onClick={fetchStudents} className="flex items-center gap-2">
									<RefreshCw className="h-4 w-4" />
									Try Again
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Students</h1>
					<p className="text-muted-foreground">Manage and evaluate student performance across all metrics</p>
					{summary && (
						<p className="text-sm text-muted-foreground mt-1">
							{summary.activeStudents} active • {summary.withExamData} with exam data • {summary.withRushData} with rush data
							{summary.averageLevel && ` • Avg Level: ${summary.averageLevel}`}
							{summary.averagePerformance && ` • Avg Performance: ${summary.averagePerformance}%`}
						</p>
					)}
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={fetchStudents} className="flex items-center gap-2">
						<RefreshCw className="h-4 w-4" />
						Refresh
					</Button>
					<Button onClick={exportData} className="flex items-center gap-2">
						<Download className="h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Students</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{students.length}</div>
						<p className="text-xs text-muted-foreground">
							{summary?.activeStudents || 0} active
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Excellent</CardTitle>
						<Badge className="bg-green-100 text-green-800 border-green-200">★</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => getStudentStatus(s).status === 'excellent').length}
						</div>
						<p className="text-xs text-muted-foreground">Top performers</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Potential Cheaters</CardTitle>
						<Badge className="bg-red-100 text-red-800 border-red-200">⚠️</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => getStudentStatus(s).status === 'cheater').length}
						</div>
						<p className="text-xs text-muted-foreground">Suspicious activity</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Poor Peers</CardTitle>
						<Badge className="bg-orange-100 text-orange-800 border-orange-200">👥</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => getStudentStatus(s).status.includes('selfish')).length}
						</div>
						<p className="text-xs text-muted-foreground">Low peer participation</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
						<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">!</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => getStudentStatus(s).status === 'needs-attention').length}
						</div>
						<p className="text-xs text-muted-foreground">Requires review</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Student Management</CardTitle>
					<CardDescription>Search, filter, and manage student evaluations</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search students..."
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2">
							<Select value={statusFilter} onValueChange={handleStatusFilter}>
								<SelectTrigger className="w-[180px]">
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="excellent">Excellent</SelectItem>
									<SelectItem value="good">Good</SelectItem>
									<SelectItem value="average">Average</SelectItem>
									<SelectItem value="needs-attention">Needs Attention</SelectItem>
									<SelectItem value="cheater">Potential Cheaters</SelectItem>
									<SelectItem value="poor-peer">Poor Peers</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>

							<Select value={levelFilter} onValueChange={handleLevelFilter}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="Level" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Levels</SelectItem>
									<SelectItem value="high">High (4.0+)</SelectItem>
									<SelectItem value="medium">Medium (2.0-4.0)</SelectItem>
									<SelectItem value="low">Low (&lt;2.0)</SelectItem>
								</SelectContent>
							</Select>

							<Select value={rushFilter} onValueChange={handleRushFilter}>
								<SelectTrigger className="w-[160px]">
									<SelectValue placeholder="Rush Rating" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Rush Ratings</SelectItem>
									<SelectItem value="excellent">Excellent (4)</SelectItem>
									<SelectItem value="good">Good (3)</SelectItem>
									<SelectItem value="average">Average (2)</SelectItem>
									<SelectItem value="needs-improvement">Needs Improvement (1)</SelectItem>
									<SelectItem value="no-rating">No Rating</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{filteredStudents.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>No students found matching your criteria</p>
							{students.length === 0 && (
								<div className="mt-4">
									<p className="text-sm">No students have been imported yet.</p>
									<Button variant="outline" className="mt-2" onClick={() => window.location.href = '/import'}>
										Import Student Data
									</Button>
								</div>
							)}
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									Showing {filteredStudents.length} of {students.length} students
								</p>
								{filteredStudents.length !== students.length && (
									<Button variant="outline" size="sm" onClick={() => {
										setSearchTerm("")
										setStatusFilter("all")
										setLevelFilter("all")
										setRushFilter("all")
										setFilteredStudents(students)
									}}>
										Clear Filters
									</Button>
								)}
							</div>
							<StudentTable students={filteredStudents} />
						</div>
					)}
				</CardContent>
			</Card>

			{/* Data Summary Card */}
			{summary && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							Data Summary
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-4">
							<div className="text-center p-4 border rounded-lg">
								<div className="text-2xl font-bold text-blue-600">{summary.totalStudents}</div>
								<div className="text-sm text-muted-foreground">Total Students</div>
							</div>
							<div className="text-center p-4 border rounded-lg">
								<div className="text-2xl font-bold text-green-600">{summary.withExamData}</div>
								<div className="text-sm text-muted-foreground">With Exam Data</div>
							</div>
							<div className="text-center p-4 border rounded-lg">
								<div className="text-2xl font-bold text-purple-600">{summary.withRushData}</div>
								<div className="text-sm text-muted-foreground">With Rush Data</div>
							</div>
							<div className="text-center p-4 border rounded-lg">
								<div className="text-2xl font-bold text-orange-600">{summary.activeStudents}</div>
								<div className="text-sm text-muted-foreground">Active Students</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
