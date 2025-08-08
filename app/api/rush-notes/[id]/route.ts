// app/api/rush-notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Update rush note
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = params
		const body = await request.json()

		console.log('🔄 Updating rush note:', id)

		const updateData = {
			...body,
			updated_at: new Date().toISOString()
		}

		// Remove fields that shouldn't be updated directly
		delete updateData.id
		delete updateData.created_at
		delete updateData.students

		const { data: updatedNote, error: updateError } = await supabase
			.from('notes')
			.update(updateData)
			.eq('id', id)
			.eq('category', 'rush')
			.select('*')
			.single()

		if (updateError) {
			console.error('❌ Error updating rush note:', updateError)
			return NextResponse.json({
				success: false,
				error: 'Failed to update rush note',
				details: updateError.message
			}, { status: 500 })
		}

		if (!updatedNote) {
			return NextResponse.json({
				success: false,
				error: 'Rush note not found'
			}, { status: 404 })
		}

		// Get student data for the response
		const { data: student } = await supabase
			.from('students')
			.select('uuid, name, username, email, profile_image_url')
			.eq('uuid', updatedNote.student_id)
			.single()

		const noteWithStudent = {
			...updatedNote,
			students: student
		}

		console.log('✅ Rush note updated successfully')

		return NextResponse.json({
			success: true,
			rushNote: noteWithStudent
		})
	} catch (error) {
		console.error('❌ Error updating rush note:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}

// Delete rush note
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = params

		console.log('🗑️ Deleting rush note:', id)

		const { error: deleteError } = await supabase
			.from('notes')
			.delete()
			.eq('id', id)
			.eq('category', 'rush')

		if (deleteError) {
			console.error('❌ Error deleting rush note:', deleteError)
			return NextResponse.json({
				success: false,
				error: 'Failed to delete rush note',
				details: deleteError.message
			}, { status: 500 })
		}

		console.log('✅ Rush note deleted successfully')

		return NextResponse.json({
			success: true,
			message: 'Rush note deleted successfully'
		})
	} catch (error) {
		console.error('❌ Error deleting rush note:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
