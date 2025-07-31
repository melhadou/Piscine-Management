"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, UserPlus } from "lucide-react"
import { StudentTable } from "@/components/student-table"
import Link from "next/link"

// Extended mock data with more students
const mockStudents = [
  {
    uuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    username: "yasser.al-agoul",
    name: "Yasser AL-AGOUL",
    email: "yk198620@gmail.com",
    level: 4.3,
    examGrades: { exam00: 0, exam01: 30, exam02: 60, finalExam: 31 },
    finalExamValidated: false,
    rushesValidated: "1/2",
    validatedProjects: 14,
    age: 23,
    gender: "M",
    codingLevel: "Medium",
    performance: 2.9,
    communication: 2.9,
    professionalism: 2.9,
    campus: "Paris",
    occupation: "Unemployed",
  },
  {
    uuid: "a22518b8-61b1-521f-cdc5-6021370fcceb",
    username: "marie.dubois",
    name: "Marie DUBOIS",
    email: "marie.dubois@email.com",
    level: 5.2,
    examGrades: { exam00: 45, exam01: 78, exam02: 82, finalExam: 89 },
    finalExamValidated: true,
    rushesValidated: "2/2",
    validatedProjects: 18,
    age: 25,
    gender: "F",
    codingLevel: "Advanced",
    performance: 3.8,
    communication: 3.5,
    professionalism: 3.9,
    campus: "Paris",
    occupation: "Student",
  },
  {
    uuid: "b33629c9-72c2-632g-ded6-7132481gddfc",
    username: "john.smith",
    name: "John SMITH",
    email: "john.smith@email.com",
    level: 2.1,
    examGrades: { exam00: 12, exam01: 25, exam02: 18, finalExam: 22 },
    finalExamValidated: false,
    rushesValidated: "0/1",
    validatedProjects: 8,
    age: 22,
    gender: "M",
    codingLevel: "Beginner",
    performance: 2.1,
    communication: 2.3,
    professionalism: 2.0,
    campus: "London",
    occupation: "Part-time worker",
  },
  {
    uuid: "c4473ada-83d3-743h-efe7-8243592heegc",
    username: "sarah.wilson",
    name: "Sarah WILSON",
    email: "sarah.wilson@email.com",
    level: 6.1,
    examGrades: { exam00: 67, exam01: 89, exam02: 95, finalExam: 92 },
    finalExamValidated: true,
    rushesValidated: "2/2",
    validatedProjects: 22,
    age: 24,
    gender: "F",
    codingLevel: "Expert",
    performance: 4.2,
    communication: 4.0,
    professionalism: 4.1,
    campus: "Berlin",
    occupation: "Software Developer",
  },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")
  const [campusFilter, setCampusFilter] = useState("all")
  const [codingLevelFilter, setCodingLevelFilter] = useState("all")

  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGrade =
        gradeFilter === "all" ||
        (gradeFilter === "high" && student.level >= 4.0) ||
        (gradeFilter === "medium" && student.level >= 2.0 && student.level < 4.0) ||
        (gradeFilter === "low" && student.level < 2.0)

      const matchesExam =
        examFilter === "all" ||
        (examFilter === "validated" && student.finalExamValidated) ||
        (examFilter === "not-validated" && !student.finalExamValidated)

      const matchesCampus = campusFilter === "all" || student.campus === campusFilter

      const matchesCodingLevel = codingLevelFilter === "all" || student.codingLevel === codingLevelFilter

      return matchesSearch && matchesGrade && matchesExam && matchesCampus && matchesCodingLevel
    })
  }, [searchTerm, gradeFilter, examFilter, campusFilter, codingLevelFilter])

  const handleExport = () => {
    const csvContent = [
      ["UUID", "Username", "Name", "Email", "Level", "Final Exam", "Campus", "Coding Level"],
      ...filteredStudents.map((student) => [
        student.uuid,
        student.username,
        student.name,
        student.email,
        student.level,
        student.finalExamValidated ? "Validated" : "Not Validated",
        student.campus,
        student.codingLevel,
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

  const campuses = [...new Set(mockStudents.map((s) => s.campus))]
  const codingLevels = [...new Set(mockStudents.map((s) => s.codingLevel))]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage and view all piscine candidates</p>
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
            <CardTitle className="text-sm font-medium">Final Exam Passed</CardTitle>
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
            <div className="text-2xl font-bold">{mockStudents.filter((s) => s.rushesValidated !== "0/0").length}</div>
            <p className="text-xs text-muted-foreground">Students participated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Students
          </CardTitle>
          <CardDescription>Use filters to find specific students or export targeted lists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="high">High (4.0+)</SelectItem>
                  <SelectItem value="medium">Medium (2.0-4.0)</SelectItem>
                  <SelectItem value="low">Low (&lt;2.0)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Final Exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="not-validated">Not Validated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={campusFilter} onValueChange={setCampusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus} value={campus}>
                      {campus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={codingLevelFilter} onValueChange={setCodingLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Coding Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {codingLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm ||
                gradeFilter !== "all" ||
                examFilter !== "all" ||
                campusFilter !== "all" ||
                codingLevelFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setGradeFilter("all")
                    setExamFilter("all")
                    setCampusFilter("all")
                    setCodingLevelFilter("all")
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
                <span>
                  Recommended: {filteredStudents.filter((s) => s.finalExamValidated && s.level >= 3.0).length}
                </span>
                <span>Review: {filteredStudents.filter((s) => !s.finalExamValidated && s.level >= 2.5).length}</span>
                <span>
                  Not Recommended: {filteredStudents.filter((s) => !s.finalExamValidated && s.level < 2.5).length}
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
          <CardDescription>Complete list of piscine candidates with their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentTable students={filteredStudents} />
        </CardContent>
      </Card>
    </div>
  )
}
