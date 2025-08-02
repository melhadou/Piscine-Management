// app/api/notes/route.ts - Fixed version with student filtering
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
	try {
		console.log('Notes API: GET request received')

		const session = await getServerSession(authOptions)
		if (!session) {
			console.log('Notes API: No session found')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		console.log('Notes API: Session found, user:', session.user?.email)

		const { searchParams } = new URL(request.url)

		// Get query parameters for filtering
		const student_id = searchParams.get('student_id')  // <-- THIS WAS MISSING!
		const category = searchParams.get('category')
		const priority = searchParams.get('priority')
		const author = searchParams.get('author')
		const search = searchParams.get('search')

		console.log('Notes API: Filters applied:', { student_id, category, priority, author, search })

		// Build the query with correct column names from your schema
		let query = supabase
			.from('notes')
			.select(`
        *,
        students (
          id,
          uuid,
          username,
          name,
          email
        )
      `)
			.order('created_at', { ascending: false })

		// IMPORTANT: Filter by student_id if provided
		// The foreign key references students.uuid directly
		if (student_id) {
			console.log('Notes API: Filtering by student UUID:', student_id)
			query = query.eq('student_id', student_id) // Use UUID directly
		}

		// Apply other filters
		if (category && category !== 'all') {
			query = query.eq('category', category)
		}
		if (priority && priority !== 'all') {
			query = query.eq('priority', priority)
		}
		if (author && author !== 'all') {
			query = query.eq('author', author)
		}
		if (search) {
			query = query.or(`content.ilike.%${search}%,title.ilike.%${search}%`)
		}

		const { data, error } = await query

		if (error) {
			console.error('Notes API: Database error:', error)
			return NextResponse.json({
				error: 'Failed to fetch notes',
				details: error.message
			}, { status: 500 })
		}

		// If student_id was provided, the filtering was already done in the query above
		console.log(`Notes API: Successfully fetched ${data?.length || 0} notes for student UUID: ${student_id || 'all'}`)

		return NextResponse.json({ notes: data || [] })
	} catch (error) {
		console.error('Notes API: Unexpected error:', error)
		return NextResponse.json({
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('Notes API: POST request received')

		const session = await getServerSession(authOptions)
		if (!session) {
			console.log('Notes API: No session for POST request')
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		console.log('Notes API: Session found for POST, user:', session.user?.email)

		const body = await request.json()
		console.log('Notes API: Request body:', body)

		const { student_id, title, content, category, priority } = body

		// Validate required fields
		if (!student_id || !title || !content || !category || !priority) {
			console.log('Notes API: Missing required fields')
			return NextResponse.json({
				error: 'Missing required fields',
				received: { student_id, title, content, category, priority }
			}, { status: 400 })
		}

		// Verify the student exists - check by UUID since that's what the foreign key references
		const { data: studentExists, error: studentError } = await supabase
			.from('students')
			.select('id, uuid, username, name, email')
			.eq('uuid', student_id) // Check by UUID
			.single()

		if (studentError) {
			console.error('Notes API: Error checking student:', studentError)
			return NextResponse.json({
				error: 'Student not found',
				details: studentError.message
			}, { status: 404 })
		}

		console.log('Notes API: Student found:', studentExists)

		// Get the current user's name from the session
		const authorName = session.user?.name || session.user?.email || 'Unknown User'

		const noteData = {
			student_id: student_id, // Use the UUID directly since foreign key references students.uuid
			title,
			content,
			category,
			priority,
			author: authorName,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		}

		console.log('Notes API: Inserting note:', noteData)

		const { data, error } = await supabase
			.from('notes')
			.insert([noteData])
			.select(`
        *,
        students (
          id,
          uuid,
          username,
          name,
          email
        )
      `)
			.single()

		if (error) {
			console.error('Notes API: Database insert error:', error)
			return NextResponse.json({
				error: 'Failed to create note',
				details: error.message
			}, { status: 500 })
		}

		console.log('Notes API: Note created successfully:', data)

		return NextResponse.json({ note: data }, { status: 201 })
	} catch (error) {
		console.error('Notes API: POST unexpected error:', error)
		return NextResponse.json({
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
