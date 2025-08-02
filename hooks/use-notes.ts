// hooks/use-notes.ts - Updated with better debugging
import { useState, useEffect, useCallback } from 'react'
import { Note, Student } from '@/types/database'
import { toast } from 'sonner'

interface UseNotesFilters {
	search?: string
	category?: string
	priority?: string
	author?: string
}

interface UseNotesReturn {
	notes: Note[]
	students: Student[]
	loading: boolean
	creating: boolean
	fetchNotes: (filters?: UseNotesFilters) => Promise<void>
	createNote: (noteData: {
		student_id: string
		title: string
		content: string
		category: string
		priority: string
	}) => Promise<Note | null>
	updateNote: (id: string, noteData: Partial<Note>) => Promise<Note | null>
	deleteNote: (id: string) => Promise<boolean>
}

export function useNotes(): UseNotesReturn {
	const [notes, setNotes] = useState<Note[]>([])
	const [students, setStudents] = useState<Student[]>([])
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)

	const fetchNotes = useCallback(async (filters: UseNotesFilters = {}) => {
		try {
			setLoading(true)
			const params = new URLSearchParams()

			Object.entries(filters).forEach(([key, value]) => {
				if (value && value !== 'all') {
					params.append(key, value)
				}
			})

			console.log('Fetching notes with URL:', `/api/notes?${params.toString()}`)

			const response = await fetch(`/api/notes?${params.toString()}`)

			console.log('Notes API response status:', response.status)
			console.log('Notes API response headers:', response.headers)

			if (!response.ok) {
				const errorText = await response.text()
				console.error('Notes API error response:', errorText)
				throw new Error(`Failed to fetch notes: ${response.status} - ${errorText}`)
			}

			const data = await response.json()
			console.log('Notes data received:', data)
			setNotes(data.notes || [])
		} catch (error) {
			console.error('Error fetching notes:', error)
			toast.error(`Failed to load notes: ${error.message}`)
		} finally {
			setLoading(false)
		}
	}, [])

	const fetchStudents = useCallback(async () => {
		try {
			console.log('Fetching students from simple API...')
			const response = await fetch('/api/students-simple') // Use simple API

			if (!response.ok) {
				const errorText = await response.text()
				console.error('Students API error:', errorText)
				throw new Error(`Failed to fetch students: ${response.status}`)
			}

			const data = await response.json()

			if (data.success && data.students) {
				setStudents(data.students)
			} else {
				setStudents([])
			}
		} catch (error) {
			console.error('Error fetching students:', error)
			toast.error('Failed to load students')
		}
	}, [])

	const createNote = useCallback(async (noteData: {
		student_id: string
		title: string
		content: string
		category: string
		priority: string
	}): Promise<Note | null> => {
		try {
			setCreating(true)
			console.log('Creating note with data:', noteData)

			const response = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(noteData),
			})

			console.log('Create note response status:', response.status)

			if (!response.ok) {
				const errorText = await response.text()
				console.error('Create note error:', errorText)
				throw new Error(`Failed to create note: ${response.status}`)
			}

			const data = await response.json()
			const newNote = data.note
			setNotes(prev => [newNote, ...prev])
			toast.success('Note created successfully')
			return newNote
		} catch (error) {
			console.error('Error creating note:', error)
			toast.error('Failed to create note')
			return null
		} finally {
			setCreating(false)
		}
	}, [])

	const updateNote = useCallback(async (id: string, noteData: Partial<Note>): Promise<Note | null> => {
		try {
			const response = await fetch(`/api/notes/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(noteData),
			})

			if (!response.ok) {
				throw new Error('Failed to update note')
			}

			const data = await response.json()
			const updatedNote = data.note
			setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
			toast.success('Note updated successfully')
			return updatedNote
		} catch (error) {
			console.error('Error updating note:', error)
			toast.error('Failed to update note')
			return null
		}
	}, [])

	const deleteNote = useCallback(async (id: string): Promise<boolean> => {
		try {
			const response = await fetch(`/api/notes/${id}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete note')
			}

			setNotes(prev => prev.filter(note => note.id !== id))
			toast.success('Note deleted successfully')
			return true
		} catch (error) {
			console.error('Error deleting note:', error)
			toast.error('Failed to delete note')
			return false
		}
	}, [])

	useEffect(() => {
		fetchStudents()
		// Don't fetch notes on initial load - wait for first filter change or manual trigger
	}, [fetchStudents])

	return {
		notes,
		students,
		loading,
		creating,
		fetchNotes,
		createNote,
		updateNote,
		deleteNote,
	}
}
