// lib/supabase.ts - Update this file if it exists, or create it

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(
	supabaseUrl,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Database types (you can generate these with Supabase CLI)
export type Database = {
	public: {
		Tables: {
			students: {
				Row: {
					id: string
					uuid: string
					username: string
					name: string
					email: string
					profile_image_url: string | null
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					uuid: string
					username: string
					name: string
					email: string
					profile_image_url?: string | null
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					uuid?: string
					username?: string
					name?: string
					email?: string
					profile_image_url?: string | null
					created_at?: string
					updated_at?: string
				}
			}
			exams: {
				Row: {
					id: string
					name: string
					description: string | null
					max_grade: number
					created_at: string
				}
				Insert: {
					id?: string
					name: string
					description?: string | null
					max_grade?: number
					created_at?: string
				}
				Update: {
					id?: string
					name?: string
					description?: string | null
					max_grade?: number
					created_at?: string
				}
			}
			student_grades: {
				Row: {
					id: string
					student_id: string
					exam_id: string
					grade: number
					validated: boolean
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					student_id: string
					exam_id: string
					grade: number
					validated?: boolean
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					student_id?: string
					exam_id?: string
					grade?: number
					validated?: boolean
					created_at?: string
					updated_at?: string
				}
			}
			rush_projects: {
				Row: {
					id: string
					name: string
					description: string | null
					created_at: string
				}
				Insert: {
					id?: string
					name: string
					description?: string | null
					created_at?: string
				}
				Update: {
					id?: string
					name?: string
					description?: string | null
					created_at?: string
				}
			}
			rush_teams: {
				Row: {
					id: string
					team_name: string
					project_id: string
					grade: number | null
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					team_name: string
					project_id: string
					grade?: number | null
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					team_name?: string
					project_id?: string
					grade?: number | null
					created_at?: string
					updated_at?: string
				}
			}
			rush_team_members: {
				Row: {
					id: string
					team_id: string
					student_id: string
					created_at: string
				}
				Insert: {
					id?: string
					team_id: string
					student_id: string
					created_at?: string
				}
				Update: {
					id?: string
					team_id?: string
					student_id?: string
					created_at?: string
				}
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
	}
}
