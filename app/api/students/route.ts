// app/api/students/route.ts - Debug version compatible with current DB
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

		console.log('Fetching students data...')

		// Start with basic student fetch to see what columns exist
		console.log('🔍 Checking what columns exist in students table...')

		// Get basic students data first
		const { data: students, error: studentsError } = await supabase
			.from('students')
			.select('*')
			.order('name')
			.limit(1) // Get just one record to see structure

		if (studentsError) {
			console.error('❌ Error fetching students:', studentsError)
			return NextResponse.json({
				success: false,
				error: 'Failed to fetch students',
				details: studentsError.message
			}, { status: 500 })
		}

		console.log('✅ Sample student record:', students?.[0])
		console.log('📋 Available columns:', students?.[0] ? Object.keys(students[0]) : 'No data')

		// Now fetch all students
		const { data: allStudents, error: allStudentsError } = await supabase
			.from('students')
			.select('*')
			.order('name')

		if (allStudentsError) {
			console.error('❌ Error fetching all students:', allStudentsError)
			return NextResponse.json({
				success: false,
				error: 'Failed to fetch all students',
				details: allStudentsError.message
			}, { status: 500 })
		}

		console.log(`✅ Found ${allStudents?.length || 0} students`)

		// Get all exam grades
		const { data: examGrades, error: gradesError } = await supabase
			.from('exam_grades')
			.select('student_id, exam_name, grade, validated')

		if (gradesError) {
			console.error('⚠️ Error fetching exam grades:', gradesError)
			// Don't fail completely if grades can't be fetched
		}

		console.log(`📊 Found ${examGrades?.length || 0} exam grades`)

		// Get rush team data
		const { data: rushTeamMembers, error: rushError } = await supabase
			.from('rush_team_members')
			.select(`
				student_id,
				rating,
				feedback,
				rush_teams!inner(
					team_name,
					project_name,
					grade
				)
			`)

		if (rushError) {
			console.error('⚠️ Error fetching rush teams:', rushError)
			// Don't fail completely if rush data can't be fetched
		}

		console.log(`🏆 Found ${rushTeamMembers?.length || 0} rush team members`)

		// Process and combine the data with backward compatibility
		const processedStudents = allStudents?.map(student => {
			console.log('🔄 Processing student:', student.username, 'Name:', student.name, 'Image:', student.profile_image_url)

			// Use the clean name and image URL directly from the database (no more HTML parsing needed)
			const displayName = student.name || student.username || 'Unknown Student'
			const profileImageUrl = student.profile_image_url && student.profile_image_url.trim() !== '' ? student.profile_image_url : null

			console.log('✅ Using clean data for', student.username, ':', { name: displayName, image: profileImageUrl ? 'YES' : 'NO' })

			// Get student's exam grades
			const studentGrades = examGrades?.filter(grade => grade.student_id === student.uuid) || []
			const examGradesObj = {
				exam00: 0,
				exam01: 0,
				exam02: 0,
				finalExam: 0
			}

			let finalExamValidated = false
			let totalValidatedExams = 0
			let totalExams = 0

			studentGrades.forEach(grade => {
				totalExams++
				if (grade.validated) {
					totalValidatedExams++
				}

				switch (grade.exam_name) {
					case 'exam00':
						examGradesObj.exam00 = Number(grade.grade) || 0
						break
					case 'exam01':
						examGradesObj.exam01 = Number(grade.grade) || 0
						break
					case 'exam02':
						examGradesObj.exam02 = Number(grade.grade) || 0
						break
					case 'final_exam':
						examGradesObj.finalExam = Number(grade.grade) || 0
						finalExamValidated = grade.validated || false
						break
				}
			})

			// Calculate level based on exam performance or use DB value if available
			const totalGradePoints = examGradesObj.exam00 + examGradesObj.exam01 + examGradesObj.exam02 + examGradesObj.finalExam
			const averageGrade = totalExams > 0 ? totalGradePoints / 4 : 0

			// Use level from database if available, otherwise calculate from grades
			const level = student.level !== undefined ? Number(student.level) : Math.round((averageGrade / 10) * 100) / 100

			// Get student's rush evaluations
			const studentRushEvaluations = rushTeamMembers?.filter(member => member.student_id === student.uuid) || []
			const rushEvaluations: Record<string, { rating: number, feedback: string }> = {}

			let rushesParticipated = 0
			let rushesValidated = 0
			let maxRushRating = 0

			studentRushEvaluations.forEach((evaluation, index) => {
				const rushKey = `rush-${index.toString().padStart(2, '0')}`
				const rating = evaluation.rating || 0

				rushEvaluations[rushKey] = {
					rating: rating,
					feedback: evaluation.feedback || ''
				}

				rushesParticipated++
				if (rating >= 2) { // Assuming 2+ rating means validated
					rushesValidated++
				}

				maxRushRating = Math.max(maxRushRating, rating)
			})

			// Safely get enhanced fields if they exist, with fallbacks
			const getField = (fieldName: string, fallback: any = null) => {
				return student[fieldName] !== undefined ? student[fieldName] : fallback
			}

			// Calculate performance metrics from actual data or use DB values
			const performance = getField('performance', Math.min(100, Math.max(0, Math.round(averageGrade))))
			const communication = getField('communication', Math.min(100, Math.max(0, Math.round(averageGrade * 0.9))))
			const professionalism = getField('professionalism', Math.min(100, Math.max(0, Math.round(averageGrade * 0.95))))

			// Ensure we use the actual name from database, fallback to username
			const login = student.username || 'N/A'

			// Process grades object for compatibility with your StudentTable component
			const gradesObject: Record<string, { grade: number; status: string }> = {}

			if (examGradesObj.exam00 > 0) {
				gradesObject['exam00'] = { grade: examGradesObj.exam00, status: 'finished' }
			}
			if (examGradesObj.exam01 > 0) {
				gradesObject['exam01'] = { grade: examGradesObj.exam01, status: 'finished' }
			}
			if (examGradesObj.exam02 > 0) {
				gradesObject['exam02'] = { grade: examGradesObj.exam02, status: 'finished' }
			}
			if (examGradesObj.finalExam > 0) {
				gradesObject['final_exam'] = { grade: examGradesObj.finalExam, status: finalExamValidated ? 'finished' : 'in_progress' }
			}

			return {
				id: student.id,
				uuid: student.uuid || student.id,
				login: login,
				firstName: displayName, // Use the clean name directly from database
				lastName: '', // Keep lastName empty since we have full name in firstName
				email: student.email || 'N/A',
				profileImageUrl: profileImageUrl, // Use the extracted image URL from database
				phone: getField('phone', null),
				campus: 'Unknown',
				cursus: 'Piscine',

				// Enhanced student data (with fallbacks for missing columns)
				level: level,
				blocks: getField('blocks', 0),
				votes_given: getField('votes_given', 0),
				votes_received: getField('votes_received', 0),
				voters: getField('voters', 0),
				reviewee: getField('reviewee', 0),
				reviewer: getField('reviewer', 0),
				feedbacks_received: getField('feedbacks_received', 0),
				performance: performance,
				communication: communication,
				professionalism: professionalism,
				validated_rushes_participated: getField('validated_rushes_participated', rushesParticipated > 0 ? `${rushesValidated}/${rushesParticipated}` : '0/0'),
				passed_exams_registered: getField('passed_exams_registered', totalExams > 0 ? `${totalValidatedExams}/${totalExams}` : '0/0'),
				final_exam_validated: getField('final_exam_validated', finalExamValidated),
				last_validated_project: getField('last_validated_project', null),
				validated_projects: getField('validated_projects', totalValidatedExams),
				age: getField('age', null),
				gender: getField('gender', null),
				coding_level: getField('coding_level', level >= 8 ? 'Advanced' : level >= 4 ? 'Intermediate' : 'Beginner'),
				context: getField('context', null),

				// Legacy compatibility fields
				wallet: 0,
				correctionPoint: 0,
				location: totalExams > 0 ? 'available' : 'unavailable',
				grades: Object.keys(gradesObject).length > 0 ? gradesObject : undefined,
				rushRating: maxRushRating,
				notes: [], // Empty for now, can be populated later

				// Additional fields for compatibility
				examGrades: examGradesObj,
				finalExamValidated: finalExamValidated,
				rushesValidated: rushesParticipated > 0 ? `${rushesValidated}/${rushesParticipated}` : '0/0',
				validatedProjects: totalValidatedExams,
				codingLevel: getField('coding_level', level >= 8 ? 'Advanced' : level >= 4 ? 'Intermediate' : 'Beginner'),
				rushEvaluations: rushEvaluations,
				hasExamData: totalExams > 0,
				hasRushData: rushesParticipated > 0,
				created_at: student.created_at,
				updated_at: student.updated_at
			}
		}) || []

		console.log(`✅ Processed ${processedStudents.length} students`)

		// Calculate summary stats
		const activeStudents = processedStudents.filter(s => s.location === 'available').length
		const withExamData = processedStudents.filter(s => s.hasExamData).length
		const withRushData = processedStudents.filter(s => s.hasRushData).length
		const averageLevel = processedStudents.length > 0 ?
			(processedStudents.reduce((sum, s) => sum + s.level, 0) / processedStudents.length).toFixed(2) : '0.00'
		const averagePerformance = processedStudents.length > 0 ?
			(processedStudents.reduce((sum, s) => sum + s.performance, 0) / processedStudents.length).toFixed(1) : '0.0'

		return NextResponse.json({
			success: true,
			students: processedStudents,
			total: processedStudents.length,
			summary: {
				totalStudents: processedStudents.length,
				withExamData: withExamData,
				withRushData: withRushData,
				activeStudents: activeStudents,
				averageLevel: averageLevel,
				averagePerformance: averagePerformance
			}
		})

	} catch (error) {
		console.error('❌ Students API error:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error',
				details: error instanceof Error ? error.stack : 'No stack trace available'
			},
			{ status: 500 }
		)
	}
}
