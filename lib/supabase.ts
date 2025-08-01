import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Student {
  id: string
  uuid: string
  login: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  campus?: string
  level: number
  wallet: number
  correction_points: number
  location?: string
  status: string
  pool_month?: string
  pool_year?: number
  created_at: string
  updated_at: string
}

export interface ExamGrade {
  id: string
  student_id: string
  exam_name: string
  grade: number
  max_grade: number
  exam_date?: string
  created_at: string
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
}

export interface RushTeam {
  id: string
  project_name: string
  team_name: string
  created_at: string
}

export interface RushTeamMember {
  id: string
  team_id: string
  student_id: string
  rating?: number
  feedback?: string
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  email: string
  name: string
  role: string
  google_id?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
