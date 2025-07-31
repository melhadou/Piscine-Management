"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { Search, Plus, MessageSquare, User, Users, Calendar, Filter, Edit, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock notes data
const mockNotes = [
  {
    id: 1,
    type: "student",
    targetId: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    targetName: "Yasser AL-AGOUL",
    title: "Strong problem-solving skills",
    content:
      "Demonstrated excellent problem-solving abilities during C programming projects. Shows good understanding of algorithms and data structures.",
    author: "John Doe",
    authorRole: "Staff",
    date: "2024-01-15T10:30:00Z",
    category: "performance",
    priority: "normal",
  },
  {
    id: 2,
    type: "student",
    targetId: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    targetName: "Yasser AL-AGOUL",
    title: "Collaboration during rush",
    content:
      "Good teamwork and communication skills during the rush project. Helped other team members when they were struggling.",
    author: "Jane Smith",
    authorRole: "Staff",
    date: "2024-01-10T14:20:00Z",
    category: "teamwork",
    priority: "normal",
  },
  {
    id: 3,
    type: "rush_group",
    targetId: "rush-group-1",
    targetName: "Rush Group Alpha",
    title: "Group dynamics assessment",
    content:
      "The group showed excellent collaboration. All members contributed equally to the project. Strong leadership from Marie and good support from other members.",
    author: "Mike Johnson",
    authorRole: "Staff",
    date: "2024-01-08T16:45:00Z",
    category: "evaluation",
    priority: "high",
  },
  {
    id: 4,
    type: "student",
    targetId: "a22518b8-61b1-521f-cdc5-6021370fcceb",
    targetName: "Marie DUBOIS",
    title: "Outstanding performance",
    content:
      "Consistently delivers high-quality work. Shows initiative and helps other students. Recommended for advanced track.",
    author: "Sarah Wilson",
    authorRole: "Staff",
    date: "2024-01-12T09:15:00Z",
    category: "performance",
    priority: "high",
  },
  {
    id: 5,
    type: "student",
    targetId: "b33629c9-72c2-632g-ded6-7132481gddfc",
    targetName: "John SMITH",
    title: "Needs additional support",
    content:
      "Struggling with advanced concepts. Recommended for additional tutoring sessions. Shows willingness to learn but needs more guidance.",
    author: "Tom Brown",
    authorRole: "Staff",
    date: "2024-01-14T11:30:00Z",
    category: "support",
    priority: "high",
  },
]

const categories = ["performance", "teamwork", "evaluation", "support", "behavior", "technical"]
const priorities = ["low", "normal", "high"]
const noteTypes = ["student", "rush_group"]

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [authorFilter, setAuthorFilter] = useState("all")
  const [notes, setNotes] = useState(mockNotes)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)

  // New note form state
  const [newNote, setNewNote] = useState({
    type: "student",
    targetName: "",
    title: "",
    content: "",
    category: "performance",
    priority: "normal",
  })

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.author.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || note.type === typeFilter
      const matchesCategory = categoryFilter === "all" || note.category === categoryFilter
      const matchesPriority = priorityFilter === "all" || note.priority === priorityFilter
      const matchesAuthor = authorFilter === "all" || note.author === authorFilter

      return matchesSearch && matchesType && matchesCategory && matchesPriority && matchesAuthor
    })
  }, [searchTerm, typeFilter, categoryFilter, priorityFilter, authorFilter, notes])

  const authors = [...new Set(notes.map((note) => note.author))]

  const handleAddNote = () => {
    const note = {
      id: notes.length + 1,
      ...newNote,
      targetId: `target-${Date.now()}`,
      author: "Current Staff",
      authorRole: "Staff",
      date: new Date().toISOString(),
    }
    setNotes([note, ...notes])
    setNewNote({
      type: "student",
      targetName: "",
      title: "",
      content: "",
      category: "performance",
      priority: "normal",
    })
    setIsAddingNote(false)
  }

  const handleEditNote = (note: any) => {
    setEditingNote(note)
  }

  const handleUpdateNote = () => {
    setNotes(notes.map((note) => (note.id === editingNote.id ? editingNote : note)))
    setEditingNote(null)
  }

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter((note) => note.id !== noteId))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "performance":
        return "bg-green-100 text-green-800"
      case "teamwork":
        return "bg-purple-100 text-purple-800"
      case "evaluation":
        return "bg-orange-100 text-orange-800"
      case "support":
        return "bg-yellow-100 text-yellow-800"
      case "behavior":
        return "bg-pink-100 text-pink-800"
      case "technical":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
          <p className="text-muted-foreground">Manage notes for students and rush groups</p>
        </div>
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>Create a new note for a student or rush group.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={newNote.type} onValueChange={(value) => setNewNote({ ...newNote, type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="rush_group">Rush Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="targetName" className="text-right">
                  {newNote.type === "student" ? "Student" : "Group"}
                </Label>
                <Input
                  id="targetName"
                  value={newNote.targetName}
                  onChange={(e) => setNewNote({ ...newNote, targetName: e.target.value })}
                  className="col-span-3"
                  placeholder={newNote.type === "student" ? "Student name" : "Group name"}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Note title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select value={newNote.category} onValueChange={(value) => setNewNote({ ...newNote, category: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Select value={newNote.priority} onValueChange={(value) => setNewNote({ ...newNote, priority: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="col-span-3"
                  placeholder="Note content..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddNote} disabled={!newNote.title || !newNote.content || !newNote.targetName}>
                Add Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">All notes created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Notes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.type === "student").length}</div>
            <p className="text-xs text-muted-foreground">Individual student notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Notes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.type === "rush_group").length}</div>
            <p className="text-xs text-muted-foreground">Rush group notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.priority === "high").length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes by title, content, student name, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="rush_group">Rush Group</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredNotes.length} of {notes.length} notes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <Badge className={getPriorityColor(note.priority)}>{note.priority}</Badge>
                    <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                    <Badge variant="outline">
                      {note.type === "student" ? <User className="mr-1 h-3 w-3" /> : <Users className="mr-1 h-3 w-3" />}
                      {note.type === "student" ? "Student" : "Group"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {note.type === "student" ? "Student: " : "Group: "}
                    <span className="font-medium">{note.targetName}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{note.content}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {note.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {note.author} • {note.authorRole}
                  </span>
                </div>
                <span>{new Date(note.date).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || typeFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Start by adding your first note about a student or rush group."}
              </p>
              <Button onClick={() => setIsAddingNote(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Note
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update the note information.</DialogDescription>
          </DialogHeader>
          {editingNote && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={editingNote.category}
                  onValueChange={(value) => setEditingNote({ ...editingNote, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-priority" className="text-right">
                  Priority
                </Label>
                <Select
                  value={editingNote.priority}
                  onValueChange={(value) => setEditingNote({ ...editingNote, priority: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="edit-content"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateNote}>Update Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
