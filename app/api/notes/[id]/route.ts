// app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { data, error } = await supabase
			.from('notes')
			.select(`
        *,
        students (
          uuid,
          username,
          name,
          email
        )
      `)
			.eq('id', params.id)
			.single()

		if (error) {
			console.error('Note API: Error fetching note:', error)
			return NextResponse.json({ error: 'Note not found' }, { status: 404 })
		}

		return NextResponse.json({ note: data })
	} catch (error) {
		console.error('Note API: Unexpected error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { title, content, category, priority } = body

		const { data, error } = await supabase
			.from('notes')
			.update({
				title,
				content,
				category,
				priority,
				updated_at: new Date().toISOString(),
			})
			.eq('id', params.id)
			.select(`
        *,
        students (
          uuid,
          username,
          name,
          email
        )
      `)
			.single()

		if (error) {
			console.error('Note API: Error updating note:', error)
			return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
		}

		return NextResponse.json({ note: data })
	} catch (error) {
		console.error('Note API: Unexpected error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { error } = await supabase
			.from('notes')
			.delete()
			.eq('id', params.id)

		if (error) {
			console.error('Note API: Error deleting note:', error)
			return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
		}

		return NextResponse.json({ message: 'Note deleted successfully' })
	} catch (error) {
		console.error('Note API: Unexpected error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
