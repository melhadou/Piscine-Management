# Piscine Management Dashboard API Documentation

## Overview
This document outlines the complete API structure and database schema for the Piscine Management Dashboard - a comprehensive system for managing student evaluations, notes, and rush assessments.

## Technology Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Backend**: Next.js API Routes and Server Actions
- **Database**: Supabase PostgreSQL
- **Authentication**: NextAuth.js v5 with Google OAuth
- **File Storage**: Vercel Blob for CSV imports
- **Styling**: Tailwind CSS with shadcn/ui components

## 🏗️ Backend Architecture

This project uses **Next.js 15 App Router** as a full-stack solution with:
- **Database**: Supabase PostgreSQL
- **Authentication**: NextAuth.js v5 with Google OAuth
- **File Storage**: Vercel Blob for CSV imports
- **API**: Next.js API Routes + Server Actions

## 📊 Database Schema

### Core Tables

\`\`\`sql
-- Staff table for authentication
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  google_id VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid VARCHAR(50) UNIQUE NOT NULL,
  login VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  campus VARCHAR(100),
  level DECIMAL(4,2) DEFAULT 0.00,
  wallet INTEGER DEFAULT 0,
  correction_points INTEGER DEFAULT 5,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  pool_month VARCHAR(20),
  pool_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_login ON students(login);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_pool ON students(pool_month, pool_year);

-- Exam grades table
CREATE TABLE exam_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_name VARCHAR(100) NOT NULL,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  max_grade INTEGER DEFAULT 100,
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exam_grades_student ON exam_grades(student_id);
CREATE INDEX idx_exam_grades_exam ON exam_grades(exam_name);
CREATE INDEX idx_exam_grades_date ON exam_grades(exam_date);

-- Notes table with categories and priorities
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  priority VARCHAR(20) DEFAULT 'medium',
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_student ON notes(student_id);
CREATE INDEX idx_notes_category ON notes(category);
CREATE INDEX idx_notes_priority ON notes(priority);
CREATE INDEX idx_notes_author ON notes(author);

-- Rush teams table
CREATE TABLE rush_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name VARCHAR(100) NOT NULL,
  team_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rush_teams_project ON rush_teams(project_name);

-- Rush team members table
CREATE TABLE rush_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES rush_teams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 4),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, student_id)
);

CREATE INDEX idx_rush_members_team ON rush_team_members(team_id);
CREATE INDEX idx_rush_members_student ON rush_team_members(student_id);
CREATE INDEX idx_rush_members_rating ON rush_team_members(rating);
\`\`\`

## 🔌 API Endpoints

### Students API

#### GET /api/students
Get all students with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `search` (string): Search by name, login, or email
- `status` (string): Filter by status
- `pool_month` (string): Filter by pool month
- `pool_year` (number): Filter by pool year
- `rush_rating` (number): Filter by rush rating (1-4)

**Response:**
\`\`\`json
{
  "students": [
    {
      "id": "uuid",
      "uuid": "student-uuid",
      "login": "jdoe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@student.42.fr",
      "phone": "+1234567890",
      "campus": "Paris",
      "level": 5.42,
      "wallet": 150,
      "correction_points": 8,
      "location": "e1r3p4",
      "status": "active",
      "pool_month": "September",
      "pool_year": 2024,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
\`\`\`

#### GET /api/students/[id]
Get a specific student by ID with related data.

**Response:**
\`\`\`json
{
  "student": {
    "id": "uuid",
    "uuid": "student-uuid",
    "login": "jdoe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@student.42.fr",
    "exam_grades": [
      {
        "id": "uuid",
        "exam_name": "C Exam 01",
        "grade": 85,
        "max_grade": 100,
        "exam_date": "2024-01-15"
      }
    ],
    "notes": [
      {
        "id": "uuid",
        "title": "Great progress",
        "content": "Student shows excellent understanding",
        "category": "academic",
        "priority": "high",
        "author": "Staff Member",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "rush_evaluations": [
      {
        "team_name": "Team Alpha",
        "project_name": "Rush 00",
        "rating": 4,
        "feedback": "Excellent teamwork"
      }
    ]
  }
}
\`\`\`

#### POST /api/students
Create a new student.

**Request Body:**
\`\`\`json
{
  "uuid": "student-uuid",
  "login": "jdoe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@student.42.fr",
  "phone": "+1234567890",
  "campus": "Paris",
  "pool_month": "September",
  "pool_year": 2024
}
\`\`\`

#### PUT /api/students/[id]
Update a student.

#### DELETE /api/students/[id]
Delete a student and all related data.

### Notes API

#### GET /api/notes
Get all notes with filtering.

**Query Parameters:**
- `student_id` (uuid): Filter by student
- `category` (string): Filter by category
- `priority` (string): Filter by priority
- `author` (string): Filter by author
- `page` (number): Page number
- `limit` (number): Items per page

#### POST /api/notes
Create a new note.

**Request Body:**
\`\`\`json
{
  "student_id": "uuid",
  "title": "Note title",
  "content": "Note content",
  "category": "academic",
  "priority": "high",
  "author": "Staff Member"
}
\`\`\`

#### PUT /api/notes/[id]
Update a note.

#### DELETE /api/notes/[id]
Delete a note.

### Rush Evaluation API

#### GET /api/rush/teams
Get all rush teams with members.

#### POST /api/rush/teams
Create a new rush team.

**Request Body:**
\`\`\`json
{
  "project_name": "Rush 00",
  "team_name": "Team Alpha",
  "members": [
    {
      "student_id": "uuid",
      "rating": 4,
      "feedback": "Excellent work"
    }
  ]
}
\`\`\`

#### PUT /api/rush/teams/[id]/members/[memberId]
Update a team member's rating and feedback.

#### DELETE /api/rush/teams/[id]
Delete a rush team.

### Dashboard API

#### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
\`\`\`json
{
  "totalStudents": 150,
  "activeStudents": 142,
  "averageLevel": 5.42,
  "totalNotes": 89,
  "recentActivity": [
    {
      "type": "note_added",
      "student_name": "John Doe",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "gradeDistribution": [
    { "range": "0-20", "count": 5 },
    { "range": "21-40", "count": 12 },
    { "range": "41-60", "count": 25 },
    { "range": "61-80", "count": 45 },
    { "range": "81-100", "count": 63 }
  ]
}
\`\`\`

### Import API

#### POST /api/import/csv
Import student data from CSV file.

**Request:** Multipart form data with CSV file

**Response:**
\`\`\`json
{
  "success": true,
  "imported": 150,
  "errors": [],
  "message": "Successfully imported 150 students"
}
\`\`\`

## 🛠️ Server Actions

### Student Actions
\`\`\`typescript
// app/actions/students.ts
export async function createStudent(formData: FormData)
export async function updateStudent(id: string, formData: FormData)
export async function deleteStudent(id: string)
\`\`\`

### Note Actions
\`\`\`typescript
// app/actions/notes.ts
export async function createNote(formData: FormData)
export async function updateNote(id: string, formData: FormData)
export async function deleteNote(id: string)
\`\`\`

### Rush Actions
\`\`\`typescript
// app/actions/rush.ts
export async function createRushTeam(formData: FormData)
export async function updateRushRating(memberId: string, rating: number, feedback: string)
export async function deleteRushTeam(id: string)
\`\`\`

## 🌍 Environment Variables

\`\`\`env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# File Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
\`\`\`

## 📁 Project Structure

\`\`\`
app/
├── api/
│   ├── students/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── notes/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── rush/
│   │   └── teams/route.ts
│   ├── dashboard/
│   │   └── stats/route.ts
│   └── import/
│       └── csv/route.ts
├── actions/
│   ├── students.ts
│   ├── notes.ts
│   └── rush.ts
├── dashboard/
│   └── page.tsx
├── students/
│   ├── page.tsx
│   └── [uuid]/page.tsx
├── notes/
│   └── page.tsx
├── rush-evaluation/
│   └── page.tsx
├── settings/
│   └── page.tsx
└── import/
    └── page.tsx

components/
├── ui/
├── app-sidebar.tsx
├── student-table.tsx
├── stats-cards.tsx
└── grade-distribution.tsx

lib/
├── supabase.ts
├── utils.ts
└── types.ts
\`\`\`

## 🔐 Authentication System

### NextAuth.js Configuration

\`\`\`typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Verify user is authorized staff member
      // Create staff record if doesn't exist
    },
    async session({ session, token }) {
      // Add user role and ID to session
    },
  },
})
\`\`\`

### Session Management

\`\`\`typescript
// lib/auth.ts
export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect("/auth/signin")
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user?.role !== role && session.user?.role !== "admin") {
    redirect("/dashboard")
  }
  return session
}
\`\`\`

## 🚀 Deployment Steps

1. **Create Supabase Project**
   \`\`\`bash
   # Run the SQL schema in Supabase SQL Editor
   \`\`\`

2. **Configure Google OAuth**
   \`\`\`bash
   # Google Cloud Console -> APIs & Services -> Credentials
   # Create OAuth 2.0 Client ID
   # Add authorized redirect URIs
   \`\`\`

3. **Set Environment Variables**
   \`\`\`bash
   # In Vercel dashboard or .env.local
   \`\`\`

4. **Deploy to Vercel**
   \`\`\`bash
   npm run build
   vercel deploy
   \`\`\`

## 📊 Data Flow

1. **Authentication**: Google OAuth → NextAuth.js → Supabase staff table
2. **Student Data**: CSV Import → Validation → Supabase students table
3. **Notes**: Form submission → Server Action → Supabase notes table
4. **Rush Evaluation**: Team creation → Member assignment → Rating submission
5. **Dashboard**: Real-time queries → Statistics calculation → Chart rendering

## 🔒 Security Features

- **Route Protection**: Middleware checks authentication
- **Role-based Access**: Staff and admin roles
- **CSRF Protection**: NextAuth.js built-in protection
- **SQL Injection Prevention**: Supabase parameterized queries
- **XSS Protection**: React built-in sanitization

## 📈 Performance Optimizations

- **Database Indexes**: Optimized queries for large datasets
- **Server Components**: Reduced client-side JavaScript
- **Caching**: Next.js automatic caching for static data
- **Pagination**: Efficient data loading for large tables
- **Lazy Loading**: Components loaded on demand

This documentation provides everything needed to build and deploy a production-ready piscine management system!
