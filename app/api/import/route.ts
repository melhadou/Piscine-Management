// app/api/import/route.ts - Enhanced Smart Import with Extended Student Data
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ImportStats {
	total_rows: number
	created: number
	updated: number
	errors: number
}

interface ImportResult {
	success: boolean
	message: string
	stats?: ImportStats
	errors?: string[]
	detectedTables?: string[]
}

// Enhanced column mapping for all CSV fields
const COLUMN_MAPPINGS = {
	students: {
		identifiers: ['username', 'login', 'uuid', 'email'],
		columns: [
			// Basic identifiers
			'username', 'login', 'name', 'email', 'uuid',
			// Performance metrics
			'blocks', 'level', 'votes given', 'votes_given', 'votes received', 'votes_received',
			'voters', 'reviewee', 'reviewer', 'feedbacks received', 'feedbacks_received',
			'performance', 'communication', 'professionalism',
			// Project tracking
			'# validated rushes / participated', 'validated_rushes_participated',
			'# passed exams / registered', 'passed_exams_registered',
			'final exam validated?', 'final_exam_validated',
			'last validated project', 'last_validated_project',
			'# validated projects', 'validated_projects',
			// Personal info
			'age', 'gender', 'coding level', 'coding_level', 'context'
		],
		required: ['username', 'name']
	},
	exam_grades: {
		identifiers: ['username', 'uuid', 'student_id'],
		columns: ['exam 00', 'exam00', 'exam 01', 'exam01', 'exam 02', 'exam02', 'final exam', 'final_exam', 'finalexam'],
		gradeColumns: ['exam 00', 'exam00', 'exam 01', 'exam01', 'exam 02', 'exam02', 'final exam', 'final_exam', 'finalexam']
	},
	rush_scores: {
		identifiers: ['username', 'uuid'],
		columns: ['square', 'sky scraper', 'skyscraper', 'rosetta stone', 'rosettastone'],
		rushColumns: ['square', 'sky scraper', 'skyscraper', 'rosetta stone', 'rosettastone']
	}
}

// Parse CSV data
function parseCSV(csvText: string): string[][] {
	const lines = csvText.trim().split('\n')
	return lines.map(line => {
		const result: string[] = []
		let current = ''
		let inQuotes = false

		for (let i = 0; i < line.length; i++) {
			const char = line[i]
			if (char === '"') {
				inQuotes = !inQuotes
			} else if (char === ',' && !inQuotes) {
				result.push(current.trim())
				current = ''
			} else {
				current += char
			}
		}
		result.push(current.trim())
		return result
	})
}

// Detect what tables this CSV should populate
function detectTables(headers: string[]): string[] {
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
	const detectedTables: string[] = []

	// Check for student data (always present if we have username/name)
	const hasStudentData = COLUMN_MAPPINGS.students.columns.some(col =>
		normalizedHeaders.includes(col.toLowerCase())
	)
	if (hasStudentData) {
		detectedTables.push('students')
	}

	// Check for exam grade data
	const hasExamData = COLUMN_MAPPINGS.exam_grades.gradeColumns.some(col =>
		normalizedHeaders.includes(col.toLowerCase())
	)
	if (hasExamData) {
		detectedTables.push('exam_grades')
	}

	// Check for rush score data
	const hasRushData = COLUMN_MAPPINGS.rush_scores.rushColumns.some(col =>
		normalizedHeaders.includes(col.toLowerCase())
	)
	if (hasRushData) {
		detectedTables.push('rush_scores')
	}

	return detectedTables
}

// Get column indices for a table
function getColumnIndices(headers: string[], tableType: string): Record<string, number> {
	const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
	const indices: Record<string, number> = {}

	console.log('🔍 Headers for', tableType, ':', normalizedHeaders)

	if (tableType === 'students') {
		// Map all student columns
		const studentMapping = {
			// Basic info
			'username': ['username', 'login'],
			'name': ['name'],
			'email': ['email'],
			'uuid': ['uuid'],
			// Performance metrics
			'blocks': ['blocks'],
			'level': ['level'],
			'votes_given': ['votes given', 'votes_given'],
			'votes_received': ['votes received', 'votes_received'],
			'voters': ['voters'],
			'reviewee': ['reviewee'],
			'reviewer': ['reviewer'],
			'feedbacks_received': ['feedbacks received', 'feedbacks_received'],
			'performance': ['performance'],
			'communication': ['communication'],
			'professionalism': ['professionalism'],
			// Project tracking
			'validated_rushes_participated': ['# validated rushes / participated', 'validated_rushes_participated'],
			'passed_exams_registered': ['# passed exams / registered', 'passed_exams_registered'],
			'final_exam_validated': ['final exam validated?', 'final_exam_validated'],
			'last_validated_project': ['last validated project', 'last_validated_project'],
			'validated_projects': ['# validated projects', 'validated_projects'],
			// Personal info
			'age': ['age'],
			'gender': ['gender'],
			'coding_level': ['coding level', 'coding_level'],
			'context': ['context']
		}

		for (const [field, variants] of Object.entries(studentMapping)) {
			for (const variant of variants) {
				const index = normalizedHeaders.indexOf(variant.toLowerCase())
				if (index !== -1) {
					indices[field] = index
					console.log(`✅ Found ${field} at index ${index} (${variant})`)
					break
				}
			}
		}
	}

	if (tableType === 'exam_grades') {
		// Map exam columns
		const examMapping = {
			'username': ['username', 'login'],
			'uuid': ['uuid'],
			'exam00': ['exam 00', 'exam00'],
			'exam01': ['exam 01', 'exam01'],
			'exam02': ['exam 02', 'exam02'],
			'final_exam': ['final exam', 'final_exam', 'finalexam']
		}

		for (const [field, variants] of Object.entries(examMapping)) {
			for (const variant of variants) {
				const index = normalizedHeaders.indexOf(variant.toLowerCase())
				if (index !== -1) {
					indices[field] = index
					console.log(`✅ Found ${field} at index ${index} (${variant})`)
					break
				}
			}
		}
	}

	if (tableType === 'rush_scores') {
		// Map rush columns
		const rushMapping = {
			'username': ['username', 'login'],
			'uuid': ['uuid'],
			'square': ['square'],
			'sky_scraper': ['sky scraper', 'skyscraper'],
			'rosetta_stone': ['rosetta stone', 'rosettastone']
		}

		for (const [field, variants] of Object.entries(rushMapping)) {
			for (const variant of variants) {
				const index = normalizedHeaders.indexOf(variant.toLowerCase())
				if (index !== -1) {
					indices[field] = index
					console.log(`✅ Found ${field} at index ${index} (${variant})`)
					break
				}
			}
		}
	}

	console.log('📋 Final indices for', tableType, ':', indices)
	return indices
}

// Helper function to parse numeric values
function parseNumericValue(value: string | undefined | null): number | null {
	if (!value || value.trim() === '' || value.toLowerCase() === 'null') return null
	const parsed = parseFloat(value)
	return isNaN(parsed) ? null : parsed
}

// Helper function to parse boolean values
function parseBooleanValue(value: string | undefined | null): boolean {
	if (!value || value.trim() === '' || value.toLowerCase() === 'null') return false
	const lowerValue = value.toLowerCase().trim()
	return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'validated'
}

// Generate UUID from string
function generateUUIDFromString(str: string): string {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = ((hash << 5) - hash) + char
		hash = hash & hash
	}

	const positiveHash = Math.abs(hash).toString(16).padStart(8, '0')
	return `${positiveHash.substring(0, 8)}-${positiveHash.substring(0, 4)}-4${positiveHash.substring(1, 4)}-8${positiveHash.substring(2, 5)}-${positiveHash.padEnd(12, '0').substring(0, 12)}`
}

// Enhanced student import with HTML name parsing and email generation
async function importToStudents(data: string[][], columnIndices: Record<string, number>): Promise<ImportStats> {
	const [, ...rows] = data
	const stats: ImportStats = { total_rows: rows.length, created: 0, updated: 0, errors: 0 }
	const errors: string[] = []

	console.log('🏫 Importing students with enhanced data, found columns:', Object.keys(columnIndices))

	// Enhanced HTML parsing function
	function extractNameAndImage(nameField: string): { name: string, imageUrl: string | null } {
		if (!nameField || typeof nameField !== 'string') {
			return { name: 'Unknown', imageUrl: null }
		}

		console.log('🔍 Processing name field:', nameField)

		// Check if it contains HTML like: <a target=_blank href=https://...>Name</a>
		if (nameField.includes('<a') && nameField.includes('href')) {
			console.log('📝 Found HTML in name field')

			// Extract image URL - handle various formats
			let imageUrl = null

			// Pattern 1: href="url" (with quotes)
			let urlMatch = nameField.match(/href="([^"]*)"/)
			if (urlMatch) {
				imageUrl = urlMatch[1]
				console.log('🎯 Found URL with double quotes:', imageUrl)
			}

			// Pattern 2: href='url' (with single quotes)
			if (!imageUrl) {
				urlMatch = nameField.match(/href='([^']*)'/)
				if (urlMatch) {
					imageUrl = urlMatch[1]
					console.log('🎯 Found URL with single quotes:', imageUrl)
				}
			}

			// Pattern 3: href=url (no quotes) - like your example
			if (!imageUrl) {
				urlMatch = nameField.match(/href=([^\s>]*)/);
				if (urlMatch) {
					imageUrl = urlMatch[1]
					console.log('🎯 Found URL without quotes:', imageUrl)
				}
			}

			// Extract name content between > and </a>
			let extractedName = null
			const nameMatch = nameField.match(/>([^<]+)<\/a>/)
			if (nameMatch) {
				extractedName = nameMatch[1].trim()
				console.log('📛 Extracted name:', extractedName)
			}

			// If no name found with </a>, try other patterns
			if (!extractedName) {
				// Try to extract everything after the last >
				const fallbackMatch = nameField.match(/>([^<>]+)(?:<|$)/)
				if (fallbackMatch) {
					extractedName = fallbackMatch[1].trim()
					console.log('📛 Fallback name extraction:', extractedName)
				}
			}

			// Final fallback: strip all HTML tags
			if (!extractedName) {
				extractedName = nameField.replace(/<[^>]*>/g, '').trim()
				console.log('📛 Strip HTML name extraction:', extractedName)
			}

			console.log('✅ Final extraction result:', { name: extractedName, imageUrl })

			return {
				name: extractedName || 'Unknown',
				imageUrl: imageUrl
			}
		}

		console.log('❌ No HTML found, returning as plain text')
		// If no HTML, return as is
		return { name: nameField.trim(), imageUrl: null }
	}

	// Generate email function
	function generateEmail(username: string, providedEmail?: string): string {
		if (providedEmail && providedEmail.trim() !== '' && providedEmail.includes('@')) {
			return providedEmail.trim().toLowerCase()
		}

		// Generate default email: username@learner.42.tech
		const cleanUsername = username.toLowerCase().replace(/[^a-z0-9.-]/g, '')
		return `${cleanUsername}@learner.42.tech`
	}

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]

		if (row.every(cell => !cell || cell.trim() === '')) {
			continue
		}

		try {
			const username = row[columnIndices.username]?.trim()?.toLowerCase()
			const rawName = row[columnIndices.name]?.trim()
			const providedEmail = row[columnIndices.email]?.trim()
			const uuid = row[columnIndices.uuid]?.trim() || generateUUIDFromString(username || `student_${i}`)

			console.log(`👤 Processing student ${i + 2}: ${username} -> Raw name: "${rawName}"`)

			if (!username || !rawName) {
				const missing = []
				if (!username) missing.push('username')
				if (!rawName) missing.push('name')

				const errorMsg = `Row ${i + 2}: Missing required fields: ${missing.join(', ')}`
				errors.push(errorMsg)
				console.log('❌', errorMsg)
				stats.errors++
				continue
			}

			// Extract name and image from HTML
			const nameData = extractNameAndImage(rawName)
			const cleanName = nameData.name || username
			const profileImageUrl = nameData.imageUrl

			// Generate email
			const email = generateEmail(username, providedEmail)

			console.log(`📧 Generated email for ${username}: ${email}`)
			console.log(`🖼️ Extracted image for ${username}: ${profileImageUrl || 'none'}`)
			console.log(`📛 Clean name for ${username}: ${cleanName}`)

			// Build comprehensive student data object
			const studentData: any = {
				uuid,
				username,
				name: cleanName,
				email: email,
				profile_image_url: profileImageUrl, // Store the extracted image URL
				// Performance metrics
				blocks: parseNumericValue(row[columnIndices.blocks]) || 0,
				level: parseNumericValue(row[columnIndices.level]) || 0.00,
				votes_given: parseNumericValue(row[columnIndices.votes_given]) || 0,
				votes_received: parseNumericValue(row[columnIndices.votes_received]) || 0,
				voters: parseNumericValue(row[columnIndices.voters]) || 0,
				reviewee: parseNumericValue(row[columnIndices.reviewee]) || 0,
				reviewer: parseNumericValue(row[columnIndices.reviewer]) || 0,
				feedbacks_received: parseNumericValue(row[columnIndices.feedbacks_received]) || 0.00,
				performance: parseNumericValue(row[columnIndices.performance]) || 0.00,
				communication: parseNumericValue(row[columnIndices.communication]) || 0.00,
				professionalism: parseNumericValue(row[columnIndices.professionalism]) || 0.00,
				// Project tracking
				validated_rushes_participated: row[columnIndices.validated_rushes_participated]?.trim() || null,
				passed_exams_registered: row[columnIndices.passed_exams_registered]?.trim() || null,
				final_exam_validated: parseBooleanValue(row[columnIndices.final_exam_validated]),
				last_validated_project: row[columnIndices.last_validated_project]?.trim() || null,
				validated_projects: parseNumericValue(row[columnIndices.validated_projects]) || 0,
				// Personal info
				age: parseNumericValue(row[columnIndices.age]) || null,
				gender: row[columnIndices.gender]?.trim() || null,
				coding_level: row[columnIndices.coding_level]?.trim() || null,
				context: row[columnIndices.context]?.trim() || null
			}

			// Remove null/undefined values to avoid database issues
			Object.keys(studentData).forEach(key => {
				if (studentData[key] === null || studentData[key] === undefined) {
					delete studentData[key]
				}
			})

			console.log('💾 Student data to save:', {
				username: studentData.username,
				name: studentData.name,
				email: studentData.email,
				profile_image_url: studentData.profile_image_url,
				level: studentData.level,
				performance: studentData.performance
			})

			// Check if student exists
			const { data: existingStudent, error: selectError } = await supabase
				.from('students')
				.select('id')
				.eq('username', username)
				.maybeSingle()

			if (selectError) {
				const errorMsg = `Row ${i + 2}: Database error: ${selectError.message}`
				errors.push(errorMsg)
				console.log('❌', errorMsg)
				stats.errors++
				continue
			}

			if (existingStudent) {
				const { error: updateError } = await supabase
					.from('students')
					.update(studentData)
					.eq('username', username)

				if (updateError) {
					const errorMsg = `Row ${i + 2}: Update failed: ${updateError.message}`
					errors.push(errorMsg)
					console.log('❌', errorMsg)
					stats.errors++
				} else {
					stats.updated++
					console.log('✅ Updated student:', username, 'with image:', profileImageUrl ? 'YES' : 'NO')
				}
			} else {
				const { error: insertError } = await supabase
					.from('students')
					.insert([studentData])

				if (insertError) {
					const errorMsg = `Row ${i + 2}: Insert failed: ${insertError.message}`
					errors.push(errorMsg)
					console.log('❌', errorMsg)
					stats.errors++
				} else {
					stats.created++
					console.log('✅ Created student:', username, 'with image:', profileImageUrl ? 'YES' : 'NO')
				}
			}

		} catch (error) {
			const errorMsg = `Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
			errors.push(errorMsg)
			console.log('❌', errorMsg)
			stats.errors++
		}
	}

	if (errors.length > 0) {
		console.log('🚨 Students import errors:', errors.slice(0, 5))
	}

	console.log('📊 Import completed:', {
		total_rows: stats.total_rows,
		created: stats.created,
		updated: stats.updated,
		errors: stats.errors
	})

	return stats
}

// Import to exam_grades table (unchanged)
async function importToExamGrades(data: string[][], columnIndices: Record<string, number>): Promise<ImportStats> {
	const [, ...rows] = data
	const stats: ImportStats = { total_rows: 0, created: 0, updated: 0, errors: 0 }
	const errors: string[] = []

	const examFields = ['exam00', 'exam01', 'exam02', 'final_exam']

	console.log('📝 Importing exam grades, available exams:', examFields.filter(field => columnIndices[field] !== undefined))

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]

		if (row.every(cell => !cell || cell.trim() === '')) {
			continue
		}

		try {
			const username = row[columnIndices.username]?.trim()?.toLowerCase()

			if (!username) {
				continue
			}

			// Get student UUID (not ID, since foreign key is to UUID)
			const { data: student, error: studentError } = await supabase
				.from('students')
				.select('uuid')
				.eq('username', username)
				.maybeSingle()

			if (studentError || !student) {
				const errorMsg = `Row ${i + 2}: Student ${username} not found`
				errors.push(errorMsg)
				stats.errors++
				continue
			}

			// Process each exam grade
			for (const examField of examFields) {
				if (columnIndices[examField] === undefined) continue

				const gradeValue = row[columnIndices[examField]]?.trim()

				// Skip empty, null, or zero grades
				if (!gradeValue || gradeValue === '' || gradeValue === '0' || gradeValue.toLowerCase() === 'null') continue

				const grade = parseFloat(gradeValue)
				if (isNaN(grade) || grade <= 0) continue

				stats.total_rows++

				console.log(`📊 Processing ${examField} for ${username}: ${grade}`)

				const gradeRecord = {
					student_id: student.uuid, // Use UUID since that's what the FK references
					exam_name: examField,
					grade: grade,
					validated: grade >= 60,
					max_grade: 100
				}

				// Check if grade exists
				const { data: existingGrade, error: gradeError } = await supabase
					.from('exam_grades')
					.select('id')
					.eq('student_id', student.uuid)
					.eq('exam_name', examField)
					.maybeSingle()

				if (gradeError) {
					const errorMsg = `Row ${i + 2}, ${examField}: Error checking grade: ${gradeError.message}`
					errors.push(errorMsg)
					stats.errors++
					continue
				}

				if (existingGrade) {
					const { error: updateError } = await supabase
						.from('exam_grades')
						.update(gradeRecord)
						.eq('student_id', student.uuid)
						.eq('exam_name', examField)

					if (updateError) {
						const errorMsg = `Row ${i + 2}, ${examField}: Update failed: ${updateError.message}`
						errors.push(errorMsg)
						stats.errors++
					} else {
						stats.updated++
						console.log(`✅ Updated ${examField} for ${username}: ${grade}`)
					}
				} else {
					const { error: insertError } = await supabase
						.from('exam_grades')
						.insert([gradeRecord])

					if (insertError) {
						const errorMsg = `Row ${i + 2}, ${examField}: Insert failed: ${insertError.message}`
						errors.push(errorMsg)
						stats.errors++
					} else {
						stats.created++
						console.log(`✅ Created ${examField} for ${username}: ${grade}`)
					}
				}
			}

		} catch (error) {
			const errorMsg = `Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
			errors.push(errorMsg)
			stats.errors++
		}
	}

	return stats
}

// Import to rush_scores table
async function importToRushScores(data: string[][], columnIndices: Record<string, number>): Promise<ImportStats> {
	const [, ...rows] = data
	const stats: ImportStats = { total_rows: 0, created: 0, updated: 0, errors: 0 }
	const errors: string[] = []

	const rushFields = {
		'square': 'square',
		'sky_scraper': 'sky_scraper',
		'rosetta_stone': 'rosetta_stone'
	}

	console.log('🏆 Importing rush scores, available projects:', Object.keys(rushFields).filter(field => columnIndices[field] !== undefined))

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]

		if (row.every(cell => !cell || cell.trim() === '')) {
			continue
		}

		try {
			const username = row[columnIndices.username]?.trim()?.toLowerCase()

			if (!username) {
				continue
			}

			// Get student UUID
			const { data: student, error: studentError } = await supabase
				.from('students')
				.select('uuid')
				.eq('username', username)
				.maybeSingle()

			if (studentError || !student) {
				const errorMsg = `Row ${i + 2}: Student ${username} not found`
				errors.push(errorMsg)
				stats.errors++
				continue
			}

			// Process each rush project score
			for (const [rushField, projectName] of Object.entries(rushFields)) {
				if (columnIndices[rushField] === undefined) continue

				const scoreValue = row[columnIndices[rushField]]?.trim()

				// Skip empty, null, or zero scores
				if (!scoreValue || scoreValue === '' || scoreValue === '0' || scoreValue.toLowerCase() === 'null') continue

				const score = parseFloat(scoreValue)
				if (isNaN(score) || score <= 0) continue

				stats.total_rows++

				console.log(`🏆 Processing ${projectName} for ${username}: ${score}`)

				const scoreRecord = {
					student_id: student.uuid,
					project_name: projectName,
					score: score
				}

				// Check if score exists
				const { data: existingScore, error: scoreError } = await supabase
					.from('rush_scores')
					.select('id')
					.eq('student_id', student.uuid)
					.eq('project_name', projectName)
					.maybeSingle()

				if (scoreError) {
					const errorMsg = `Row ${i + 2}, ${projectName}: Error checking score: ${scoreError.message}`
					errors.push(errorMsg)
					stats.errors++
					continue
				}

				if (existingScore) {
					const { error: updateError } = await supabase
						.from('rush_scores')
						.update(scoreRecord)
						.eq('student_id', student.uuid)
						.eq('project_name', projectName)

					if (updateError) {
						const errorMsg = `Row ${i + 2}, ${projectName}: Update failed: ${updateError.message}`
						errors.push(errorMsg)
						stats.errors++
					} else {
						stats.updated++
						console.log(`✅ Updated ${projectName} for ${username}: ${score}`)
					}
				} else {
					const { error: insertError } = await supabase
						.from('rush_scores')
						.insert([scoreRecord])

					if (insertError) {
						const errorMsg = `Row ${i + 2}, ${projectName}: Insert failed: ${insertError.message}`
						errors.push(errorMsg)
						stats.errors++
					} else {
						stats.created++
						console.log(`✅ Created ${projectName} for ${username}: ${score}`)
					}
				}
			}

		} catch (error) {
			const errorMsg = `Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
			errors.push(errorMsg)
			stats.errors++
		}
	}

	return stats
}

// Enhanced smart import function
async function smartImport(data: string[][]): Promise<ImportResult> {
	const [headers] = data
	console.log('CSV Headers:', headers)

	// Detect which tables this CSV should populate
	const detectedTables = detectTables(headers)
	console.log('Detected tables:', detectedTables)

	if (detectedTables.length === 0) {
		return {
			success: false,
			message: 'Could not detect any known data structure in CSV headers',
			errors: ['No recognizable columns found. Expected student, exam, or rush data columns.']
		}
	}

	const results: ImportStats[] = []
	const errors: string[] = []

	// Import to each detected table
	for (const tableType of detectedTables) {
		try {
			const columnIndices = getColumnIndices(headers, tableType)
			console.log(`Column indices for ${tableType}:`, columnIndices)

			let tableStats: ImportStats

			switch (tableType) {
				case 'students':
					tableStats = await importToStudents(data, columnIndices)
					break
				case 'exam_grades':
					tableStats = await importToExamGrades(data, columnIndices)
					break
				case 'rush_scores':
					tableStats = await importToRushScores(data, columnIndices)
					break
				default:
					continue
			}

			results.push(tableStats)

		} catch (error) {
			console.error(`Error importing to ${tableType}:`, error)
			errors.push(`Failed to import to ${tableType}: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	// Combine results
	const totalStats = results.reduce(
		(acc, curr) => ({
			total_rows: acc.total_rows + curr.total_rows,
			created: acc.created + curr.created,
			updated: acc.updated + curr.updated,
			errors: acc.errors + curr.errors
		}),
		{ total_rows: 0, created: 0, updated: 0, errors: 0 }
	)

	return {
		success: totalStats.errors === 0,
		message: `Smart import completed. Detected and imported to: ${detectedTables.join(', ')}. 
              Created: ${totalStats.created}, Updated: ${totalStats.updated}, Errors: ${totalStats.errors}`,
		stats: totalStats,
		detectedTables,
		errors: errors.length > 0 ? errors : undefined
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('Enhanced Smart Import API called')

		const session = await getServerSession(authOptions)
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await request.formData()
		const file = formData.get('file') as File

		if (!file) {
			return NextResponse.json({ error: 'Missing file' }, { status: 400 })
		}

		if (!file.name.endsWith('.csv')) {
			return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 })
		}

		const csvText = await file.text()
		const data = parseCSV(csvText)

		if (data.length < 2) {
			return NextResponse.json({ error: 'CSV file must contain headers and at least one data row' }, { status: 400 })
		}

		// Use smart import
		const result = await smartImport(data)
		return NextResponse.json(result)

	} catch (error) {
		console.error('Enhanced smart import error:', error)
		return NextResponse.json(
			{
				success: false,
				message: 'Internal server error',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}
