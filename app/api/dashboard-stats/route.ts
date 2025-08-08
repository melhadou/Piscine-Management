// app/api/dashboard-stats/route.ts
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

		console.log('🔍 Fetching dashboard statistics...')

		// Get basic students count
		const { count: totalStudents, error: studentsError } = await supabase
			.from('students')
			.select('*', { count: 'exact', head: true })

		if (studentsError) {
			console.error('❌ Error fetching students count:', studentsError)
			return NextResponse.json({
				success: false,
				error: 'Failed to fetch dashboard statistics',
				details: studentsError.message
			}, { status: 500 })
		}

		// Get exam grades statistics
		const { data: examGrades, error: examError } = await supabase
			.from('exam_grades')
			.select('student_id, exam_name, grade, validated')

		let examStats = {
			totalExams: 0,
			validatedExams: 0,
			averageGrade: 0,
			studentsWithExams: 0
		}

		if (!examError && examGrades) {
			examStats.totalExams = examGrades.length
			examStats.validatedExams = examGrades.filter(e => e.validated).length
			examStats.averageGrade = examGrades.length > 0 
				? examGrades.reduce((sum, e) => sum + (e.grade || 0), 0) / examGrades.length 
				: 0
			examStats.studentsWithExams = new Set(examGrades.map(e => e.student_id)).size
		}

		// Get rush team statistics
		const { data: rushTeams, error: rushTeamsError } = await supabase
			.from('rush_teams')
			.select('id, team_name, project_name, grade')

		const { data: rushMembers, error: rushMembersError } = await supabase
			.from('rush_team_members')
			.select('student_id, team_id, rating')

		let rushStats = {
			totalTeams: 0,
			totalParticipants: 0,
			averageRating: 0,
			projectBreakdown: {} as Record<string, number>
		}

		if (!rushTeamsError && rushTeams) {
			rushStats.totalTeams = rushTeams.length
			
			// Count projects
			rushTeams.forEach(team => {
				const project = team.project_name || 'Unknown'
				rushStats.projectBreakdown[project] = (rushStats.projectBreakdown[project] || 0) + 1
			})
		}

		if (!rushMembersError && rushMembers) {
			rushStats.totalParticipants = new Set(rushMembers.map(m => m.student_id)).size
			rushStats.averageRating = rushMembers.length > 0
				? rushMembers.reduce((sum, m) => sum + (m.rating || 0), 0) / rushMembers.length
				: 0
		}

		// Get recent activity (last 10 exam submissions)
		const { data: recentActivity, error: activityError } = await supabase
			.from('exam_grades')
			.select(`
				student_id,
				exam_name,
				grade,
				validated,
				created_at,
				students (
					name,
					username
				)
			`)
			.order('created_at', { ascending: false })
			.limit(10)

		let recentExams: Array<{
			studentName: string;
			examName: string;
			grade: number;
			validated: boolean;
			createdAt: string;
		}> = []
		
		if (!activityError && recentActivity) {
			recentExams = recentActivity.map((activity: any) => ({
				studentName: activity.students?.name || activity.students?.username || 'Unknown Student',
				examName: activity.exam_name,
				grade: activity.grade,
				validated: activity.validated,
				createdAt: activity.created_at
			}))
		}

		const dashboardStats = {
			totalStudents: totalStudents || 0,
			activeStudents: examStats.studentsWithExams,
			examStats,
			rushStats,
			recentActivity: recentExams,
			timestamp: new Date().toISOString()
		}

		console.log('✅ Dashboard statistics compiled')

		return NextResponse.json({
			success: true,
			stats: dashboardStats
		})

	} catch (error) {
		console.error('❌ Dashboard stats API error:', error)
		return NextResponse.json({
			success: false,
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}