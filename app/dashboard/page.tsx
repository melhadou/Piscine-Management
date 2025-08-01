"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCards } from "@/components/stats-cards"
import { GradeDistribution } from "@/components/grade-distribution"
import { StudentTable } from "@/components/student-table"
import { Search, Download, Users, BookOpen, Trophy, AlertCircle } from "lucide-react"

// Mock data for students
const mockStudents = [
  {
    uuid: "1",
    login: "jdoe",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@student.42.fr",
    phone: "+33123456789",
    campus: "Paris",
    cursus: "42cursus",
    level: 8.42,
    wallet: 150,
    correctionPoint: 12,
    location: "c1r1s1",
    grades: {
      "C Piscine C 00": { grade: 85, status: "finished" },
      "C Piscine C 01": { grade: 92, status: "finished" },
      "C Piscine C 02": { grade: 78, status: "in_progress" },
    },
    rushRating: 4,
    notes: [
      {
        id: "1",
        content: "Excellent problem-solving skills",
        category: "Technical",
        priority: "High",
        author: "Staff Member",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ],
  },
  {
    uuid: "2",
    login: "asmith",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@student.42.fr",
    phone: "+33987654321",
    campus: "Paris",
    cursus: "42cursus",
    level: 6.21,
    wallet: 89,
    correctionPoint: 8,
    location: "c2r3s5",
    grades: {
      "C Piscine C 00": { grade: 95, status: "finished" },
      "C Piscine C 01": { grade: 88, status: "finished" },
      "C Piscine C 02": { grade: 91, status: "finished" },
    },
    rushRating: 3,
    notes: [],
  },
  {
    uuid: "3",
    login: "bwilson",
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob.wilson@student.42.fr",
    phone: "+33456789123",
    campus: "Paris",
    cursus: "42cursus",
    level: 4.15,
    wallet: 45,
    correctionPoint: 5,
    location: "unavailable",
    grades: {
      "C Piscine C 00": { grade: 72, status: "finished" },
      "C Piscine C 01": { grade: 65, status: "finished" },
    },
    rushRating: 2,
    notes: [
      {
        id: "2",
        content: "Needs improvement in time management",
        category: "Behavioral",
        priority: "Medium",
        author: "Staff Member",
        createdAt: "2024-01-14T14:20:00Z",
      },
    ],
  },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCampus, setSelectedCampus] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRushRating, setSelectedRushRating] = useState("all")

  // Filter students based on search and filters
  const filteredStudents = mockStudents.filter((student) => {
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

    const matchesRushRating = selectedRushRating === "all" || student.rushRating.toString() === selectedRushRating

    return matchesSearch && matchesCampus && matchesStatus && matchesRushRating
  })

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

      <StatsCards students={mockStudents} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Overview of student performance across all exercises</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <GradeDistribution students={mockStudents} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student submissions and evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">John Doe completed C02</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">85%</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Alice Smith started Rush 00</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
                <Badge variant="outline">In Progress</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Bob Wilson needs evaluation</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
                <Badge variant="destructive">Pending</Badge>
              </div>
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
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Exercise tracking coming soon</h3>
                <p className="text-muted-foreground">Detailed exercise analytics and management tools</p>
              </div>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rush 00</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Teams completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rush 01</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Teams in progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rush 02</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground">Teams registered</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3.2</div>
                    <p className="text-xs text-muted-foreground">Out of 4.0</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
