// app/api/rush-evaluations/route.ts
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
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const projectName = searchParams.get('project')

		if (!projectName) {
			return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
		}

		console.log('🔍 Fetching teams for project:', projectName)

		// Fetch teams from the notes system (using category 'team')
		const { data: teamNotes, error: teamNotesError } = await supabase
			.from('notes')
			.select('*')
			.eq('category', 'team')
			.eq('rush_project', projectName)
			.order('created_at', { ascending: false })

		let teams = []

		if (!teamNotesError && teamNotes) {
			// Parse team data from notes
			for (const note of teamNotes) {
				try {
					const metadata = note.metadata ? JSON.parse(note.metadata) : null
					if (metadata && metadata.members) {
						// Get student data for team members
						const { data: studentsData, error: studentsError } = await supabase
							.from('students')
							.select('uuid, name, username, email, profile_image_url')
							.in('uuid', metadata.members)

						const members = studentsData?.map(student => ({
							uuid: student.uuid,
							name: student.name || 'Unknown Student',
							username: student.username || 'unknown',
							email: student.email || '',
							profileImageUrl: student.profile_image_url || null,
							rating: 0,
							feedback: '',
							individual_score: null,
							project_type: metadata.projectName
						})) || []

						teams.push({
							id: metadata.teamId || note.id,
							name: metadata.teamName || note.title.replace('Team: ', ''),
							grade: null,
							members: members
						})
					}
				} catch (parseError) {
					console.error('❌ Error parsing team metadata:', parseError)
				}
			}
		}

		// Try to get teams from rush_teams table as fallback
		const { data: rushTeams, error: rushTeamsError } = await supabase
			.from('rush_teams')
			.select('*')
			.eq('project_name', projectName)
			.order('created_at', { ascending: false })

		if (!rushTeamsError && rushTeams) {
			console.log(`✅ Found ${rushTeams.length} teams from rush_teams table`)
		}

		console.log(`✅ Found ${teams.length} teams from notes system`)

		return NextResponse.json({
			success: true,
			teams: teams,
			total: teams.length
		})
	} catch (error) {
		console.error('❌ Rush evaluations API error:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { projectName, teamName, members } = body

		if (!projectName || !teamName || !members || !Array.isArray(members)) {
			return NextResponse.json({
				success: false,
				error: 'Invalid request data'
			}, { status: 400 })
		}

		if (members.length !== 3) {
			return NextResponse.json({
				success: false,
				error: 'Team must have exactly 3 members'
			}, { status: 400 })
		}

		console.log('🔄 Creating new team:', { projectName, teamName, memberCount: members.length })

		// Generate a unique team ID
		const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		// Get student data for the team members
		const { data: studentsData, error: studentsError } = await supabase
			.from('students')
			.select('uuid, name, username, email, profile_image_url')
			.in('uuid', members)

		if (studentsError) {
			console.error('❌ Error fetching student data:', studentsError)
			return NextResponse.json({
				success: false,
				error: 'Failed to fetch student data',
				details: studentsError.message
			}, { status: 500 })
		}

		// Create a special note to represent the team
		const teamNote = {
			student_id: members[0], // Use first member as the primary student
			title: `Team: ${teamName}`,
			content: `Rush team for ${projectName} project. Members: ${studentsData?.map(s => s.name).join(', ') || 'Unknown members'}`,
			category: 'team',
			priority: 'Medium',
			author: 'System',
			rush_project: projectName,
			rush_status: 'pending',
			rush_score: null,
			// Store team data in metadata (as JSON string if needed)
			metadata: JSON.stringify({
				teamId: teamId,
				teamName: teamName,
				members: members,
				projectName: projectName,
				createdAt: new Date().toISOString()
			})
		}

		// Insert the team note
		const { data: noteResult, error: noteError } = await supabase
			.from('notes')
			.insert(teamNote)
			.select()
			.single()

		if (noteError) {
			console.error('❌ Error creating team note:', noteError)
			return NextResponse.json({
				success: false,
				error: 'Failed to create team',
				details: noteError.message
			}, { status: 500 })
		}

		console.log('✅ Team created via notes system')

		// Format response with student data
		const responseTeam = {
			id: teamId,
			name: teamName,
			grade: null,
			members: studentsData?.map(student => ({
				uuid: student.uuid,
				name: student.name || 'Unknown Student',
				username: student.username || 'unknown',
				email: student.email || '',
				profileImageUrl: student.profile_image_url || null,
				rating: 0,
				feedback: '',
				individual_score: null,
				project_type: projectName
			})) || []
		}

		return NextResponse.json({
			success: true,
			team: responseTeam
		})
	} catch (error) {
		console.error('❌ Error creating team:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
