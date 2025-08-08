// app/api/diagnostic/route.ts
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

		console.log('🔍 Starting database diagnostic...')
		const diagnostic = {
			timestamp: new Date().toISOString(),
			tables: {},
			relationships: {},
			sampleData: {},
			errors: []
		}

		// Check each table
		const tablesToCheck = ['students', 'rush_teams', 'rush_team_members', 'rush_scores', 'exam_grades']

		for (const tableName of tablesToCheck) {
			try {
				console.log(`🔍 Checking table: ${tableName}`)

				// Try to get table info
				const { count, error: countError } = await supabase
					.from(tableName)
					.select('*', { count: 'exact', head: true })

				if (countError) {
					diagnostic.tables[tableName] = {
						exists: false,
						error: countError.message,
						count: 0
					}
					diagnostic.errors.push(`Table ${tableName}: ${countError.message}`)
				} else {
					diagnostic.tables[tableName] = {
						exists: true,
						count: count || 0
					}

					// Get sample data for existing tables
					if (count && count > 0) {
						const { data: sampleData, error: sampleError } = await supabase
							.from(tableName)
							.select('*')
							.limit(1)

						if (!sampleError && sampleData && sampleData.length > 0) {
							diagnostic.sampleData[tableName] = {
								columns: Object.keys(sampleData[0]),
								sample: sampleData[0]
							}
						}
					}
				}
			} catch (error) {
				diagnostic.tables[tableName] = {
					exists: false,
					error: error instanceof Error ? error.message : 'Unknown error',
					count: 0
				}
				diagnostic.errors.push(`Table ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
			}
		}

		// Test relationships if tables exist
		if (diagnostic.tables['rush_teams']?.exists && diagnostic.tables['rush_team_members']?.exists) {
			try {
				console.log('🔍 Testing rush_teams -> rush_team_members relationship...')

				const { data: relationshipTest, error: relError } = await supabase
					.from('rush_teams')
					.select(`
            id,
            team_name,
            rush_team_members (
              student_id,
              rating
            )
          `)
					.limit(1)

				if (relError) {
					diagnostic.relationships['rush_teams_to_members'] = {
						working: false,
						error: relError.message
					}
					diagnostic.errors.push(`Relationship rush_teams->rush_team_members: ${relError.message}`)
				} else {
					diagnostic.relationships['rush_teams_to_members'] = {
						working: true,
						sample: relationshipTest
					}
				}
			} catch (error) {
				diagnostic.relationships['rush_teams_to_members'] = {
					working: false,
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			}
		}

		// Test students relationship
		if (diagnostic.tables['rush_team_members']?.exists && diagnostic.tables['students']?.exists) {
			try {
				console.log('🔍 Testing rush_team_members -> students relationship...')

				const { data: studentRelTest, error: studentRelError } = await supabase
					.from('rush_team_members')
					.select(`
            student_id,
            students (
              uuid,
              name,
              username
            )
          `)
					.limit(1)

				if (studentRelError) {
					diagnostic.relationships['members_to_students'] = {
						working: false,
						error: studentRelError.message
					}
					diagnostic.errors.push(`Relationship rush_team_members->students: ${studentRelError.message}`)
				} else {
					diagnostic.relationships['members_to_students'] = {
						working: true,
						sample: studentRelTest
					}
				}
			} catch (error) {
				diagnostic.relationships['members_to_students'] = {
					working: false,
					error: error instanceof Error ? error.message : 'Unknown error'
				}
			}
		}

		// Check for projects in rush_scores to understand data structure
		if (diagnostic.tables['rush_scores']?.exists) {
			try {
				const { data: projects, error: projectsError } = await supabase
					.from('rush_scores')
					.select('project_name')
					.not('project_name', 'is', null)
					.limit(10)

				if (!projectsError && projects) {
					const uniqueProjects = [...new Set(projects.map(p => p.project_name))]
					diagnostic.sampleData['rush_projects'] = uniqueProjects
				}
			} catch (error) {
				// Ignore - this is optional
			}
		}

		console.log('✅ Diagnostic complete')

		return NextResponse.json({
			success: true,
			diagnostic
		})

	} catch (error) {
		console.error('❌ Diagnostic error:', error)
		return NextResponse.json({
			success: false,
			error: 'Diagnostic failed',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 })
	}
}
