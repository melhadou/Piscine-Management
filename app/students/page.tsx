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
import { useStudentCache } from "@/contexts/StudentCacheContext"

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
		// Rush-specific fields
		rush_project?: string
		rush_status?: string
		rush_score?: number
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
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [levelFilter, setLevelFilter] = useState("all")
	const [rushFilter, setRushFilter] = useState("all")
	const [summary, setSummary] = useState<StudentsResponse['summary'] | null>(null)
	const [debugInfo, setDebugInfo] = useState<string | null>(null)
	
	// Use cached student data
	const { students, loading: isLoading, error, fetchStudents: refetchStudents, isDataStale, refreshCache } = useStudentCache()

	// Refresh students data (force refetch from API)
	const refreshStudents = async () => {
		await refreshCache() // Use the context's refresh method
	}

	// Update filtered students when cached students change
	useEffect(() => {
		if (students.length > 0) {
			applyFilters(searchTerm, statusFilter, levelFilter, rushFilter)
		} else {
			setFilteredStudents([])
		}
	}, [students, searchTerm, statusFilter, levelFilter, rushFilter])

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
		const performance = student.performance || 0
		const communication = student.communication || 0
		const professionalism = student.professionalism || 0
		
		// Get validated projects count from database field (more accurate)
		const validatedProjects = student.validated_projects || 0
		const blocks = student.blocks || 0

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

		// Analyze rush notes data if available
		let rushPerformance = 0
		let rushParticipation = 0
		let rushSuccessRate = 0

		if (student.notes && Array.isArray(student.notes)) {
			const rushNotes = student.notes.filter(note => note.category === 'rush')
			if (rushNotes.length > 0) {
				rushParticipation = rushNotes.length
				
				// Count successful rush evaluations
				const successfulRushes = rushNotes.filter(note => {
					// Check if it's marked as successful or has a good score
					return note.rush_status === 'success' || 
						   (note.rush_score && note.rush_score >= 70)
				}).length

				rushSuccessRate = successfulRushes / rushNotes.length

				// Calculate average rush performance from scores
				const rushScores = rushNotes
					.map(note => note.rush_score)
					.filter(score => score !== null && score !== undefined)
				
				if (rushScores.length > 0) {
					rushPerformance = rushScores.reduce((sum, score) => sum + score, 0) / rushScores.length
				}
			}
		}

		// Peer-to-peer evaluation metrics
		const reviewsGiven = student.reviewer || 0
		const reviewsReceived = student.reviewee || 0
		const votesGiven = student.votes_given || 0
		const votesReceived = student.votes_received || 0
		const feedbacksReceived = student.feedbacks_received || 0

		// Calculate interaction and engagement scores
		const totalInteractions = reviewsGiven + reviewsReceived + votesGiven + votesReceived
		const peerEngagement = reviewsGiven + votesGiven
		const helpfulness = reviewsGiven > 0 ? Math.min(reviewsGiven / Math.max(reviewsReceived, 1), 2) : 0

		// Final exam status (important milestone)
		const finalExamValidated = student.final_exam_validated || false

		// Rush validation analysis (from direct field)
		const rushValidationData = student.validated_rushes_participated || '0/0'
		const [rushValidated, rushTotal] = rushValidationData.split('/').map(n => parseInt(n) || 0)
		const rushValidationRate = rushTotal > 0 ? rushValidated / rushTotal : 0

		// Exam participation analysis  
		const examParticipation = student.passed_exams_registered || '0/0'
		const [examsPassed, examsRegistered] = examParticipation.split('/').map(n => parseInt(n) || 0)
		const examSuccessRate = examsRegistered > 0 ? examsPassed / examsRegistered : 0

		// 1. INACTIVE/UNAVAILABLE - Priority check
		if (student.location === "unavailable") {
			return {
				status: 'inactive',
				label: 'Inactive',
				color: 'bg-slate-100 text-slate-600 border-slate-300',
				description: 'Not currently active in the piscine'
			}
		}

		// 2. BLOCKED - Students who have behavioral issues or violations
		if (blocks > 0) {
			return {
				status: 'blocked',
				label: 'Blocked',
				color: 'bg-red-200 text-red-800 border-red-400',
				description: `${blocks} block(s) - disciplinary issues`
			}
		}

		// 3. DROPPED OUT - Very clear indicators of dropout
		if (level <= 1.5 && validatedProjects === 0 && totalInteractions < 5 && examsRegistered === 0) {
			return {
				status: 'dropped',
				label: 'Dropped Out',
				color: 'bg-slate-100 text-slate-500 border-slate-300',
				description: 'Minimal participation, likely dropped out'
			}
		}

		// 4. NEEDS ATTENTION - Only for genuine red flags
		// Case A: High level but no exam validation (potential cheating)
		if (level >= 5.0 && examsPassed === 0 && examsRegistered > 1) {
			return {
				status: 'needs-attention',
				label: 'Needs Attention',
				color: 'bg-red-100 text-red-600 border-red-300',
				description: 'High level without validated exams - investigate'
			}
		}

		// Case B: Extremely high level with minimal legitimate progress indicators
		if (level >= 6.0 && validatedProjects < 5 && totalInteractions < 10) {
			return {
				status: 'needs-attention',
				label: 'Needs Attention', 
				color: 'bg-red-100 text-red-600 border-red-300',
				description: 'Level inconsistent with project/peer metrics'
			}
		}

		// Case C: Final exam passed but very low level (grade manipulation?)
		if (finalExamValidated && level < 3.0 && validatedProjects < 8) {
			return {
				status: 'needs-attention',
				label: 'Needs Attention',
				color: 'bg-red-100 text-red-600 border-red-300',
				description: 'Final exam passed but low progress metrics'
			}
		}

		// 5. LEGITIMATE PERFORMANCE CLASSIFICATIONS
		// Check for poor peer behavior (but still legitimate students)
		const isPoorPeer = (reviewsGiven < Math.max(reviewsReceived * 0.3, 1)) && reviewsReceived > 10
		const isVoteHoarder = (votesGiven < Math.max(votesReceived * 0.25, 1)) && votesReceived > 15

		// EXCELLENT: Top tier students (Level 4.5+, strong metrics across the board)
		if (level >= 4.5 && validatedProjects >= 12 && (performance >= 3 || communication >= 3)) {
			// Check if rush performance supports excellent status
			const rushSupportsExcellent = rushParticipation === 0 || rushSuccessRate >= 0.6 || rushPerformance >= 70
			
			if (!rushSupportsExcellent && rushParticipation > 0) {
				return {
					status: 'needs-attention',
					label: 'Needs Attention',
					color: 'bg-red-100 text-red-600 border-red-300',
					description: 'High level but poor rush performance'
				}
			}

			if (isPoorPeer || isVoteHoarder) {
				return {
					status: 'excellent-selfish',
					label: 'Excellent (Selfish)',
					color: 'bg-amber-100 text-amber-800 border-amber-300',
					description: 'Excellent student but could help peers more'
				}
			}
			return {
				status: 'excellent',
				label: 'Excellent',
				color: 'bg-green-100 text-green-800 border-green-300',
				description: 'Outstanding performance and collaborative'
			}
		}

		// GOOD: Solid performers (Level 3.0+, good progress)
		if (level >= 3.0 && validatedProjects >= 8 && examSuccessRate >= 0.5) {
			// Factor in rush performance for good students
			const rushPerformanceCheck = rushParticipation === 0 || rushSuccessRate >= 0.4 || rushPerformance >= 60
			
			if (isPoorPeer || isVoteHoarder) {
				return {
					status: 'good-selfish',
					label: 'Good (Selfish)',
					color: 'bg-orange-100 text-orange-800 border-orange-300',
					description: `Good student but ${rushPerformanceCheck ? 'low peer engagement' : 'poor rush + peer performance'}`
				}
			}
			
			if (!rushPerformanceCheck && rushParticipation > 0) {
				return {
					status: 'struggling',
					label: 'Struggling',
					color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
					description: 'Good level progress but struggling with rush projects'
				}
			}
			
			return {
				status: 'good',
				label: 'Good',
				color: 'bg-blue-100 text-blue-800 border-blue-300',
				description: 'Good performance and team player'
			}
		}

		// AVERAGE: Middle tier students (Level 2.0+, reasonable progress)
		if (level >= 2.0 && (validatedProjects >= 4 || examsPassed >= 1 || rushValidated >= 1)) {
			return {
				status: 'average',
				label: 'Average',
				color: 'bg-slate-100 text-slate-700 border-slate-300',
				description: 'Steady progress, meeting expectations'
			}
		}

		// STRUGGLING: Students who are trying but facing challenges
		if (level >= 1.0 && (totalInteractions >= 15 || examsRegistered >= 2 || rushTotal >= 1)) {
			return {
				status: 'struggling',
				label: 'Struggling',
				color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
				description: 'Active participation but needs improvement'
			}
		}

		// BEGINNER: New or very early students with minimal data
		if (level < 2.0 && validatedProjects < 3) {
			return {
				status: 'beginner',
				label: 'Beginner',
				color: 'bg-purple-100 text-purple-700 border-purple-300',
				description: 'Early in piscine journey'
			}
		}

		// INACTIVE: Students with very minimal engagement
		return {
			status: 'inactive-low',
			label: 'Low Activity',
			color: 'bg-gray-100 text-gray-600 border-gray-300',
			description: 'Very low engagement and progress'
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

		// Status filter - updated to handle new categories
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
					case "struggling":
						return studentStatus.status === 'struggling'
					case "beginner":
						return studentStatus.status === 'beginner'
					case "inactive":
						return studentStatus.status === 'inactive' || studentStatus.status === 'inactive-low'
					case "dropped":
						return studentStatus.status === 'dropped'
					case "blocked":
						return studentStatus.status === 'blocked'
					case "needs-attention":
						return studentStatus.status === 'needs-attention'
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
								<Button onClick={refreshStudents} className="flex items-center gap-2">
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
				<div className="flex gap-2 items-center">
					{!isLoading && students.length > 0 && isDataStale() && (
						<Badge variant="outline" className="text-xs">
							Cached Data
						</Badge>
					)}
					<Button variant="outline" onClick={refreshStudents} className="flex items-center gap-2">
						<RefreshCw className="h-4 w-4" />
						Refresh
					</Button>
					<Button onClick={exportData} className="flex items-center gap-2">
						<Download className="h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-6">
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
						<CardTitle className="text-sm font-medium">Good</CardTitle>
						<Badge className="bg-blue-100 text-blue-800 border-blue-200">✓</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => ['good', 'good-selfish'].includes(getStudentStatus(s).status)).length}
						</div>
						<p className="text-xs text-muted-foreground">Solid progress</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average</CardTitle>
						<Badge className="bg-slate-100 text-slate-700 border-slate-200">📊</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => getStudentStatus(s).status === 'average').length}
						</div>
						<p className="text-xs text-muted-foreground">Meeting expectations</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Struggling</CardTitle>
						<Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">⚡</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => getStudentStatus(s).status === 'struggling').length}
						</div>
						<p className="text-xs text-muted-foreground">Need support</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Needs Review</CardTitle>
						<Badge className="bg-red-100 text-red-600 border-red-200">⚠️</Badge>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{students.filter((s) => ['needs-attention', 'blocked'].includes(getStudentStatus(s).status)).length}
						</div>
						<p className="text-xs text-muted-foreground">Requires attention</p>
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
									<SelectItem value="struggling">Struggling</SelectItem>
									<SelectItem value="beginner">Beginner</SelectItem>
									<SelectItem value="dropped">Dropped Out</SelectItem>
									<SelectItem value="blocked">Blocked</SelectItem>
									<SelectItem value="needs-attention">Needs Attention</SelectItem>
									<SelectItem value="poor-peer">Poor Peers</SelectItem>
									<SelectItem value="inactive">Inactive/Low Activity</SelectItem>
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
