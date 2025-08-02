// types/database.ts - Enhanced Student interface with all CSV fields

export interface Student {
	// Basic identifiers
	id?: string
	uuid: string
	login: string
	firstName: string
	lastName: string
	email: string
	profileImageUrl?: string

	// Contact & location
	phone?: string
	campus: string
	cursus: string
	location: string

	// Performance metrics from CSV
	level: number
	blocks?: number
	votes_given?: number
	votes_received?: number
	voters?: number
	reviewee?: number
	reviewer?: number
	feedbacks_received?: number
	performance?: number
	communication?: number
	professionalism?: number

	// Project tracking
	validated_rushes_participated?: string // e.g., "2/3"
	passed_exams_registered?: string // e.g., "3/4"
	final_exam_validated?: boolean
	last_validated_project?: string
	validated_projects?: number

	// Personal information
	age?: number
	gender?: string
	coding_level?: string
	context?: string

	// Legacy compatibility fields
	wallet: number
	correctionPoint: number

	// Exam data
	grades?: {
		[key: string]: {
			grade: number
			status: string
		}
	}
	examGrades?: {
		exam00: number
		exam01: number
		exam02: number
		finalExam: number
	}
	finalExamValidated?: boolean

	// Rush data
	rushRating?: number
	rushEvaluations?: Record<string, { rating: number, feedback: string }>
	rushScores?: Record<string, number> // project_name -> score

	// Notes
	notes?: Array<{
		id: string
		content: string
		category: string
		priority: string
		author: string
		createdAt: string
	}>

	// Data availability flags
	hasExamData?: boolean
	hasRushData?: boolean

	// Computed fields
	rushesValidated?: string // e.g., "2/3"
	validatedProjects?: number
	codingLevel?: string // Computed from level or coding_level

	// Timestamps
	created_at?: string
	updated_at?: string
}

export interface Note {
	id: string
	student_id: string
	title: string
	content: string
	category: string
	priority: string
	author: string
	created_at: string
	updated_at: string
	students?: {
		id: string
		uuid: string
		username: string
		name: string
		email: string
	}
}

export interface ExamGrade {
	id: string
	student_id: string
	exam_name: string
	grade: number
	validated: boolean
	max_grade: number
	exam_date?: string
	created_at: string
	updated_at: string
}

export interface RushScore {
	id: string
	student_id: string
	project_name: string // 'square', 'sky_scraper', 'rosetta_stone'
	score: number
	created_at: string
	updated_at: string
}

export interface RushTeam {
	id: string
	team_name: string
	project_name: string
	grade?: number
	created_at: string
}

export interface RushTeamMember {
	id: string
	student_id: string
	team_id: string
	rating?: number
	feedback?: string
	individual_score?: number
	project_type?: string
	created_at: string
	updated_at: string
}

export interface Staff {
	id: string
	name: string
	email: string
	role: string
	avatar_url?: string
	google_id?: string
	created_at: string
	updated_at: string
}

// Enhanced filtering and summary interfaces
export interface StudentSummary {
	totalStudents: number
	withExamData: number
	withRushData: number
	activeStudents: number
	averageLevel?: string
	averagePerformance?: string
	excellentStudents?: number
	needsAttentionStudents?: number
}

export interface StudentFilters {
	search?: string
	status?: 'all' | 'excellent' | 'good' | 'average' | 'needs-attention' | 'inactive'
	level?: 'all' | 'high' | 'medium' | 'low'
	performance?: 'all' | 'high' | 'medium' | 'low'
	rush?: 'all' | 'excellent' | 'good' | 'average' | 'needs-improvement' | 'no-rating'
	gender?: 'all' | 'male' | 'female' | 'other'
	codingLevel?: 'all' | 'beginner' | 'intermediate' | 'advanced'
}

export interface ImportStats {
	total_rows: number
	created: number
	updated: number
	errors: number
}

export interface ImportResult {
	success: boolean
	message: string
	stats?: ImportStats
	errors?: string[]
	detectedTables?: string[]
}
