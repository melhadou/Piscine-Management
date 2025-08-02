"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
	DialogTrigger,
} from "@/components/ui/dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
	Search,
	Plus,
	MessageSquare,
	User,
	Calendar,
	Filter,
	Loader2,
	MoreHorizontal,
	Edit,
	Trash2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNotes } from "@/hooks/use-notes"
import { Note } from "@/types/database"

// Helper functions to clean HTML from student names and extract image URLs
const extractNameAndImageFromHtml = (htmlString: string): { name: string, imageUrl: string | null } => {
	if (!htmlString) return { name: 'Unknown Student', imageUrl: null }

	// If it contains HTML tags
	if (htmlString.includes('<') && htmlString.includes('>')) {
		// Extract image URL from href attribute
		let imageUrl = null
		const urlMatch = htmlString.match(/href="([^"]*)"/)
		if (urlMatch) {
			imageUrl = urlMatch[1]
		}

		// Extract text content between > and </a>
		const nameMatch = htmlString.match(/>([^<]+)<\/a>/)
		let cleanName = 'Unknown Student'
		if (nameMatch) {
			cleanName = nameMatch[1].trim()
		} else {
			// Fallback: remove all HTML tags
			cleanName = htmlString.replace(/<[^>]*>/g, '').trim() || 'Unknown Student'
		}

		return { name: cleanName, imageUrl }
	}

	// If no HTML, return as is
	return { name: htmlString.trim(), imageUrl: null }
}

const extractUsernameFromHtml = (htmlString: string): string => {
	if (!htmlString) return 'unknown'

	// If it contains HTML, try to extract from the original username field
	// or fallback to cleaning the name field
	return htmlString.replace(/<[^>]*>/g, '').trim().toLowerCase().replace(/\s+/g, '.') || 'unknown'
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

export default function NotesPage() {
	const {
		notes,
		students,
		loading,
		creating,
		fetchNotes,
		createNote,
		updateNote,
		deleteNote,
	} = useNotes()

	const [searchTerm, setSearchTerm] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("all")
	const [priorityFilter, setPriorityFilter] = useState("all")
	const [authorFilter, setAuthorFilter] = useState("all")
	const [isAddingNote, setIsAddingNote] = useState(false)
	const [editingNote, setEditingNote] = useState<Note | null>(null)
	const [newNote, setNewNote] = useState({
		student_id: "",
		title: "",
		content: "",
		category: "performance",
		priority: "normal",
	})

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchNotes({
				search: searchTerm || undefined,
				category: categoryFilter !== "all" ? categoryFilter : undefined,
				priority: priorityFilter !== "all" ? priorityFilter : undefined,
				author: authorFilter !== "all" ? authorFilter : undefined,
			})
		}, 300)

		return () => clearTimeout(timeoutId)
	}, [searchTerm, categoryFilter, priorityFilter, authorFilter, fetchNotes])

	const handleAddNote = async () => {
		if (!newNote.student_id || !newNote.title || !newNote.content) {
			return
		}

		const result = await createNote(newNote)
		if (result) {
			setNewNote({
				student_id: "",
				title: "",
				content: "",
				category: "performance",
				priority: "normal",
			})
			setIsAddingNote(false)
		}
	}

	const handleUpdateNote = async () => {
		if (!editingNote) return

		const result = await updateNote(editingNote.id, {
			title: editingNote.title,
			content: editingNote.content,
			category: editingNote.category,
			priority: editingNote.priority,
		})

		if (result) {
			setEditingNote(null)
		}
	}

	const handleDeleteNote = async (noteId: string) => {
		if (window.confirm('Are you sure you want to delete this note?')) {
			await deleteNote(noteId)
		}
	}

	const getCategoryBadge = (category: string) => {
		const categoryInfo = categories.find((c) => c.value === category)
		return (
			<Badge className={categoryInfo?.color} variant="outline">
				{categoryInfo?.label}
			</Badge>
		)
	}

	const getPriorityBadge = (priority: string) => {
		const priorityInfo = priorities.find((p) => p.value === priority)
		return (
			<Badge className={priorityInfo?.color} variant="outline">
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

	const uniqueAuthors = [...new Set(notes.map((note) => note.author))]

	return (
		<div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Student Notes</h2>
					<p className="text-muted-foreground">Track observations, feedback, and evaluations for piscine candidates</p>
				</div>
				<Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Add Note
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Add New Note</DialogTitle>
							<DialogDescription>Create a new note for a student with category and priority.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="student">Student *</Label>
								<Select
									value={newNote.student_id}
									onValueChange={(value) => setNewNote({ ...newNote, student_id: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a student..." />
									</SelectTrigger>
									<SelectContent>
										{students.length === 0 ? (
											<SelectItem value="" disabled>
												No students available
											</SelectItem>
										) : (
											students.map((student) => {
												const { name: cleanName } = extractNameAndImageFromHtml(student.name || '')
												return (
													<SelectItem key={student.uuid || student.id} value={student.uuid || student.id}>
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarImage src={student.profileImageUrl || student.profile_image_url} />
																<AvatarFallback className="text-xs">
																	{cleanName?.split(" ").map((n) => n[0]).join("") || "??"}
																</AvatarFallback>
															</Avatar>
															<span>{cleanName} (@{student.username || 'unknown'})</span>
														</div>
													</SelectItem>
												)
											})
										)}
									</SelectContent>
								</Select>
								{students.length === 0 && (
									<p className="text-sm text-muted-foreground">
										Loading students... If this persists, check the console for errors.
									</p>
								)}
							</div>
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
							<Button variant="outline" onClick={() => setIsAddingNote(false)} disabled={creating}>
								Cancel
							</Button>
							<Button
								onClick={handleAddNote}
								disabled={!newNote.student_id || !newNote.title || !newNote.content || creating}
							>
								{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Add Note
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Edit Note</DialogTitle>
						<DialogDescription>Update the note details.</DialogDescription>
					</DialogHeader>
					{editingNote && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="edit-title">Title *</Label>
								<Input
									id="edit-title"
									value={editingNote.title}
									onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
									placeholder="Enter note title..."
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-category">Category</Label>
									<Select
										value={editingNote.category}
										onValueChange={(value) => setEditingNote({ ...editingNote, category: value })}
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
									<Label htmlFor="edit-priority">Priority</Label>
									<Select
										value={editingNote.priority}
										onValueChange={(value) => setEditingNote({ ...editingNote, priority: value })}
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
								<Label htmlFor="edit-content">Note Content *</Label>
								<Textarea
									id="edit-content"
									value={editingNote.content}
									onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
									placeholder="Enter your note content..."
									rows={4}
								/>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingNote(null)}>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateNote}
							disabled={!editingNote?.title || !editingNote?.content}
						>
							Update Note
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-6">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search notes..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8"
							/>
						</div>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.value} value={category.value}>
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={priorityFilter} onValueChange={setPriorityFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Priorities</SelectItem>
								{priorities.map((priority) => (
									<SelectItem key={priority.value} value={priority.value}>
										{priority.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={authorFilter} onValueChange={setAuthorFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Author" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Authors</SelectItem>
								{uniqueAuthors.map((author) => (
									<SelectItem key={author} value={author}>
										{author}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="md:col-span-2">
							<Button
								variant="outline"
								onClick={() => {
									setSearchTerm("")
									setCategoryFilter("all")
									setPriorityFilter("all")
									setAuthorFilter("all")
								}}
								className="w-full"
							>
								Clear Filters
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4">
				{loading ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
							<p className="text-muted-foreground">Loading notes...</p>
						</CardContent>
					</Card>
				) : notes.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No notes found</h3>
							<p className="text-muted-foreground text-center">
								{searchTerm ||
									categoryFilter !== "all" ||
									priorityFilter !== "all" ||
									authorFilter !== "all"
									? "Try adjusting your filters to see more notes."
									: "Start by adding your first note about a student."}
							</p>
						</CardContent>
					</Card>
				) : (
					notes.map((note) => {
						const { name: studentName, imageUrl } = extractNameAndImageFromHtml(note.students?.name || "Unknown Student")

						return (
							<Card key={note.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-4">
											<Avatar className="h-12 w-12">
												<AvatarImage src={imageUrl || note.students?.profile_image_url} />
												<AvatarFallback>
													{studentName?.split(" ").map((n) => n[0]).join("") || "??"}
												</AvatarFallback>
											</Avatar>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<h3 className="font-semibold text-lg">{studentName}</h3>
													<span className="text-sm text-muted-foreground">
														@{note.students?.username || extractUsernameFromHtml(note.students?.name || "")}
													</span>
												</div>
												<h4 className="text-base font-medium text-muted-foreground">{note.title}</h4>
												<div className="flex items-center gap-2">
													{getCategoryBadge(note.category)}
													{getPriorityBadge(note.priority)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="text-right text-sm text-muted-foreground">
												<div className="flex items-center gap-1">
													<User className="h-3 w-3" />
													{note.author}
												</div>
												<div className="flex items-center gap-1 mt-1">
													<Calendar className="h-3 w-3" />
													{formatDate(note.created_at)}
												</div>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onClick={() => setEditingNote(note)}>
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDeleteNote(note.id)}
														className="text-red-600"
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed">{note.content}</p>
								</CardContent>
							</Card>
						)
					})
				)}
			</div>

			{notes.length > 0 && (
				<div className="text-center text-sm text-muted-foreground">
					Showing {notes.length} notes
				</div>
			)}
		</div>
	)
}
