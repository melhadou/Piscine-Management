// app/api/rush-summary/route.ts
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
		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { searchParams } = new URL(request.url)
		const rushProject = searchParams.get('rush_project')

		console.log('🔍 Fetching rush summary for project:', rushProject)

		let query = supabase
			.from('notes')
			.select('student_id, rush_project, rush_status, rush_score')
			.eq('category', 'rush')
			.not('rush_project', 'is', null)

		if (rushProject) {
			query = query.eq('rush_project', rushProject)
		}

		const { data: rushData, error } = await query

		if (error) {
			console.error('❌ Error fetching rush summary:', error)
			return NextResponse.json({
				success: false,
				error: 'Failed to fetch rush summary',
				details: error.message
			}, { status: 500 })
		}

		// Get student data for each rush note
		const studentIds = [...new Set(rushData?.map(note => note.student_id) || [])]
		const { data: students } = await supabase
			.from('students')
			.select('uuid, name, username, profile_image_url')
			.in('uuid', studentIds)

		const studentsMap = new Map()
		students?.forEach(student => {
			studentsMap.set(student.uuid, student)
		})

		// Group by project and calculate statistics
		const summary = {}
		const projects = rushProject ? [rushProject] : ['square', 'sky-scraper', 'rosetta-stone']

		for (const project of projects) {
			const projectData = rushData?.filter(note => note.rush_project === project) || []

			summary[project] = {
				total_students: projectData.length,
				successful: projectData.filter(note => note.rush_status === 'success').length,
				failed: projectData.filter(note => note.rush_status === 'failed').length,
				absent: projectData.filter(note => note.rush_status === 'absent').length,
				pending: projectData.filter(note => note.rush_status === 'pending').length,
				average_score: projectData.length > 0
					? projectData
						.filter(note => note.rush_score !== null)
						.reduce((sum, note) => sum + (note.rush_score || 0), 0) /
					Math.max(1, projectData.filter(note => note.rush_score !== null).length)
					: 0,
				students: projectData.map(note => {
					const student = studentsMap.get(note.student_id)
					return {
						uuid: student?.uuid,
						name: student?.name,
						username: student?.username,
						status: note.rush_status,
						score: note.rush_score,
						profileImageUrl: student?.profile_image_url
					}
				})
			}
		}

		console.log('✅ Rush summary calculated')

		return NextResponse.json({
			success: true,
			summary
		})
	} catch (error) {
		console.error('❌ Rush summary API error:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
