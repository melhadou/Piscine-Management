"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Upload, Users, GraduationCap, Trophy } from "lucide-react"
import { StudentTable } from "@/components/student-table"
import { StatsCards } from "@/components/stats-cards"
import { GradeDistribution } from "@/components/grade-distribution"

// Mock data - replace with actual data fetching
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
  },
  // Add more mock students as needed
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")
  const [rushFilter, setRushFilter] = useState("all")

  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGrade =
        gradeFilter === "all" ||
        (gradeFilter === "high" && student.level >= 4.0) ||
        (gradeFilter === "medium" && student.level >= 2.0 && student.level < 4.0) ||
        (gradeFilter === "low" && student.level < 2.0)

      const matchesExam =
        examFilter === "all" ||
        (examFilter === "validated" && student.finalExamValidated) ||
        (examFilter === "not-validated" && !student.finalExamValidated)

      const matchesRush = rushFilter === "all" || (rushFilter === "participated" && student.rushesValidated !== "0/0")

      return matchesSearch && matchesGrade && matchesExam && matchesRush
    })
  }, [searchTerm, gradeFilter, examFilter, rushFilter, mockStudents])

  const handleExport = () => {
    const csvContent = [
      ["UUID", "Username", "Name", "Email", "Final Exam Validated"],
      ...filteredStudents.map((student) => [
        student.uuid,
        student.username,
        student.name,
        student.email,
        student.finalExamValidated ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "filtered-students.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Piscine Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export ({filteredStudents.length})
          </Button>
        </div>
      </div>

      <StatsCards students={mockStudents} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <GradeDistribution students={mockStudents} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Current piscine performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Final Exam Pass Rate</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(
                          (mockStudents.filter((s) => s.finalExamValidated).length / mockStudents.length) * 100,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Average Level</p>
                      <p className="text-sm text-muted-foreground">
                        {(mockStudents.reduce((acc, s) => acc + s.level, 0) / mockStudents.length).toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-green-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Rush Participation</p>
                      <p className="text-sm text-muted-foreground">
                        {mockStudents.filter((s) => s.rushesValidated !== "0/0").length} students
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>Search, filter, and manage piscine candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
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
                <Select value={rushFilter} onValueChange={setRushFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Rush Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="participated">Participated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <StudentTable students={filteredStudents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Performance Score</span>
                    <span className="text-sm font-medium">
                      {(mockStudents.reduce((acc, s) => acc + s.performance, 0) / mockStudents.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Communication Score</span>
                    <span className="text-sm font-medium">
                      {(mockStudents.reduce((acc, s) => acc + s.communication, 0) / mockStudents.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Professionalism Score</span>
                    <span className="text-sm font-medium">
                      {(mockStudents.reduce((acc, s) => acc + s.professionalism, 0) / mockStudents.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Selection Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Recommended for Selection</span>
                    <Badge variant="secondary">
                      {mockStudents.filter((s) => s.finalExamValidated && s.level >= 3.0).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Needs Review</span>
                    <Badge variant="outline">
                      {mockStudents.filter((s) => !s.finalExamValidated && s.level >= 2.5).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Not Recommended</span>
                    <Badge variant="destructive">
                      {mockStudents.filter((s) => !s.finalExamValidated && s.level < 2.5).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
