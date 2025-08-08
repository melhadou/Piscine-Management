"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Trophy, MessageSquare, Edit, Search, Plus, Check, X, Loader2, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const rushProjects = [
	{
		id: "square",
		name: "Square",
		description: "Basic geometric calculations and display",
		icon: "🟨",
		color: "bg-yellow-50 border-yellow-200"
	},
	{
		id: "sky-scraper",
		name: "Sky Scraper",
		description: "Complex puzzle solving with constraints",
		icon: "🏗️",
		color: "bg-blue-50 border-blue-200"
	},
	{
		id: "rosetta-stone",
		name: "Rosetta Stone",
		description: "Multi-language translation system",
		icon: "🗿",
		color: "bg-stone-50 border-stone-200"
	},
]

const rushStatusOptions = [
	{ value: "pending", label: "Pending Evaluation", color: "bg-gray-100 text-gray-800", icon: "⏳" },
	{ value: "success", label: "Successful Completion", color: "bg-green-100 text-green-800", icon: "✅" },
	{ value: "failed", label: "Failed - Needs Improvement", color: "bg-red-100 text-red-800", icon: "❌" },
	{ value: "absent", label: "Absent - Did Not Attend", color: "bg-orange-100 text-orange-800", icon: "🚫" },
]

interface Student {
	uuid: string
	firstName: string
	lastName: string
	login: string
	name?: string
	username?: string
	email?: string
	level?: number
	coding_level?: string
	profileImageUrl?: string | null
}

interface RushNote {
	id: string
	student_id: string
	title: string
	content: string
	author: string
	rush_project: string
	rush_status: string
	rush_score?: number
	created_at: string
	updated_at: string
	students?: Student
}

interface RushSummary {
	[project: string]: {
		total_students: number
		successful: number
		failed: number
		absent: number
		pending: number
		average_score: number
		students: Array<{
			uuid: string
			name: string
			username: string
			status: string
			score?: number
		}>
	}
}

export default function RushEvaluationPage() {
	const [students, setStudents] = useState<Student[]>([])
	const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
	const [selectedRush, setSelectedRush] = useState<string>(rushProjects[0].id)
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
	const [rushNotes, setRushNotes] = useState<RushNote[]>([])
	const [rushSummary, setRushSummary] = useState<RushSummary>({})
	
	// Search and selection states
	const [isSelectingStudent, setIsSelectingStudent] = useState(false)
	const [searchTerm, setSearchTerm] = useState("")
	
	// Note dialog states
	const [isAddingNote, setIsAddingNote] = useState(false)
	const [isEditingNote, setIsEditingNote] = useState(false)
	const [editingNote, setEditingNote] = useState<RushNote | null>(null)
	const [noteTitle, setNoteTitle] = useState("")
	const [noteContent, setNoteContent] = useState("")
	const [noteStatus, setNoteStatus] = useState("pending")
	const [noteScore, setNoteScore] = useState("")
	const [noteRushProject, setNoteRushProject] = useState("")
	
	// Loading and error states
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Refs for managing focus and selections
	const commandRef = useRef<HTMLInputElement>(null)

	// Helper function to get student display name
	const getStudentDisplayName = (student: Student) => {
		if (student.firstName && student.lastName) {
			return `${student.firstName} ${student.lastName}`
		}
		return student.name || student.username || student.login || 'Unknown Student'
	}

	// Helper function to get student username/login
	const getStudentUsername = (student: Student) => {
		return student.username || student.login || 'unknown'
	}

	// Fetch data on component mount
	useEffect(() => {
		fetchStudents()
		fetchRushNotes()
		fetchRushSummary()
	}, [])

	// Filter students when search term changes
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredStudents(students)
		} else {
			const filtered = students.filter(
				(student) =>
					getStudentDisplayName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
					getStudentUsername(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
					(student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
			)
			setFilteredStudents(filtered)
		}
	}, [students, searchTerm])

	// Re-fetch rush notes when selected rush project changes
	useEffect(() => {
		if (selectedRush) {
			fetchRushNotes()
		}
	}, [selectedRush])

	const fetchStudents = async () => {
		try {
			const response = await fetch('/api/students')
			if (!response.ok) throw new Error('Failed to fetch students')
			
			const data = await response.json()
			if (data.success && data.students) {
				setStudents(data.students)
				setFilteredStudents(data.students)
			}
		} catch (error) {
			console.error('Error fetching students:', error)
			setError('Failed to load students')
		} finally {
			setLoading(false)
		}
	}

	const fetchRushNotes = async () => {
		try {
			const response = await fetch(`/api/rush-notes?project=${selectedRush}`)
			if (!response.ok) throw new Error('Failed to fetch rush notes')
			
			const data = await response.json()
			if (data.success) {
				setRushNotes(data.notes || [])
			}
		} catch (error) {
			console.error('Error fetching rush notes:', error)
		}
	}

	const fetchRushSummary = async () => {
		try {
			const response = await fetch('/api/rush-summary')
			if (!response.ok) throw new Error('Failed to fetch rush summary')
			
			const data = await response.json()
			if (data.success) {
				setRushSummary(data.summary || {})
			}
		} catch (error) {
			console.error('Error fetching rush summary:', error)
		}
	}

	const handleStudentSelect = (student: Student) => {
		setSelectedStudent(student)
		setSearchTerm("")
		setIsSelectingStudent(false)
	}

	const handleAddNote = () => {
		if (!selectedStudent) {
			setError("Please select a student first")
			return
		}

		setNoteTitle("")
		setNoteContent("")
		setNoteStatus("pending")
		setNoteScore("")
		setNoteRushProject(selectedRush)
		setIsAddingNote(true)
	}

	const handleEditNote = (note: RushNote) => {
		setEditingNote(note)
		setNoteTitle(note.title)
		setNoteContent(note.content)
		setNoteStatus(note.rush_status)
		setNoteScore(note.rush_score?.toString() || "")
		setIsEditingNote(true)
	}

	const handleSaveNote = async () => {
		if (!selectedStudent || !noteTitle.trim() || !noteContent.trim()) {
			setError("Please fill in all required fields")
			return
		}

		setSaving(true)
		setError(null)

		try {
			const noteData = {
				student_id: selectedStudent.uuid,
				title: noteTitle.trim(),
				content: noteContent.trim(),
				category: 'rush',
				priority: 'Medium',
				author: 'System',
				rush_project: noteRushProject || selectedRush,
				rush_status: noteStatus,
				rush_score: noteScore ? parseInt(noteScore) : null,
			}

			const response = await fetch('/api/rush-notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(noteData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to save note')
			}

			const data = await response.json()

			setRushNotes(prev => [data.rushNote, ...prev])
			setIsAddingNote(false)
			setNoteTitle("")
			setNoteContent("")
			setNoteStatus("pending")
			setNoteScore("")

			fetchRushSummary()
		} catch (error) {
			console.error('Error saving rush note:', error)
			setError(error instanceof Error ? error.message : 'Failed to save note')
		} finally {
			setSaving(false)
		}
	}

	const handleUpdateNote = async () => {
		if (!editingNote || !noteTitle.trim() || !noteContent.trim()) {
			setError("Please fill in all required fields")
			return
		}

		setSaving(true)
		setError(null)

		try {
			const updateData = {
				title: noteTitle.trim(),
				content: noteContent.trim(),
				rush_status: noteStatus,
				rush_score: noteScore ? parseInt(noteScore) : null,
			}

			const response = await fetch(`/api/rush-notes/${editingNote.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updateData),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to update note')
			}

			const data = await response.json()

			setRushNotes(prev =>
				prev.map(note =>
					note.id === editingNote.id ? data.rushNote : note
				)
			)

			setIsEditingNote(false)
			setEditingNote(null)
			setNoteTitle("")
			setNoteContent("")
			setNoteStatus("pending")
			setNoteScore("")

			fetchRushSummary()
		} catch (error) {
			console.error('Error updating rush note:', error)
			setError(error instanceof Error ? error.message : 'Failed to update note')
		} finally {
			setSaving(false)
		}
	}

	const handleDeleteNote = async (noteId: string) => {
		if (!confirm('Are you sure you want to delete this rush note?')) return

		try {
			const response = await fetch(`/api/rush-notes/${noteId}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to delete note')
			}

			setRushNotes(prev => prev.filter(note => note.id !== noteId))
			fetchRushSummary()
		} catch (error) {
			console.error('Error deleting rush note:', error)
			setError(error instanceof Error ? error.message : 'Failed to delete note')
		}
	}

	const getStatusBadge = (status: string) => {
		const statusOption = rushStatusOptions.find(option => option.value === status)
		if (!statusOption) return null

		return (
			<Badge className={statusOption.color}>
				{statusOption.icon} {statusOption.label}
			</Badge>
		)
	}

	const getSelectedProject = () => {
		return rushProjects.find(project => project.id === selectedRush) || rushProjects[0]
	}

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin" />
					<span className="ml-2">Loading rush evaluation data...</span>
				</div>
			</div>
		)
	}

	const selectedProject = getSelectedProject()
	const projectSummary = rushSummary[selectedRush] || {
		total_students: 0,
		successful: 0,
		failed: 0,
		absent: 0,
		pending: 0,
		average_score: 0,
		students: []
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Rush Evaluation</h1>
					<p className="text-muted-foreground">Evaluate student performance in rush projects</p>
				</div>
				<div className="flex items-center gap-4">
					<Select value={selectedRush} onValueChange={setSelectedRush}>
						<SelectTrigger className="w-[200px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{rushProjects.map((project) => (
								<SelectItem key={project.id} value={project.id}>
									<div className="flex items-center gap-2">
										<span>{project.icon}</span>
										<span>{project.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button onClick={handleAddNote} className="gap-2">
						<Plus className="h-4 w-4" />
						Add Evaluation
					</Button>
				</div>
			</div>

			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-2 text-red-800">
							<AlertCircle className="h-4 w-4" />
							<span>{error}</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setError(null)}
								className="ml-auto"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Current Rush Project Overview */}
			<Card className={selectedProject.color}>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="text-3xl">{selectedProject.icon}</div>
							<div>
								<CardTitle className="text-xl">{selectedProject.name}</CardTitle>
								<CardDescription>{selectedProject.description}</CardDescription>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="gap-1">
								<Trophy className="h-3 w-3" />
								Avg Score: {projectSummary.average_score.toFixed(1)}
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">{projectSummary.total_students}</div>
							<div className="text-sm text-muted-foreground">Total Students</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">{projectSummary.successful}</div>
							<div className="text-sm text-muted-foreground">Successful</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-red-600">{projectSummary.failed}</div>
							<div className="text-sm text-muted-foreground">Failed</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">{projectSummary.absent}</div>
							<div className="text-sm text-muted-foreground">Absent</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-gray-600">{projectSummary.pending}</div>
							<div className="text-sm text-muted-foreground">Pending</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Student Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Student Selection</CardTitle>
					<CardDescription>Select a student to add or view evaluations</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Popover open={isSelectingStudent} onOpenChange={setIsSelectingStudent}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={isSelectingStudent}
									className="justify-between w-full"
								>
									{selectedStudent ? (
										<div className="flex items-center gap-2">
											<Avatar className="h-6 w-6">
												<AvatarImage src={selectedStudent.profileImageUrl || ""} />
												<AvatarFallback>
													{getStudentDisplayName(selectedStudent).charAt(0) || "?"}
												</AvatarFallback>
											</Avatar>
											<span>{getStudentDisplayName(selectedStudent)}</span>
											<Badge variant="secondary" className="ml-2">
												Level {selectedStudent.level?.toFixed(1) || "0.0"}
											</Badge>
										</div>
									) : (
										<span className="text-muted-foreground">Select a student...</span>
									)}
									<Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<Command>
									<CommandInput
										ref={commandRef}
										placeholder="Search students..."
										value={searchTerm}
										onValueChange={setSearchTerm}
									/>
									<CommandList>
										<CommandEmpty>No students found.</CommandEmpty>
										<CommandGroup>
											{filteredStudents.map((student) => (
												<CommandItem
													key={student.uuid}
													value={`${getStudentDisplayName(student)} ${getStudentUsername(student)}`}
													onSelect={() => handleStudentSelect(student)}
												>
													<div className="flex items-center gap-2 w-full">
														<Avatar className="h-6 w-6">
															<AvatarImage src={student.profileImageUrl || ""} />
															<AvatarFallback>
																{getStudentDisplayName(student).charAt(0) || "?"}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="font-medium">{getStudentDisplayName(student)}</div>
															<div className="text-sm text-muted-foreground">@{getStudentUsername(student)}</div>
														</div>
														<Badge variant="outline">Level {student.level?.toFixed(1) || "0.0"}</Badge>
														{selectedStudent?.uuid === student.uuid && (
															<Check className="h-4 w-4 text-primary" />
														)}
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>
				</CardContent>
			</Card>

			{/* Rush Notes */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Rush Evaluations ({rushNotes.length})
					</CardTitle>
					<CardDescription>View and manage student evaluations for {selectedProject.name}</CardDescription>
				</CardHeader>
				<CardContent>
					{rushNotes.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>No evaluations yet for {selectedProject.name}</p>
							<p className="text-sm">Select a student and add your first evaluation</p>
						</div>
					) : (
						<div className="space-y-4">
							{rushNotes.map((note) => (
								<Card key={note.id} className="border-l-4 border-l-blue-500">
									<CardContent className="pt-4">
										<div className="flex items-start justify-between">
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2 flex-wrap">
													<h4 className="font-semibold">{note.title}</h4>
													{getStatusBadge(note.rush_status)}
													{note.rush_score !== null && (
														<Badge variant="outline" className="gap-1">
															<Trophy className="h-3 w-3" />
															{note.rush_score}/100
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													{note.students && (
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarImage src={note.students.profileImageUrl || ""} />
																<AvatarFallback>
																	{getStudentDisplayName(note.students).charAt(0) || "?"}
																</AvatarFallback>
															</Avatar>
															<span>{getStudentDisplayName(note.students)}</span>
														</div>
													)}
													<span>•</span>
													<span>{new Date(note.created_at).toLocaleDateString()}</span>
													<span>•</span>
													<span>by {note.author}</span>
												</div>
												<p className="text-sm leading-relaxed">{note.content}</p>
											</div>
											<div className="flex items-center gap-2 ml-4">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditNote(note)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteNote(note.id)}
													className="text-red-600 hover:text-red-700"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Note Dialog */}
			<Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Add Rush Evaluation</DialogTitle>
						<DialogDescription>
							Add evaluation for {selectedStudent ? getStudentDisplayName(selectedStudent) : 'selected student'} on {selectedProject.name}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="rush-project">Rush Project</Label>
							<Select value={noteRushProject} onValueChange={setNoteRushProject}>
								<SelectTrigger>
									<SelectValue placeholder="Select rush project" />
								</SelectTrigger>
								<SelectContent>
									{rushProjects.map((project) => (
										<SelectItem key={project.id} value={project.id}>
											<div className="flex items-center gap-2">
												<span>{project.icon}</span>
												<span>{project.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="note-title">Evaluation Title</Label>
							<Input
								id="note-title"
								value={noteTitle}
								onChange={(e) => setNoteTitle(e.target.value)}
								placeholder="Brief title for this evaluation..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="note-content">Evaluation Details</Label>
							<Textarea
								id="note-content"
								value={noteContent}
								onChange={(e) => setNoteContent(e.target.value)}
								placeholder="Detailed evaluation notes..."
								className="min-h-[100px]"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="note-status">Status</Label>
								<Select value={noteStatus} onValueChange={setNoteStatus}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{rushStatusOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.icon} {option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="note-score">Score (Optional)</Label>
								<Input
									id="note-score"
									type="number"
									min="0"
									max="100"
									value={noteScore}
									onChange={(e) => setNoteScore(e.target.value)}
									placeholder="0-100"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsAddingNote(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveNote} disabled={saving}>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save Evaluation'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Note Dialog */}
			<Dialog open={isEditingNote} onOpenChange={setIsEditingNote}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Edit Rush Evaluation</DialogTitle>
						<DialogDescription>
							Update evaluation details
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-note-title">Evaluation Title</Label>
							<Input
								id="edit-note-title"
								value={noteTitle}
								onChange={(e) => setNoteTitle(e.target.value)}
								placeholder="Brief title for this evaluation..."
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-note-content">Evaluation Details</Label>
							<Textarea
								id="edit-note-content"
								value={noteContent}
								onChange={(e) => setNoteContent(e.target.value)}
								placeholder="Detailed evaluation notes..."
								className="min-h-[100px]"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-note-status">Status</Label>
								<Select value={noteStatus} onValueChange={setNoteStatus}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{rushStatusOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.icon} {option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-note-score">Score (Optional)</Label>
								<Input
									id="edit-note-score"
									type="number"
									min="0"
									max="100"
									value={noteScore}
									onChange={(e) => setNoteScore(e.target.value)}
									placeholder="0-100"
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditingNote(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateNote} disabled={saving}>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								'Update Evaluation'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}