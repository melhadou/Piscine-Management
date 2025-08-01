"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, MessageSquare, User, Calendar, Filter } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock notes data with categories and priorities
const mockNotes = [
  {
    id: "1",
    studentUuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    studentName: "Yasser AL-AGOUL",
    studentUsername: "yasser.al-agoul",
    category: "performance",
    priority: "high",
    type: "evaluation",
    content:
      "Exceptional problem-solving skills demonstrated during peer evaluations. Shows strong leadership potential and helps struggling teammates.",
    author: "John Doe",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    studentUuid: "a22518b8-61b1-521f-cdc5-6021370fcceb",
    studentName: "Marie DUBOIS",
    studentUsername: "marie.dubois",
    category: "teamwork",
    priority: "normal",
    type: "observation",
    content:
      "Works well in team settings. Good communication skills and actively participates in group discussions. Could improve time management.",
    author: "Jane Smith",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "3",
    studentUuid: "b33629c9-72c2-632g-ded6-7132481gddfc",
    studentName: "John SMITH",
    studentUsername: "john.smith",
    category: "technical",
    priority: "high",
    type: "concern",
    content:
      "Struggling with advanced algorithms and data structures. Needs additional support and practice. Consider pairing with stronger students.",
    author: "Mike Johnson",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "4",
    studentUuid: "c44740d0-83d3-743h-efe7-8243592heegc",
    studentName: "Alice JOHNSON",
    studentUsername: "alice.johnson",
    category: "behavior",
    priority: "low",
    type: "positive",
    content:
      "Always punctual and well-prepared for sessions. Shows respect for peers and instructors. Maintains a positive attitude even under pressure.",
    author: "Sarah Wilson",
    createdAt: "2024-01-12T16:45:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
  },
  {
    id: "5",
    studentUuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    studentName: "Yasser AL-AGOUL",
    studentUsername: "yasser.al-agoul",
    category: "communication",
    priority: "normal",
    type: "feedback",
    content:
      "Excellent at explaining complex concepts to peers. Could be a good candidate for peer tutoring role. Strong verbal communication skills.",
    author: "David Brown",
    createdAt: "2024-01-11T11:30:00Z",
    updatedAt: "2024-01-11T11:30:00Z",
  },
  {
    id: "6",
    studentUuid: "d55851e1-94e4-854i-fgf8-9354603iggfd",
    studentName: "Bob WILSON",
    studentUsername: "bob.wilson",
    category: "support",
    priority: "high",
    type: "intervention",
    content:
      "Student requested additional help with C programming fundamentals. Scheduled extra sessions. Shows motivation to improve despite initial struggles.",
    author: "Lisa Garcia",
    createdAt: "2024-01-10T13:20:00Z",
    updatedAt: "2024-01-10T13:20:00Z",
  },
  {
    id: "7",
    studentUuid: "e66962f2-a5f5-965j-ghg9-a465714jhhge",
    studentName: "Emma BROWN",
    studentUsername: "emma.brown",
    category: "evaluation",
    priority: "normal",
    type: "assessment",
    content:
      "Consistently delivers high-quality code with good documentation. Understands best practices and applies them effectively. Ready for advanced projects.",
    author: "Tom Anderson",
    createdAt: "2024-01-09T15:10:00Z",
    updatedAt: "2024-01-09T15:10:00Z",
  },
  {
    id: "8",
    studentUuid: "a22518b8-61b1-521f-cdc5-6021370fcceb",
    studentName: "Marie DUBOIS",
    studentUsername: "marie.dubois",
    category: "performance",
    priority: "low",
    type: "progress",
    content:
      "Steady improvement in coding efficiency over the past week. Good adaptation to feedback and implements suggestions quickly.",
    author: "Rachel Martinez",
    createdAt: "2024-01-08T12:00:00Z",
    updatedAt: "2024-01-08T12:00:00Z",
  },
]

const categories = [
  { value: "performance", label: "Performance", color: "bg-blue-100 text-blue-800" },
  { value: "teamwork", label: "Teamwork", color: "bg-green-100 text-green-800" },
  { value: "evaluation", label: "Evaluation", color: "bg-purple-100 text-purple-800" },
  { value: "support", label: "Support", color: "bg-orange-100 text-orange-800" },
  { value: "behavior", label: "Behavior", color: "bg-pink-100 text-pink-800" },
  { value: "technical", label: "Technical", color: "bg-red-100 text-red-800" },
  { value: "communication", label: "Communication", color: "bg-yellow-100 text-yellow-800" },
]

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800" },
]

const noteTypes = [
  { value: "evaluation", label: "Evaluation" },
  { value: "observation", label: "Observation" },
  { value: "concern", label: "Concern" },
  { value: "positive", label: "Positive" },
  { value: "feedback", label: "Feedback" },
  { value: "intervention", label: "Intervention" },
  { value: "assessment", label: "Assessment" },
  { value: "progress", label: "Progress" },
]

export default function NotesPage() {
  const [notes, setNotes] = useState(mockNotes)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("all")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState({
    studentName: "",
    category: "performance",
    priority: "normal",
    type: "evaluation",
    content: "",
  })

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.studentUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || note.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || note.priority === priorityFilter
    const matchesType = typeFilter === "all" || note.type === typeFilter
    const matchesAuthor = authorFilter === "all" || note.author === authorFilter

    return matchesSearch && matchesCategory && matchesPriority && matchesType && matchesAuthor
  })

  const handleAddNote = () => {
    const note = {
      id: Date.now().toString(),
      studentUuid: "f11517a7-50a0-410e-bdb4-5910269ebbda", // Mock UUID
      studentName: newNote.studentName,
      studentUsername: newNote.studentName.toLowerCase().replace(" ", "."),
      category: newNote.category,
      priority: newNote.priority,
      type: newNote.type,
      content: newNote.content,
      author: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setNotes([note, ...notes])
    setNewNote({
      studentName: "",
      category: "performance",
      priority: "normal",
      type: "evaluation",
      content: "",
    })
    setIsAddingNote(false)
  }

  const getCategoryBadge = (category: string) => {
    const categoryInfo = categories.find((c) => c.value === category)
    return (
      <Badge className={categoryInfo?.color} variant="outline">
        {categoryInfo?.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityInfo = priorities.find((p) => p.value === priority)
    return (
      <Badge className={priorityInfo?.color} variant="outline">
        {priorityInfo?.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const uniqueAuthors = [...new Set(notes.map((note) => note.author))]

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Notes</h2>
          <p className="text-muted-foreground">Track observations, feedback, and evaluations for piscine candidates</p>
        </div>
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>Create a new note for a student with category and priority.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student Name</Label>
                <Input
                  id="student"
                  value={newNote.studentName}
                  onChange={(e) => setNewNote({ ...newNote, studentName: e.target.value })}
                  placeholder="Enter student name..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newNote.category}
                    onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newNote.priority}
                    onValueChange={(value) => setNewNote({ ...newNote, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newNote.type} onValueChange={(value) => setNewNote({ ...newNote, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noteTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Note Content</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter your note content..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote} disabled={!newNote.studentName || !newNote.content}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {noteTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={authorFilter} onValueChange={setAuthorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map((author) => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
                setPriorityFilter("all")
                setTypeFilter("all")
                setAuthorFilter("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm ||
                categoryFilter !== "all" ||
                priorityFilter !== "all" ||
                typeFilter !== "all" ||
                authorFilter !== "all"
                  ? "Try adjusting your filters to see more notes."
                  : "Start by adding your first note about a student."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {note.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{note.studentName}</h3>
                        <span className="text-sm text-muted-foreground">@{note.studentUsername}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(note.category)}
                        {getPriorityBadge(note.priority)}
                        <Badge variant="secondary">{note.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {note.author}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(note.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{note.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredNotes.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredNotes.length} of {notes.length} notes
        </div>
      )}
    </div>
  )
}
