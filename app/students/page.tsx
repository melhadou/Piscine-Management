"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, UserPlus } from "lucide-react"
import { StudentTable } from "@/components/student-table"
import Link from "next/link"

// Mock data focused on core features
const mockStudents = [
  {
    uuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    username: "yasser.al-agoul",
    name: "Yasser AL-AGOUL",
    email: "yk198620@gmail.com",
    level: 4.3,
    examGrades: { exam00: 0, exam01: 30, exam02: 60, finalExam: 31 },
    finalExamValidated: false,
    rushParticipation: [{ project: "square", team: "Team Alpha", grade: 85 }],
    profileImage: "/placeholder-user.jpg",
  },
  {
    uuid: "a22518b8-61b1-521f-cdc5-6021370fcceb",
    username: "marie.dubois",
    name: "Marie DUBOIS",
    email: "marie.dubois@email.com",
    level: 5.2,
    examGrades: { exam00: 45, exam01: 78, exam02: 82, finalExam: 89 },
    finalExamValidated: true,
    rushParticipation: [{ project: "skyscraper", team: "Team Beta", grade: 92 }],
    profileImage: "/placeholder-user.jpg",
  },
  {
    uuid: "b33629c9-72c2-632g-ded6-7132481gddfc",
    username: "john.smith",
    name: "John SMITH",
    email: "john.smith@email.com",
    level: 2.1,
    examGrades: { exam00: 12, exam01: 25, exam02: 18, finalExam: 22 },
    finalExamValidated: false,
    rushParticipation: [],
    profileImage: "/placeholder-user.jpg",
  },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [examFilter, setExamFilter] = useState("all")
  const [rushFilter, setRushFilter] = useState("all")

  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesExam =
        examFilter === "all" ||
        (examFilter === "validated" && student.finalExamValidated) ||
        (examFilter === "not_validated" && !student.finalExamValidated)

      const matchesRush =
        rushFilter === "all" ||
        (rushFilter === "participated" && student.rushParticipation.length > 0) ||
        (rushFilter === "not_participated" && student.rushParticipation.length === 0)

      return matchesSearch && matchesExam && matchesRush
    })
  }, [searchTerm, examFilter, rushFilter])

  const handleExport = () => {
    const csvContent = [
      ["UUID", "Username", "Name", "Email", "Level", "Final Exam Validated", "Rush Participation"],
      ...filteredStudents.map((student) => [
        student.uuid,
        student.username,
        student.name,
        student.email,
        student.level,
        student.finalExamValidated ? "Yes" : "No",
        student.rushParticipation.length > 0 ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Search and filter piscine candidates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/import">
              <UserPlus className="mr-2 h-4 w-4" />
              Import Students
            </Link>
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export ({filteredStudents.length})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.length}</div>
            <p className="text-xs text-muted-foreground">Active candidates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Exam Validated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudents.filter((s) => s.finalExamValidated).length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockStudents.filter((s) => s.finalExamValidated).length / mockStudents.length) * 100)}% pass
              rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockStudents.reduce((acc, s) => acc + s.level, 0) / mockStudents.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Current progression</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rush Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudents.filter((s) => s.rushParticipation.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Students participated</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Students
          </CardTitle>
          <CardDescription>Find candidates by name or username, filter by exam and rush status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Final Exam Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="validated">Final Exam Validated</SelectItem>
                  <SelectItem value="not_validated">Not Validated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={rushFilter} onValueChange={setRushFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rush Participation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="participated">Participated in Rush</SelectItem>
                  <SelectItem value="not_participated">No Rush Participation</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || examFilter !== "all" || rushFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setExamFilter("all")
                    setRushFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredStudents.length} of {mockStudents.length} students
              </span>
              <div className="flex items-center gap-4">
                <span className="text-green-600">
                  ✓ Recommended: {filteredStudents.filter((s) => s.finalExamValidated).length}
                </span>
                <span className="text-red-600">
                  ✗ Not Recommended: {filteredStudents.filter((s) => !s.finalExamValidated).length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>Complete list of piscine candidates with exam and rush status</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentTable students={filteredStudents} />
        </CardContent>
      </Card>
    </div>
  )
}
