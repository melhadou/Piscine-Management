"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentTable } from "@/components/student-table"
import { Search, Filter, Download, Users } from "lucide-react"

// Mock data for students
const mockStudents = [
  {
    uuid: "1",
    username: "jdoe",
    name: "John Doe",
    email: "john.doe@student.42.fr",
    level: 3.2,
    examGrades: {
      exam00: 85,
      exam01: 78,
      exam02: 92,
      finalExam: 88,
    },
    finalExamValidated: true,
    rushesValidated: "2/3",
    validatedProjects: 15,
    age: 22,
    gender: "Male",
    codingLevel: "Intermediate",
    performance: 85,
    communication: 78,
    professionalism: 92,
    rushEvaluations: {
      "rush-00": { rating: 2, feedback: "Good teamwork, needs improvement in technical skills" },
      "rush-01": { rating: 3, feedback: "Excellent performance, great leadership" },
    },
  },
  {
    uuid: "2",
    username: "asmith",
    name: "Alice Smith",
    email: "alice.smith@student.42.fr",
    level: 4.1,
    examGrades: {
      exam00: 95,
      exam01: 88,
      exam02: 91,
      finalExam: 94,
    },
    finalExamValidated: true,
    rushesValidated: "3/3",
    validatedProjects: 18,
    age: 21,
    gender: "Female",
    codingLevel: "Advanced",
    performance: 95,
    communication: 88,
    professionalism: 91,
    rushEvaluations: {
      "rush-00": { rating: 3, feedback: "Outstanding technical skills and collaboration" },
      "rush-01": { rating: 3, feedback: "Perfect execution, excellent mentor to others" },
    },
  },
  {
    uuid: "3",
    username: "bwilson",
    name: "Bob Wilson",
    email: "bob.wilson@student.42.fr",
    level: 1.8,
    examGrades: {
      exam00: 65,
      exam01: 58,
      exam02: 72,
      finalExam: 45,
    },
    finalExamValidated: false,
    rushesValidated: "1/3",
    validatedProjects: 8,
    age: 24,
    gender: "Male",
    codingLevel: "Beginner",
    performance: 65,
    communication: 58,
    professionalism: 72,
    rushEvaluations: {
      "rush-00": { rating: 1, feedback: "Struggled with basic concepts, needs more practice" },
    },
  },
  {
    uuid: "4",
    username: "cjohnson",
    name: "Carol Johnson",
    email: "carol.johnson@student.42.fr",
    level: 2.9,
    examGrades: {
      exam00: 82,
      exam01: 75,
      exam02: 88,
      finalExam: 79,
    },
    finalExamValidated: true,
    rushesValidated: "2/3",
    validatedProjects: 12,
    age: 23,
    gender: "Female",
    codingLevel: "Intermediate",
    performance: 82,
    communication: 75,
    professionalism: 88,
    rushEvaluations: {},
  },
  {
    uuid: "5",
    username: "dlee",
    name: "David Lee",
    email: "david.lee@student.42.fr",
    level: 3.7,
    examGrades: {
      exam00: 90,
      exam01: 85,
      exam02: 87,
      finalExam: 91,
    },
    finalExamValidated: true,
    rushesValidated: "3/3",
    validatedProjects: 16,
    age: 20,
    gender: "Male",
    codingLevel: "Advanced",
    performance: 90,
    communication: 85,
    professionalism: 87,
    rushEvaluations: {
      "rush-00": { rating: 2, feedback: "Good technical skills, could improve communication" },
      "rush-01": { rating: 3, feedback: "Excellent problem-solving abilities" },
      "rush-02": { rating: 2, feedback: "Solid performance, consistent effort" },
    },
  },
]

export default function StudentsPage() {
  const [students] = useState(mockStudents)
  const [filteredStudents, setFilteredStudents] = useState(mockStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [rushFilter, setRushFilter] = useState("all")

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, statusFilter, levelFilter, rushFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    applyFilters(searchTerm, status, levelFilter, rushFilter)
  }

  const handleLevelFilter = (level: string) => {
    setLevelFilter(level)
    applyFilters(searchTerm, statusFilter, level, rushFilter)
  }

  const handleRushFilter = (rush: string) => {
    setRushFilter(rush)
    applyFilters(searchTerm, statusFilter, levelFilter, rush)
  }

  const getBestRushRating = (student: any) => {
    if (!student.rushEvaluations || Object.keys(student.rushEvaluations).length === 0) {
      return 0
    }
    const ratings = Object.values(student.rushEvaluations).map((e: any) => e.rating)
    return Math.max(...ratings)
  }

  const applyFilters = (search: string, status: string, level: string, rush: string) => {
    let filtered = students

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(search.toLowerCase()) ||
          student.username.toLowerCase().includes(search.toLowerCase()) ||
          student.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Status filter
    if (status !== "all") {
      filtered = filtered.filter((student) => {
        const hasRushSuccess = getBestRushRating(student) === 3

        switch (status) {
          case "selection-ready":
            return student.finalExamValidated && student.level >= 3.0 && hasRushSuccess
          case "exam-passed":
            return student.finalExamValidated && student.level >= 3.0
          case "rush-success":
            return hasRushSuccess && student.level >= 2.5
          case "review":
            return !student.finalExamValidated && student.level >= 2.5
          case "not-recommended":
            return student.level < 2.5 && !student.finalExamValidated
          default:
            return true
        }
      })
    }

    // Level filter
    if (level !== "all") {
      filtered = filtered.filter((student) => {
        switch (level) {
          case "high":
            return student.level >= 4.0
          case "medium":
            return student.level >= 2.0 && student.level < 4.0
          case "low":
            return student.level < 2.0
          default:
            return true
        }
      })
    }

    // Rush filter
    if (rush !== "all") {
      filtered = filtered.filter((student) => {
        const bestRating = getBestRushRating(student)
        switch (rush) {
          case "excellent":
            return bestRating === 3
          case "good":
            return bestRating === 2
          case "needs-improvement":
            return bestRating === 1
          case "no-participation":
            return bestRating === 0
          default:
            return true
        }
      })
    }

    setFilteredStudents(filtered)
  }

  const exportData = () => {
    const csvContent = [
      ["Name", "Username", "Email", "Level", "Final Exam", "Validated", "Best Rush Rating", "Status"].join(","),
      ...filteredStudents.map((student) => {
        const hasRushSuccess = getBestRushRating(student) === 3
        let status = "Not Recommended"

        if (student.finalExamValidated && student.level >= 3.0 && hasRushSuccess) {
          status = "Selection Ready"
        } else if (student.finalExamValidated && student.level >= 3.0) {
          status = "Exam Passed"
        } else if (hasRushSuccess && student.level >= 2.5) {
          status = "Rush Success"
        } else if (!student.finalExamValidated && student.level >= 2.5) {
          status = "Review"
        }

        return [
          student.name,
          student.username,
          student.email,
          student.level,
          student.examGrades.finalExam,
          student.finalExamValidated ? "Yes" : "No",
          getBestRushRating(student),
          status,
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "students-export.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage and evaluate student performance across all metrics</p>
        </div>
        <Button onClick={exportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Active in piscine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selection Ready</CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">✓</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => s.finalExamValidated && s.level >= 3.0 && getBestRushRating(s) === 3).length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for selection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <Badge variant="outline" className="border-yellow-300 text-yellow-700">
              !
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => !s.finalExamValidated && s.level >= 2.5).length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rush Champions</CardTitle>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">★</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter((s) => getBestRushRating(s) === 3).length}</div>
            <p className="text-xs text-muted-foreground">Excellent rush performance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>Search, filter, and manage student evaluations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="selection-ready">Selection Ready</SelectItem>
                  <SelectItem value="exam-passed">Exam Passed</SelectItem>
                  <SelectItem value="rush-success">Rush Success</SelectItem>
                  <SelectItem value="review">Needs Review</SelectItem>
                  <SelectItem value="not-recommended">Not Recommended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={handleLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High (4.0+)</SelectItem>
                  <SelectItem value="medium">Medium (2.0-4.0)</SelectItem>
                  <SelectItem value="low">Low (&lt;2.0)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={rushFilter} onValueChange={handleRushFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Rush Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rush Ratings</SelectItem>
                  <SelectItem value="excellent">Excellent (3)</SelectItem>
                  <SelectItem value="good">Good (2)</SelectItem>
                  <SelectItem value="needs-improvement">Needs Improvement (1)</SelectItem>
                  <SelectItem value="no-participation">No Participation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <StudentTable students={filteredStudents} />
        </CardContent>
      </Card>
    </div>
  )
}
