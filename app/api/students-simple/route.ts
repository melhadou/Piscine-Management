// app/api/students-simple/route.ts
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

		const { data: students, error } = await supabase
			.from('students')
			.select('uuid, username, name, email')
			.order('name')

		if (error) {
			return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
		}

		// Clean up the HTML in names
		const cleanStudents = students?.map(student => {
			let cleanName = student.name || student.username || 'Unknown'

			// Extract clean name from HTML
			if (cleanName.includes('<') && cleanName.includes('>')) {
				const nameMatch = cleanName.match(/>([^<]+)<\/a>/)
				if (nameMatch) {
					cleanName = nameMatch[1].trim()
				} else {
					cleanName = cleanName.replace(/<[^>]*>/g, '').trim() || student.username || 'Unknown'
				}
			}

			return {
				uuid: student.uuid,
				username: student.username,
				name: cleanName,
				email: student.email
			}
		}) || []

		return NextResponse.json({
			success: true,
			students: cleanStudents
		})

	} catch (error) {
		console.error('Simple Students API error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
