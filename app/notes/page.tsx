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
import { Search, Plus, MessageSquare, User, Users, Edit, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock notes data focused on core features
const mockNotes = [
  {
    id: 1,
    type: "student",
    targetId: "f11517a7-50a0-410e-bdb4-5910269ebbda",
    targetName: "Yasser AL-AGOUL",
    title: "Strong problem-solving skills",
    content: "Demonstrated excellent problem-solving abilities during C programming projects.",
    noteType: "general",
    authorName: "John Doe",
    date: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    type: "rush_team",
    targetId: "team-alpha",
    targetName: "Team Alpha (Square)",
    title: "Excellent teamwork",
    content: "The team showed outstanding collaboration during the square rush project.",
    noteType: "rush_specific",
    authorName: "Jane Smith",
    date: "2024-01-10T14:20:00Z",
  },
]

const noteTypes = ["general", "rush_specific"]

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [noteTypeFilter, setNoteTypeFilter] = useState("all")
  const [notes, setNotes] = useState(mockNotes)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)

  // New note form state
  const [newNote, setNewNote] = useState({
    type: "student",
    targetName: "",
    title: "",
    content: "",
    noteType: "general",
  })

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.targetName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || note.type === typeFilter
      const matchesNoteType = noteTypeFilter === "all" || note.noteType === noteTypeFilter

      return matchesSearch && matchesType && matchesNoteType
    })
  }, [searchTerm, typeFilter, noteTypeFilter, notes])

  const handleAddNote = () => {
    const note = {
      id: notes.length + 1,
      ...newNote,
      targetId: `target-${Date.now()}`,
      authorName: "Current Staff",
      date: new Date().toISOString(),
    }
    setNotes([note, ...notes])
    setNewNote({
      type: "student",
      targetName: "",
      title: "",
      content: "",
      noteType: "general",
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
          <p className="text-muted-foreground">Manage notes for students and rush teams</p>
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
              <DialogDescription>Create a new note for a student or rush team.</DialogDescription>
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
                    <SelectItem value="rush_team">Rush Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="targetName" className="text-right">
                  {newNote.type === "student" ? "Student" : "Team"}
                </Label>
                <Input
                  id="targetName"
                  value={newNote.targetName}
                  onChange={(e) => setNewNote({ ...newNote, targetName: e.target.value })}
                  className="col-span-3"
                  placeholder={newNote.type === "student" ? "Student name" : "Team name"}
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
                <Label htmlFor="noteType" className="text-right">
                  Note Type
                </Label>
                <Select value={newNote.noteType} onValueChange={(value) => setNewNote({ ...newNote, noteType: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="rush_specific">Rush Specific</SelectItem>
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
            <CardTitle className="text-sm font-medium">Team Notes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.type === "rush_team").length}</div>
            <p className="text-xs text-muted-foreground">Rush team notes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rush Specific</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.noteType === "rush_specific").length}</div>
            <p className="text-xs text-muted-foreground">Rush evaluation notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes by title, content, or target name..."
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
                  <SelectItem value="rush_team">Rush Team</SelectItem>
                </SelectContent>
              </Select>

              <Select value={noteTypeFilter} onValueChange={setNoteTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Note Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Note Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="rush_specific">Rush Specific</SelectItem>
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
                    <Badge variant="outline">
                      {note.type === "student" ? <User className="mr-1 h-3 w-3" /> : <Users className="mr-1 h-3 w-3" />}
                      {note.type === "student" ? "Student" : "Team"}
                    </Badge>
                    <Badge variant="secondary">{note.noteType}</Badge>
                  </div>
                  <CardDescription>
                    {note.type === "student" ? "Student: " : "Team: "}
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
                      {note.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{note.authorName}</span>
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
                {searchTerm || typeFilter !== "all" || noteTypeFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Start by adding your first note about a student or rush team."}
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
                <Label htmlFor="edit-noteType" className="text-right">
                  Note Type
                </Label>
                <Select
                  value={editingNote.noteType}
                  onValueChange={(value) => setEditingNote({ ...editingNote, noteType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="rush_specific">Rush Specific</SelectItem>
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
