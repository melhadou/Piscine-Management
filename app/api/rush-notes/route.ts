// app/api/rush-notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get rush notes
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const studentId = searchParams.get('student_id')
		const rushProject = searchParams.get('rush_project')
		const rushStatus = searchParams.get('rush_status')

		console.log('🔍 Fetching rush notes:', { studentId, rushProject, rushStatus })

		// Build the query
		let query = supabase
			.from('notes')
			.select('*')
			.eq('category', 'rush')
			.not('rush_project', 'is', null)
			.order('created_at', { ascending: false })

		// Apply filters
		if (studentId) {
			query = query.eq('student_id', studentId)
		}
		if (rushProject) {
			query = query.eq('rush_project', rushProject)
		}
		if (rushStatus) {
			query = query.eq('rush_status', rushStatus)
		}

		const { data: rushNotes, error } = await query

		if (error) {
			console.error('❌ Error fetching rush notes:', error)
			return NextResponse.json({
				success: false,
				error: 'Failed to fetch rush notes',
				details: error.message
			}, { status: 500 })
		}

		console.log(`✅ Found ${rushNotes?.length || 0} rush notes`)

		// Get student data separately for each note
		const notesWithStudents = []
		if (rushNotes && rushNotes.length > 0) {
			for (const note of rushNotes) {
				try {
					const { data: student, error: studentError } = await supabase
						.from('students')
						.select('uuid, name, username, email, profile_image_url')
						.eq('uuid', note.student_id)
						.single()

					notesWithStudents.push({
						...note,
						students: studentError ? null : student
					})
				} catch (err) {
					notesWithStudents.push({
						...note,
						students: null
					})
				}
			}
		}

		return NextResponse.json({
			success: true,
			rushNotes: notesWithStudents,
			total: notesWithStudents.length
		})
	} catch (error) {
		console.error('❌ Rush notes API error:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}

// Create new rush note
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const {
			student_id,
			title,
			content,
			rush_project,
			rush_status,
			rush_score,
			priority = 'medium'
		} = body

		// Validation
		if (!student_id || !title || !content || !rush_project || !rush_status) {
			return NextResponse.json({
				success: false,
				error: 'Missing required fields: student_id, title, content, rush_project, rush_status'
			}, { status: 400 })
		}

		console.log('🔄 Creating rush note:', { student_id, rush_project, rush_status })

		const noteData = {
			student_id,
			title,
			content,
			author: session.user?.name || session.user?.email || 'Staff',
			category: 'rush',
			priority,
			rush_project,
			rush_status,
			rush_score: rush_score ? parseFloat(rush_score) : null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}

		const { data: newNote, error: insertError } = await supabase
			.from('notes')
			.insert([noteData])
			.select('*')
			.single()

		if (insertError) {
			console.error('❌ Error creating rush note:', insertError)
			return NextResponse.json({
				success: false,
				error: 'Failed to create rush note',
				details: insertError.message
			}, { status: 500 })
		}

		// Get student data for the response
		const { data: student } = await supabase
			.from('students')
			.select('uuid, name, username, email, profile_image_url')
			.eq('uuid', student_id)
			.single()

		const noteWithStudent = {
			...newNote,
			students: student
		}

		console.log('✅ Rush note created successfully')

		return NextResponse.json({
			success: true,
			rushNote: noteWithStudent
		})
	} catch (error) {
		console.error('❌ Error creating rush note:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
