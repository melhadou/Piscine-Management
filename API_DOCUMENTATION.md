# Piscine Management Dashboard - Backend API Documentation

## Overview

This document outlines the API endpoints needed for the Piscine Management Dashboard core features. The backend uses **Next.js App Router** with API routes and Server Actions.

## Technology Stack

- **Frontend**: Next.js 14+ with App Router
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Supabase recommended)
- **Authentication**: NextAuth.js
- **File Storage**: Vercel Blob for CSV uploads

## Database Schema

### Students Table
\`\`\`sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  profile_image_url TEXT,
  level DECIMAL(3,1) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Exam Grades Table
\`\`\`sql
CREATE TABLE exam_grades (
  id SERIAL PRIMARY KEY,
  student_uuid UUID REFERENCES students(uuid) ON DELETE CASCADE,
  exam_name VARCHAR(20) NOT NULL, -- 'exam00', 'exam01', 'exam02', 'final_exam'
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_uuid, exam_name)
);
\`\`\`

### Rush Projects Table
\`\`\`sql
CREATE TABLE rush_projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- 'square', 'skyscraper', 'rosetta_stone'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Rush Teams Table
\`\`\`sql
CREATE TABLE rush_teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  project_name VARCHAR(50) REFERENCES rush_projects(name),
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Rush Team Members Table
\`\`\`sql
CREATE TABLE rush_team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES rush_teams(id) ON DELETE CASCADE,
  student_uuid UUID REFERENCES students(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, student_uuid)
);
\`\`\`

### Notes Table
\`\`\`sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) CHECK (type IN ('student', 'rush_team')) NOT NULL,
  target_id VARCHAR(100) NOT NULL, -- student_uuid or team_id
  target_name VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  note_type VARCHAR(20) CHECK (note_type IN ('general', 'rush_specific')) DEFAULT 'general',
  author_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Staff Table (for authentication)
\`\`\`sql
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## API Endpoints

### 1. Authentication

#### POST /api/auth/login
Staff login with email and password.

**Request:**
\`\`\`json
{
  "email": "staff@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "staff@example.com",
    "name": "Staff Member"
  }
}
\`\`\`

#### POST /api/auth/logout
Logout current user.

#### GET /api/auth/me
Get current authenticated user info.

### 2. Students Management

#### GET /api/students
Get all students with search and filtering.

**Query Parameters:**
- `search` (string): Search by name or username
- `exam_filter` (string): 'validated', 'not_validated', 'all'
- `rush_filter` (string): 'participated', 'not_participated', 'all'
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Response:**
\`\`\`json
{
  "students": [
    {
      "uuid": "f11517a7-50a0-410e-bdb4-5910269ebbda",
      "username": "yasser.al-agoul",
      "name": "Yasser AL-AGOUL",
      "email": "yk198620@gmail.com",
      "profile_image_url": "https://example.com/image.jpg",
      "level": 4.3,
      "exam_grades": {
        "exam00": { "grade": 0, "validated": false },
        "exam01": { "grade": 30, "validated": false },
        "exam02": { "grade": 60, "validated": false },
        "final_exam": { "grade": 31, "validated": false }
      },
      "rush_participation": [
        {
          "project_name": "square",
          "team_name": "Team Alpha",
          "grade": 85,
          "team_members": ["john.doe", "jane.smith"]
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
\`\`\`

#### GET /api/students/\[uuid\]
Get detailed student profile.

**Response:**
\`\`\`json
{
  "student": {
    "uuid": "f11517a7-50a0-410e-bdb4-5910269ebbda",
    "username": "yasser.al-agoul",
    "name": "Yasser AL-AGOUL",
    "email": "yk198620@gmail.com",
    "profile_image_url": "https://example.com/image.jpg",
    "level": 4.3,
    "exam_grades": [
      {
        "exam_name": "exam00",
        "grade": 0,
        "validated": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "rush_teams": [
      {
        "id": 1,
        "team_name": "Team Alpha",
        "project_name": "square",
        "grade": 85,
        "team_members": [
          {
            "uuid": "other-uuid",
            "username": "john.doe",
            "name": "John DOE"
          }
        ],
        "created_at": "2024-01-05T00:00:00Z"
      }
    ],
    "notes": [
      {
        "id": 1,
        "title": "Strong problem-solving skills",
        "content": "Demonstrated excellent abilities...",
        "note_type": "general",
        "author_name": "John Doe",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
\`\`\`

### 3. CSV Import

#### POST /api/import/students
Import initial student data from CSV.

**Request:** Multipart form data
- `file`: CSV file
- `type`: "initial" or "update"

**CSV Format:**
\`\`\`csv
uuid,username,name,email,profile_image_url
f11517a7-50a0-410e-bdb4-5910269ebbda,yasser.al-agoul,Yasser AL-AGOUL,yk198620@gmail.com,https://example.com/image.jpg
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Successfully imported 45 students",
  "stats": {
    "total_rows": 45,
    "created": 40,
    "updated": 5,
    "errors": 0
  },
  "errors": []
}
\`\`\`

#### POST /api/import/grades
Import exam grades from CSV.

**CSV Format:**
\`\`\`csv
uuid,exam_name,grade,validated
f11517a7-50a0-410e-bdb4-5910269ebbda,exam00,45,false
f11517a7-50a0-410e-bdb4-5910269ebbda,exam01,78,true
\`\`\`

#### POST /api/import/rush-teams
Import rush team assignments from CSV.

**CSV Format:**
\`\`\`csv
team_name,project_name,member1_uuid,member2_uuid,member3_uuid,member4_uuid,grade
Team Alpha,square,uuid1,uuid2,uuid3,uuid4,85
\`\`\`

### 4. Notes Management

#### GET /api/notes
Get notes with filtering.

**Query Parameters:**
- `target_id` (string): Filter by student UUID or team ID
- `type` (string): 'student' or 'rush_team'
- `note_type` (string): 'general' or 'rush_specific'

#### POST /api/notes
Create a new note.

**Request:**
\`\`\`json
{
  "type": "student",
  "target_id": "f11517a7-50a0-410e-bdb4-5910269ebbda",
  "target_name": "Yasser AL-AGOUL",
  "title": "Performance Review",
  "content": "Student shows excellent progress...",
  "note_type": "general"
}
\`\`\`

#### PUT /api/notes/\[id\]
Update a note.

#### DELETE /api/notes/\[id\]
Delete a note.

### 5. Dashboard Analytics

#### GET /api/dashboard/stats
Get dashboard statistics.

**Response:**
\`\`\`json
{
  "total_students": 150,
  "final_exam_validated": 45,
  "average_exam_grade": 72.3,
  "rush_participation_rate": 85.2,
  "grade_distribution": {
    "0-20": 5,
    "21-40": 15,
    "41-60": 35,
    "61-80": 60,
    "81-100": 35
  }
}
\`\`\`

### 6. Data Export

#### GET /api/export/students
Export student data as CSV.

**Query Parameters:**
- `filter`: 'all', 'validated', 'recommended'
- `include_grades`: boolean
- `include_rush`: boolean

**Response:** CSV file download

### 7. Rush Management

#### GET /api/rush/teams/\[teamId\]/notes
Get all notes for a rush team (accessible from any team member's profile).

#### POST /api/rush/teams/\[teamId\]/notes
Add a note to a rush team.

## Next.js Project Structure

\`\`\`
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── me/route.ts
│   ├── students/
│   │   ├── route.ts                 # GET, POST /api/students
│   │   └── [uuid]/
│   │       └── route.ts             # GET /api/students/[uuid]
│   ├── notes/
│   │   ├── route.ts                 # GET, POST /api/notes
│   │   └── [id]/
│   │       └── route.ts             # PUT, DELETE /api/notes/[id]
│   ├── import/
│   │   ├── students/route.ts        # POST /api/import/students
│   │   ├── grades/route.ts          # POST /api/import/grades
│   │   └── rush-teams/route.ts      # POST /api/import/rush-teams
│   ├── export/
│   │   └── students/route.ts        # GET /api/export/students
│   ├── dashboard/
│   │   └── stats/route.ts           # GET /api/dashboard/stats
│   └── rush/
│       └── teams/
│           └── [teamId]/
│               └── notes/route.ts   # GET, POST /api/rush/teams/[teamId]/notes
├── actions/
│   ├── auth.ts                      # Server Actions for authentication
│   ├── students.ts                  # Server Actions for student management
│   ├── notes.ts                     # Server Actions for notes
│   └── import.ts                    # Server Actions for CSV imports
├── dashboard/
│   └── page.tsx                     # Main dashboard
├── students/
│   ├── page.tsx                     # Students list
│   └── [uuid]/
│       └── page.tsx                 # Student profile
├── notes/
│   └── page.tsx                     # Notes management
├── import/
│   └── page.tsx                     # CSV import interface
└── lib/
    ├── db.ts                        # Database connection
    ├── auth.ts                      # Authentication utilities
    ├── csv-parser.ts                # CSV processing
    └── utils.ts                     # Utility functions
\`\`\`

## Server Actions (for better UX)

\`\`\`typescript
// app/actions/students.ts
export async function searchStudents(formData: FormData)
export async function exportStudents(filters: any)

// app/actions/notes.ts
export async function createNote(formData: FormData)
export async function updateNote(id: number, formData: FormData)

// app/actions/import.ts
export async function importStudentCSV(formData: FormData)
export async function importGradesCSV(formData: FormData)
export async function importRushTeamsCSV(formData: FormData)

// app/actions/auth.ts
export async function login(formData: FormData)
export async function logout()
\`\`\`

## Environment Variables

\`\`\`env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# File Storage (for CSV uploads)
BLOB_READ_WRITE_TOKEN="your-blob-token"
\`\`\`

## CSV Templates

### Student Data Template
\`\`\`csv
uuid,username,name,email,profile_image_url
f11517a7-50a0-410e-bdb4-5910269ebbda,yasser.al-agoul,Yasser AL-AGOUL,yk198620@gmail.com,https://example.com/image.jpg
\`\`\`

### Exam Grades Template
\`\`\`csv
uuid,exam_name,grade,validated
f11517a7-50a0-410e-bdb4-5910269ebbda,exam00,45,false
f11517a7-50a0-410e-bdb4-5910269ebbda,exam01,78,true
f11517a7-50a0-410e-bdb4-5910269ebbda,exam02,82,true
f11517a7-50a0-410e-bdb4-5910269ebbda,final_exam,89,true
\`\`\`

### Rush Teams Template
\`\`\`csv
team_name,project_name,member1_uuid,member2_uuid,member3_uuid,member4_uuid,grade
Team Alpha,square,uuid1,uuid2,uuid3,uuid4,85
Team Beta,skyscraper,uuid5,uuid6,uuid7,uuid8,92
Team Gamma,rosetta_stone,uuid9,uuid10,uuid11,uuid12,78
\`\`\`

This streamlined API documentation focuses on the 8 core features you specified, with a clean Next.js full-stack implementation structure.
