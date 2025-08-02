// components/student-table.tsx
"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, MessageSquare, Award, Mail, User, Plus, Calendar, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Student {
	id?: string
	uuid: string
	login: string
	firstName: string
	lastName: string
	email: string
	profileImageUrl?: string
	phone?: string
	campus: string
	cursus: string
	level: number
	wallet: number
	correctionPoint: number
	location: string
	// Enhanced fields
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
	}>
	hasExamData?: boolean
	hasRushData?: boolean
	created_at?: string
	updated_at?: string
}

interface Note {
	id: string
	title: string
	content: string
	category: string
	priority: string
	author: string
	created_at: string
}

interface StudentTableProps {
	students: Student[]
}

const categories = [
	{ value: "performance", label: "Performance", color: "bg-blue-100 text-blue-800" },
	{ value: "teamwork", label: "Teamwork", color: "bg-green-100 text-green-800" },
	{ value: "evaluation", label: "Evaluation", color: "bg-purple-100 text-purple-800" },
	{ value: "support", label: "Support", color: "bg-orange-100 text-orange-800" },
	{ value: "behavior", label: "Behavior", color: "bg-pink-100 text-pink-800" },
	{ value: "technical", label: "Technical", color: "bg-red-100 text-red-800" },
	{ value: "communication", label: "Communication", color: "bg-yellow-100 text-yellow-800" },
]

const priorities = [
	{ value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
	{ value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
	{ value: "high", label: "High", color: "bg-red-100 text-red-800" },
]

export function StudentTable({ students }: StudentTableProps) {
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
	const [showStudentDetail, setShowStudentDetail] = useState(false)
	const [showAddNote, setShowAddNote] = useState(false)
	const [notes, setNotes] = useState<Note[]>([])
	const [loadingNotes, setLoadingNotes] = useState(false)
	const [creatingNote, setCreatingNote] = useState(false)
	const [newNote, setNewNote] = useState({
		title: "",
		content: "",
		category: "performance",
		priority: "normal",
	})

	// Helper functions
	const getBestRushRating = (student: Student) => {
		return student.rushRating || 0
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

	const getStatusBadge = (student: Student) => {
		const studentStatus = getStudentStatus(student)
		return (
			<Badge className={studentStatus.color} title={studentStatus.description}>
				{studentStatus.label}
			</Badge>
		)
	}

	const getRushRatingBadge = (rating: number) => {
		if (rating === 4) {
			return <Badge className="bg-green-100 text-green-800">Excellent (4)</Badge>
		} else if (rating === 3) {
			return <Badge className="bg-blue-100 text-blue-800">Good (3)</Badge>
		} else if (rating === 2) {
			return <Badge className="bg-yellow-100 text-yellow-800">Average (2)</Badge>
		} else if (rating === 1) {
			return <Badge className="bg-red-100 text-red-800">Needs Improvement (1)</Badge>
		} else {
			return <Badge variant="outline">No Rating</Badge>
		}
	}

	const getInitials = (name: string) => {
		if (!name || name === 'N/A' || name === 'Unknown Student') {
			return '?'
		}

		const cleanName = name.replace(/<[^>]*>/g, '').trim()
		if (!cleanName) return '?'

		return cleanName
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	const getCompletedExercises = (student: Student) => {
		if (!student.grades || typeof student.grades !== "object") {
			return "0/0"
		}

		const completed = Object.values(student.grades).filter((grade) => grade && grade.status === "finished").length
		const total = Object.keys(student.grades).length
		return `${completed}/${total}`
	}

	// Fetch notes for selected student
	const fetchStudentNotes = async (studentUuid: string) => {
		if (!studentUuid) {
			console.error('No student UUID provided')
			return
		}

		try {
			setLoadingNotes(true)
			console.log('Fetching notes for student:', studentUuid)

			const response = await fetch(`/api/notes?student_id=${encodeURIComponent(studentUuid)}`)

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()
			console.log('Notes response:', data)

			const studentNotes = data.notes || []
			setNotes(studentNotes)

		} catch (error) {
			console.error('Error fetching student notes:', error)
			toast.error('Failed to load notes')
			setNotes([])
		} finally {
			setLoadingNotes(false)
		}
	}

	// Create new note
	const handleCreateNote = async () => {
		if (!selectedStudent?.uuid || !newNote.title.trim() || !newNote.content.trim()) {
			toast.error('Please fill in all required fields')
			return
		}

		try {
			setCreatingNote(true)
			console.log('Creating note for student:', selectedStudent.uuid)

			const response = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					student_id: selectedStudent.uuid,
					title: newNote.title.trim(),
					content: newNote.content.trim(),
					category: newNote.category,
					priority: newNote.priority,
				}),
			})

			console.log('Response status:', response.status)

			const responseText = await response.text()
			console.log('Raw response:', responseText)

			if (!response.ok) {
				let errorMessage = `HTTP error! status: ${response.status}`
				try {
					const errorData = JSON.parse(responseText)
					console.error('Parsed error data:', errorData)
					errorMessage = errorData.error || errorData.details || errorData.message || errorMessage
				} catch (parseError) {
					console.error('Could not parse error response:', parseError)
					errorMessage = responseText || errorMessage
				}
				throw new Error(errorMessage)
			}

			let data
			try {
				data = JSON.parse(responseText)
			} catch (parseError) {
				console.error('Could not parse success response:', parseError)
				throw new Error('Invalid response format')
			}

			console.log('Note created successfully:', data)

			if (data.note) {
				setNotes(prevNotes => [data.note, ...prevNotes])
			}

			setNewNote({
				title: "",
				content: "",
				category: "performance",
				priority: "normal",
			})

			setShowAddNote(false)
			toast.success('Note created successfully')

		} catch (error) {
			console.error('Error creating note:', error)
			const errorMessage = error instanceof Error ? error.message : 'Failed to create note'
			toast.error(errorMessage)
		} finally {
			setCreatingNote(false)
		}
	}

	const handleViewStudent = (student: Student) => {
		console.log('Viewing student:', student.uuid, student.firstName)
		setSelectedStudent(student)
		setNotes([])
		setShowStudentDetail(true)
		fetchStudentNotes(student.uuid)
	}

	const handleAddNoteClick = (student: Student) => {
		console.log('Adding note for student:', student.uuid, student.firstName)
		setSelectedStudent(student)
		setNewNote({
			title: "",
			content: "",
			category: "performance",
			priority: "normal",
		})
		setShowAddNote(true)
	}

	const handleAddNoteFromDetail = () => {
		if (!selectedStudent) return
		console.log('Adding note from detail for student:', selectedStudent.uuid)
		setNewNote({
			title: "",
			content: "",
			category: "performance",
			priority: "normal",
		})
		setShowAddNote(true)
	}

	const handleStudentDetailClose = (open: boolean) => {
		setShowStudentDetail(open)
		if (!open) {
			setSelectedStudent(null)
			setNotes([])
		}
	}

	const handleAddNoteClose = (open: boolean) => {
		setShowAddNote(open)
		if (!open) {
			setNewNote({
				title: "",
				content: "",
				category: "performance",
				priority: "normal",
			})
		}
	}

	const getCategoryBadge = (category: string) => {
		const categoryInfo = categories.find((c) => c.value === category)
		return (
			<Badge className={categoryInfo?.color} variant="outline" className="text-xs">
				{categoryInfo?.label}
			</Badge>
		)
	}

	const getPriorityBadge = (priority: string) => {
		const priorityInfo = priorities.find((p) => p.value === priority)
		return (
			<Badge className={priorityInfo?.color} variant="outline" className="text-xs">
				{priorityInfo?.label}
			</Badge>
		)
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	return (
		<>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Student</TableHead>
							<TableHead>Level</TableHead>
							<TableHead>Performance</TableHead>
							<TableHead>Exercises</TableHead>
							<TableHead>Avg Grade</TableHead>
							<TableHead>Rush Rating</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{students.map((student) => {
							const avgGrade = getAverageGrade(student)
							const studentName = student.firstName || student.login || 'Unknown Student'
							const imageUrl = student.profileImageUrl && student.profileImageUrl.trim() !== '' ? student.profileImageUrl : null
							const studentStatus = getStudentStatus(student)

							return (
								<TableRow
									key={student.uuid}
									className={`border-l-4 ${studentStatus.color.includes('bg-green') ? 'border-l-green-400' :
											studentStatus.color.includes('bg-red') ? 'border-l-red-400' :
												studentStatus.color.includes('bg-yellow') ? 'border-l-yellow-400' :
													studentStatus.color.includes('bg-blue') ? 'border-l-blue-400' :
														studentStatus.color.includes('bg-orange') ? 'border-l-orange-400' :
															'border-l-gray-400'
										}`}
								>
									<TableCell>
										<div className="flex items-center space-x-3">
											<Avatar className="h-10 w-10">
												{imageUrl ? (
													<AvatarImage
														src={imageUrl}
														alt={studentName}
														className="object-cover"
														onError={(e) => {
															console.log('❌ Image failed to load:', imageUrl)
															e.currentTarget.style.display = 'none'
														}}
														onLoad={() => {
															console.log('✅ Image loaded successfully:', imageUrl)
														}}
													/>
												) : null}
												<AvatarFallback className="bg-muted text-muted-foreground">
													{getInitials(studentName)}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">{studentName}</div>
												<div className="text-sm text-muted-foreground">{student.login}</div>
												<div className="text-xs text-muted-foreground">{student.email}</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">
											{student.level > 0 ? student.level.toFixed(2) : '0.00'}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col space-y-1">
											<div className="text-sm font-medium">
												{student.performance || 0}%
											</div>
											<div className="flex space-x-1">
												<div className="text-xs text-muted-foreground">
													C: {student.communication || 0}
												</div>
												<div className="text-xs text-muted-foreground">
													P: {student.professionalism || 0}
												</div>
											</div>
											<div className="flex space-x-1">
												<div className="text-xs text-muted-foreground">
													R: {student.reviewer || 0}/{student.reviewee || 0}
												</div>
												<div className="text-xs text-muted-foreground">
													V: {student.votes_given || 0}/{student.votes_received || 0}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<span className="text-sm">{getCompletedExercises(student)}</span>
											<Badge variant="outline" className="text-xs">
												{student.location !== "unavailable" ? "Active" : "Inactive"}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										<div className="font-medium">
											{avgGrade || '0'}
										</div>
									</TableCell>
									<TableCell>
										{getRushRatingBadge(getBestRushRating(student))}
									</TableCell>
									<TableCell>
										{getStatusBadge(student)}
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewStudent(student)}
												title="View Student Details"
											>
												<Eye className="h-4 w-4" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleAddNoteClick(student)}
												title="Add Note"
											>
												<MessageSquare className="h-4 w-4" />
											</Button>

											<Button variant="ghost" size="sm" title="Rush Evaluation">
												<Award className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			{students.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					No students found.
				</div>
			)}

			{/* Student Detail Dialog */}
			<Dialog open={showStudentDetail} onOpenChange={handleStudentDetailClose}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Avatar className="h-10 w-10">
								{selectedStudent?.profileImageUrl && selectedStudent.profileImageUrl.trim() !== '' ? (
									<AvatarImage
										src={selectedStudent.profileImageUrl}
										alt={selectedStudent.firstName}
										className="object-cover"
										onError={(e) => {
											console.log('❌ Dialog image failed to load:', selectedStudent.profileImageUrl)
											e.currentTarget.style.display = 'none'
										}}
									/>
								) : null}
								<AvatarFallback>{getInitials(selectedStudent?.firstName || "")}</AvatarFallback>
							</Avatar>
							{selectedStudent?.firstName} ({selectedStudent?.uuid})
						</DialogTitle>
					</DialogHeader>

					{selectedStudent && (
						<div className="grid gap-6 py-4">
							<div className="grid gap-6 md:grid-cols-2">
								{/* Enhanced Student Information */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<User className="h-5 w-5" />
											Student Information
										</CardTitle>
									</CardHeader>
									<CardContent className="grid gap-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium">Username</label>
												<p className="text-sm text-muted-foreground">{selectedStudent.login}</p>
											</div>
											<div>
												<label className="text-sm font-medium">Email</label>
												<div className="flex items-center gap-2">
													<Mail className="h-4 w-4" />
													<p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
												</div>
											</div>
											<div>
												<label className="text-sm font-medium">Level</label>
												<p className="text-lg font-semibold">{selectedStudent.level.toFixed(2)}</p>
											</div>
											<div>
												<label className="text-sm font-medium">Location</label>
												<p className="text-sm text-muted-foreground">{selectedStudent.location}</p>
											</div>
											<div>
												<label className="text-sm font-medium">Age</label>
												<p className="text-sm text-muted-foreground">{selectedStudent.age || 'N/A'}</p>
											</div>
											<div>
												<label className="text-sm font-medium">Gender</label>
												<p className="text-sm text-muted-foreground">{selectedStudent.gender || 'N/A'}</p>
											</div>
											<div>
												<label className="text-sm font-medium">Coding Level</label>
												<p className="text-sm text-muted-foreground">{selectedStudent.coding_level || 'N/A'}</p>
											</div>
											<div>
												<label className="text-sm font-medium">Blocks</label>
												<p className="text-sm text-muted-foreground">{selectedStudent.blocks || 0}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Student Notes */}
								<Card>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle className="flex items-center gap-2">
												<MessageSquare className="h-5 w-5" />
												Notes ({notes.length})
											</CardTitle>
											<Button
												size="sm"
												onClick={handleAddNoteFromDetail}
												className="flex items-center gap-1"
											>
												<Plus className="h-3 w-3" />
												Add Note
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[300px]">
											{loadingNotes ? (
												<div className="text-center text-muted-foreground">
													<Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
													Loading notes...
												</div>
											) : notes.length === 0 ? (
												<div className="text-center text-muted-foreground">
													<MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
													<p className="text-sm">No notes yet</p>
													<p className="text-xs">Add the first note about this student</p>
												</div>
											) : (
												<div className="space-y-3">
													{notes.map((note) => (
														<div key={note.id} className="p-3 border rounded-lg">
															<div className="flex items-start justify-between mb-2">
																<h4 className="text-sm font-medium">{note.title}</h4>
																<div className="flex items-center gap-1">
																	{getCategoryBadge(note.category)}
																	{getPriorityBadge(note.priority)}
																</div>
															</div>
															<p className="text-xs text-muted-foreground mb-2">{note.content}</p>
															<div className="flex items-center justify-between text-xs text-muted-foreground">
																<span>By {note.author}</span>
																<span>{formatDate(note.created_at)}</span>
															</div>
														</div>
													))}
												</div>
											)}
										</ScrollArea>
									</CardContent>
								</Card>
							</div>

							{/* Exam Grades */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Award className="h-5 w-5" />
										Exam Performance
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
										<div className="text-center p-4 border rounded-lg">
											<div className="text-2xl font-bold">
												{selectedStudent.grades?.['exam00']?.grade || '0'}
											</div>
											<div className="text-sm text-muted-foreground">Exam 00</div>
											<div className="mt-1">
												<Badge variant={selectedStudent.grades?.['exam00']?.grade > 0 ? "default" : "outline"}>
													{selectedStudent.grades?.['exam00']?.grade > 0 ? 'Completed' : 'Not Done'}
												</Badge>
											</div>
										</div>

										<div className="text-center p-4 border rounded-lg">
											<div className="text-2xl font-bold">
												{selectedStudent.grades?.['exam01']?.grade || '0'}
											</div>
											<div className="text-sm text-muted-foreground">Exam 01</div>
											<div className="mt-1">
												<Badge variant={selectedStudent.grades?.['exam01']?.grade > 0 ? "default" : "outline"}>
													{selectedStudent.grades?.['exam01']?.grade > 0 ? 'Completed' : 'Not Done'}
												</Badge>
											</div>
										</div>

										<div className="text-center p-4 border rounded-lg">
											<div className="text-2xl font-bold">
												{selectedStudent.grades?.['exam02']?.grade || '0'}
											</div>
											<div className="text-sm text-muted-foreground">Exam 02</div>
											<div className="mt-1">
												<Badge variant={selectedStudent.grades?.['exam02']?.grade > 0 ? "default" : "outline"}>
													{selectedStudent.grades?.['exam02']?.grade > 0 ? 'Completed' : 'Not Done'}
												</Badge>
											</div>
										</div>

										<div className="text-center p-4 border rounded-lg">
											<div className="text-2xl font-bold">
												{selectedStudent.grades?.['final_exam']?.grade || '0'}
											</div>
											<div className="text-sm text-muted-foreground">Final Exam</div>
											<div className="mt-1">
												<Badge variant={selectedStudent.grades?.['final_exam']?.grade > 0 ? "default" : "outline"}>
													{selectedStudent.grades?.['final_exam']?.grade > 0 ? 'Completed' : 'Not Done'}
												</Badge>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Enhanced Performance Metrics */}
							<Card>
								<CardHeader>
									<CardTitle>Detailed Performance Metrics</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium">Average Grade</span>
												<span className="text-sm">{getAverageGrade(selectedStudent)}%</span>
											</div>
											<Progress value={getAverageGrade(selectedStudent)} />
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium">Level Progress</span>
												<span className="text-sm">{Math.round((selectedStudent.level / 5) * 100)}%</span>
											</div>
											<Progress value={(selectedStudent.level / 5) * 100} />
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium">Performance</span>
												<span className="text-sm">{selectedStudent.performance || 0}%</span>
											</div>
											<Progress value={selectedStudent.performance || 0} />
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium">Communication</span>
												<span className="text-sm">{selectedStudent.communication || 0}%</span>
											</div>
											<Progress value={selectedStudent.communication || 0} />
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium">Professionalism</span>
												<span className="text-sm">{selectedStudent.professionalism || 0}%</span>
											</div>
											<Progress value={selectedStudent.professionalism || 0} />
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-sm font-medium">Rush Rating</span>
												<span className="text-sm">{getBestRushRating(selectedStudent)}/4</span>
											</div>
											<Progress value={(getBestRushRating(selectedStudent) / 4) * 100} />
										</div>
									</div>

									{/* Additional Stats */}
									<div className="grid grid-cols-3 gap-4 mt-6">
										<div className="text-center p-3 border rounded-lg">
											<div className="text-lg font-bold">{selectedStudent.votes_given || 0}</div>
											<div className="text-xs text-muted-foreground">Votes Given</div>
										</div>
										<div className="text-center p-3 border rounded-lg">
											<div className="text-lg font-bold">{selectedStudent.votes_received || 0}</div>
											<div className="text-xs text-muted-foreground">Votes Received</div>
										</div>
										<div className="text-center p-3 border rounded-lg">
											<div className="text-lg font-bold">{selectedStudent.feedbacks_received || 0}</div>
											<div className="text-xs text-muted-foreground">Feedbacks</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Add Note Dialog */}
			<Dialog open={showAddNote} onOpenChange={handleAddNoteClose}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Add Note for {selectedStudent?.firstName}</DialogTitle>
						<DialogDescription>
							Creating note for: {selectedStudent?.firstName} ({selectedStudent?.uuid})
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								value={newNote.title}
								onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
								placeholder="Enter note title..."
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select
									value={newNote.category}
									onValueChange={(value) => setNewNote({ ...newNote, category: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{categories.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={newNote.priority}
									onValueChange={(value) => setNewNote({ ...newNote, priority: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{priorities.map((priority) => (
											<SelectItem key={priority.value} value={priority.value}>
												{priority.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="content">Note Content *</Label>
							<Textarea
								id="content"
								value={newNote.content}
								onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
								placeholder="Enter your note content..."
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowAddNote(false)} disabled={creatingNote}>
							Cancel
						</Button>
						<Button
							onClick={handleCreateNote}
							disabled={!newNote.title.trim() || !newNote.content.trim() || creatingNote}
						>
							{creatingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Add Note
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
