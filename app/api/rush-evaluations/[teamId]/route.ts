// app/api/rush-evaluations/[teamId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { memberUuid, rating, feedback, individual_score } = body
		const { teamId } = params

		if (!memberUuid || rating === undefined) {
			return NextResponse.json({
				error: 'Member UUID and rating are required'
			}, { status: 400 })
		}

		console.log('🔄 Updating team member evaluation:', {
			teamId,
			memberUuid,
			rating,
			hasFeedback: !!feedback
		})

		// Update team member evaluation
		const { data: updatedMember, error: updateError } = await supabase
			.from('rush_team_members')
			.update({
				rating,
				feedback: feedback || null,
				individual_score: individual_score || null,
				updated_at: new Date().toISOString()
			})
			.eq('team_id', teamId)
			.eq('student_id', memberUuid)
			.select(`
        *,
        students (
          uuid,
          name,
          username,
          email
        )
      `)

		if (updateError) {
			console.error('❌ Error updating team member:', updateError)
			return NextResponse.json({
				error: 'Failed to update team member',
				details: updateError.message
			}, { status: 500 })
		}

		if (!updatedMember || updatedMember.length === 0) {
			return NextResponse.json({
				error: 'Team member not found'
			}, { status: 404 })
		}

		console.log('✅ Team member updated successfully')

		return NextResponse.json({
			success: true,
			updatedMember: updatedMember[0]
		})
	} catch (error) {
		console.error('❌ Error updating team member evaluation:', error)
		return NextResponse.json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { teamId: string } }
) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { teamId } = params

		console.log('🗑️ Deleting team:', teamId)

		// First, delete all team members
		const { error: membersError } = await supabase
			.from('rush_team_members')
			.delete()
			.eq('team_id', teamId)

		if (membersError) {
			console.error('❌ Error deleting team members:', membersError)
			return NextResponse.json({
				error: 'Failed to delete team members',
				details: membersError.message
			}, { status: 500 })
		}

		// Then delete the team
		const { error: teamError } = await supabase
			.from('rush_teams')
			.delete()
			.eq('id', teamId)

		if (teamError) {
			console.error('❌ Error deleting team:', teamError)
			return NextResponse.json({
				error: 'Failed to delete team',
				details: teamError.message
			}, { status: 500 })
		}

		console.log('✅ Team deleted successfully')

		return NextResponse.json({
			success: true,
			message: 'Team deleted successfully'
		})
	} catch (error) {
		console.error('❌ Error deleting team:', error)
		return NextResponse.json({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
