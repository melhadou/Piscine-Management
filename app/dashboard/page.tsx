"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCards } from "@/components/stats-cards"
import { GradeDistribution } from "@/components/grade-distribution"
import { StudentTable } from "@/components/student-table"
import { Search, Download, Users, BookOpen, Trophy, AlertCircle, Loader2 } from "lucide-react"
import { useStudentCache } from "@/contexts/StudentCacheContext"

interface Student {
  uuid: string
  login: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  campus: string
  cursus: string
  level: number
  wallet: number
  correctionPoint: number
  location: string
  grades?: {
    [key: string]: {
      grade: number
      status: string
    }
  }
  rushRating?: number
  notes?: Array<{
    id: string
    content: string
    category: string
    priority: string
    author: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCampus, setSelectedCampus] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRushRating, setSelectedRushRating] = useState("all")
  const [rushSummary, setRushSummary] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  
  // Use cached student data
  const { students, loading, error, fetchStudents: refetchStudents } = useStudentCache()

  // Fallback: if cache fails, try direct API call
  useEffect(() => {
    if (error && !loading && students.length === 0) {
      console.log('Dashboard: Cache failed, attempting direct API call...')
      // Try to fetch directly as fallback
      const fetchDirect = async () => {
        try {
          const response = await fetch('/api/students')
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.students) {
              console.log('Dashboard: Direct API call successful')
              // Force refresh the cache with new data
              await refetchStudents(true)
            }
          }
        } catch (err) {
          console.error('Dashboard: Direct API call also failed:', err)
        }
      }
      
      setTimeout(fetchDirect, 1000) // Small delay to avoid rapid retries
    }
  }, [error, loading, students.length, refetchStudents])

  // Fetch other dashboard data (not students, those come from cache)
  useEffect(() => {

    const fetchRushSummary = async () => {
      try {
        const response = await fetch('/api/rush-summary')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRushSummary(data.summary)
          }
        }
      } catch (err) {
        console.error('Error fetching rush summary:', err)
      }
    }

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setDashboardStats(data.stats)
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      }
    }

    fetchRushSummary()
    fetchDashboardStats()
  }, [])

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCampus = selectedCampus === "all" || student.campus === selectedCampus

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && student.location !== "unavailable") ||
      (selectedStatus === "inactive" && student.location === "unavailable")

    const matchesRushRating = selectedRushRating === "all" || student.rushRating?.toString() === selectedRushRating

    return matchesSearch && matchesCampus && matchesStatus && matchesRushRating
  })

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <StatsCards students={filteredStudents} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Overview of student performance across all exercises</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <GradeDistribution students={filteredStudents} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student submissions and evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                dashboardStats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${activity.validated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.studentName} completed {activity.examName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={activity.validated ? "secondary" : "outline"}>
                      {activity.grade}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activity data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Exercises
            </TabsTrigger>
            <TabsTrigger value="rush" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Rush Projects
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campus</SelectItem>
                <SelectItem value="Paris">Paris</SelectItem>
                <SelectItem value="Lyon">Lyon</SelectItem>
                <SelectItem value="Nice">Nice</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRushRating} onValueChange={setSelectedRushRating}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rush Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4">4 - Excellent</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="2">2 - Average</SelectItem>
                <SelectItem value="1">1 - Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
              <CardDescription>Manage and monitor student progress during the piscine</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentTable students={filteredStudents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Management</CardTitle>
              <CardDescription>Track exercise completion and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardStats?.examStats ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.examStats.totalExams}</div>
                      <p className="text-xs text-muted-foreground">Exam submissions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Validated</CardTitle>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.examStats.validatedExams}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.examStats.totalExams > 0 
                          ? `${Math.round((dashboardStats.examStats.validatedExams / dashboardStats.examStats.totalExams) * 100)}% success rate`
                          : 'No data'
                        }
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.examStats.averageGrade.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Overall performance</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.examStats.studentsWithExams}</div>
                      <p className="text-xs text-muted-foreground">Students with submissions</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Loading exercise data...</h3>
                  <p className="text-muted-foreground">Exercise analytics will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rush" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rush Project Analytics</CardTitle>
              <CardDescription>Monitor rush project performance and team dynamics</CardDescription>
            </CardHeader>
            <CardContent>
              {rushSummary ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(rushSummary).map(([project, data]: [string, any]) => (
                    <Card key={project}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {project.charAt(0).toUpperCase() + project.slice(1).replace('-', ' ')}
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data.total_students}</div>
                        <p className="text-xs text-muted-foreground">
                          {data.successful} successful, {data.failed} failed
                        </p>
                        <div className="mt-2">
                          <div className="text-sm font-medium">Avg Score: {data.average_score.toFixed(1)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Overall Stats</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {rushSummary && Object.values(rushSummary).reduce((acc: number, data: any) => acc + data.total_students, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total participants</p>
                      <div className="mt-2">
                        <div className="text-sm font-medium">
                          Success Rate: {rushSummary && Object.values(rushSummary).length > 0 ?
                            ((Object.values(rushSummary).reduce((acc: number, data: any) => acc + data.successful, 0) /
                              Object.values(rushSummary).reduce((acc: number, data: any) => acc + data.total_students, 0)) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Rush data loading...</h3>
                  <p className="text-muted-foreground">Rush project analytics will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
