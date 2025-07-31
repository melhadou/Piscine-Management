"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, User, Calendar, Trophy, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock student data - replace with actual data fetching
const mockStudent = {
  uuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
  username: "yasser.al-agoul",
  name: "Yasser AL-AGOUL",
  email: "yk198620@gmail.com",
  age: 23,
  gender: "M",
  level: 4.3,
  examGrades: { exam00: 0, exam01: 30, exam02: 60, finalExam: 31 },
  finalExamValidated: false,
  rushesValidated: "1/2",
  validatedProjects: 14,
  codingLevel: "Medium",
  performance: 2.9,
  communication: 2.9,
  professionalism: 2.9,
  occupation: "Unemployed",
  rushProjects: {
    square: "✗",
    skyscraper: null,
    rosettaStone: null,
  },
}

const mockNotes = [
  {
    id: 1,
    content: "Strong problem-solving skills demonstrated in C projects",
    author: "Staff Member",
    date: "2024-01-15",
    type: "general",
  },
  {
    id: 2,
    content: "Good collaboration during rush project",
    author: "Staff Member",
    date: "2024-01-10",
    type: "rush",
  },
]

export default function StudentProfilePage({ params }: { params: { uuid: string } }) {
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState(mockNotes)

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: notes.length + 1,
        content: newNote,
        author: "Current Staff",
        date: new Date().toISOString().split("T")[0],
        type: "general",
      }
      setNotes([note, ...notes])
      setNewNote("")
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{mockStudent.name}</h1>
        <Badge variant="outline">@{mockStudent.username}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="rush">Rush Projects</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Age: {mockStudent.age}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Gender: {mockStudent.gender}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{mockStudent.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Occupation: {mockStudent.occupation}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{mockStudent.level}</div>
                      <p className="text-xs text-muted-foreground">Current Level</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{mockStudent.validatedProjects}</div>
                      <p className="text-xs text-muted-foreground">Validated Projects</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{mockStudent.performance}</div>
                      <p className="text-xs text-muted-foreground">Performance Score</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{mockStudent.communication}</div>
                      <p className="text-xs text-muted-foreground">Communication Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Grades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Exam 00</span>
                      <Badge variant="outline">{mockStudent.examGrades.exam00}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Exam 01</span>
                      <Badge variant="outline">{mockStudent.examGrades.exam01}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Exam 02</span>
                      <Badge variant="outline">{mockStudent.examGrades.exam02}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Final Exam</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{mockStudent.examGrades.finalExam}</Badge>
                        {mockStudent.finalExamValidated ? (
                          <Badge className="bg-green-100 text-green-800">Validated</Badge>
                        ) : (
                          <Badge variant="destructive">Not Validated</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rush" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rush Projects</CardTitle>
                  <CardDescription>Rush participation: {mockStudent.rushesValidated}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Square</span>
                      <Badge variant={mockStudent.rushProjects.square === "✓" ? "default" : "destructive"}>
                        {mockStudent.rushProjects.square || "Not Attempted"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Skyscraper</span>
                      <Badge variant="outline">Not Attempted</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rosetta Stone</span>
                      <Badge variant="outline">Not Attempted</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add a note about this student..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button onClick={handleAddNote}>Add Note</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{note.author}</span>
                          <span className="text-xs text-muted-foreground">{note.date}</span>
                        </div>
                        <p className="text-sm">{note.content}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {note.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Note
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Trophy className="mr-2 h-4 w-4" />
                Update Grades
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Review
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Recommendation</span>
                  <Badge variant="outline">Review Required</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Final exam not validated but shows good progress</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
