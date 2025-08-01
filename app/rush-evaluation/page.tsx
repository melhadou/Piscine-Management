"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Trophy, Users, MessageSquare, Edit, Search, Plus, Check, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock rush data
const rushProjects = [
  { id: "square", name: "Square", description: "Basic geometric calculations and display" },
  { id: "skyscraper", name: "Skyscraper", description: "Complex puzzle solving with constraints" },
  { id: "rosetta-stone", name: "Rosetta Stone", description: "Multi-language translation system" },
]

// All available students
const allStudents = [
  { uuid: "f11517a7-50a0-410e-bdb4-5910269ebbda", name: "Yasser AL-AGOUL", username: "yasser.al-agoul" },
  { uuid: "a22518b8-61b1-521f-cdc5-6021370fcceb", name: "Marie DUBOIS", username: "marie.dubois" },
  { uuid: "b33629c9-72c2-632g-ded6-7132481gddfc", name: "John SMITH", username: "john.smith" },
  { uuid: "c44740d0-83d3-743h-efe7-8243592heegc", name: "Alice JOHNSON", username: "alice.johnson" },
  { uuid: "d55851e1-94e4-854i-fgf8-9354603iggfd", name: "Bob WILSON", username: "bob.wilson" },
  { uuid: "e66962f2-a5f5-965j-ghg9-a465714jhhge", name: "Emma BROWN", username: "emma.brown" },
  { uuid: "f77073g3-b6g6-a76k-hih0-b576825kiihf", name: "David DAVIS", username: "david.davis" },
  { uuid: "g88184h4-c7h7-b87l-iji1-c687936ljjig", name: "Sarah MILLER", username: "sarah.miller" },
  { uuid: "h99295i5-d8i8-c98m-jkj2-d798047mkkjh", name: "Michael GARCIA", username: "michael.garcia" },
]

// Mock teams data for each rush
const initialMockTeams = {
  square: [
    {
      id: "team-1",
      name: "Team 1",
      members: [
        {
          uuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
          name: "Yasser AL-AGOUL",
          username: "yasser.al-agoul",
          rating: 3,
          feedback: "Excellent problem-solving skills and great teamwork. Led the team effectively.",
        },
        {
          uuid: "a22518b8-61b1-521f-cdc5-6021370fcceb",
          name: "Marie DUBOIS",
          username: "marie.dubois",
          rating: 3,
          feedback: "Strong technical skills and good collaboration. Contributed significantly to the solution.",
        },
        {
          uuid: "b33629c9-72c2-632g-ded6-7132481gddfc",
          name: "John SMITH",
          username: "john.smith",
          rating: 2,
          feedback: "Participated actively but struggled with some advanced concepts. Showed good effort.",
        },
      ],
    },
    {
      id: "team-2",
      name: "Team 2",
      members: [
        {
          uuid: "c44740d0-83d3-743h-efe7-8243592heegc",
          name: "Alice JOHNSON",
          username: "alice.johnson",
          rating: 1,
          feedback: "Registered for the rush but did not attend on the day.",
        },
        {
          uuid: "d55851e1-94e4-854i-fgf8-9354603iggfd",
          name: "Bob WILSON",
          username: "bob.wilson",
          rating: 2,
          feedback: "Attended and tried hard but failed to complete the project successfully.",
        },
        {
          uuid: "e66962f2-a5f5-965j-ghg9-a465714jhhge",
          name: "Emma BROWN",
          username: "emma.brown",
          rating: 3,
          feedback: "Great performance, solved the problem efficiently and helped teammates.",
        },
      ],
    },
  ],
  skyscraper: [
    {
      id: "team-1",
      name: "Team 1",
      members: [
        {
          uuid: "f11517a7-50a0-410e-bdb4-5910269ebbda",
          name: "Yasser AL-AGOUL",
          username: "yasser.al-agoul",
          rating: 0,
          feedback: "",
        },
        {
          uuid: "a22518b8-61b1-521f-cdc5-6021370fcceb",
          name: "Marie DUBOIS",
          username: "marie.dubois",
          rating: 3,
          feedback: "Outstanding performance in complex problem solving. Excellent algorithmic thinking.",
        },
        {
          uuid: "f77073g3-b6g6-a76k-hih0-b576825kiihf",
          name: "David DAVIS",
          username: "david.davis",
          rating: 2,
          feedback: "Good effort but couldn't complete all requirements within the time limit.",
        },
      ],
    },
  ],
  "rosetta-stone": [],
}

// Rating options
const ratingOptions = [
  { value: 0, label: "Did not participate", color: "bg-gray-100 text-gray-800" },
  { value: 1, label: "Registered but absent", color: "bg-red-100 text-red-800" },
  { value: 2, label: "Attended but failed", color: "bg-orange-100 text-orange-800" },
  { value: 3, label: "Successful completion", color: "bg-green-100 text-green-800" },
]

export default function RushEvaluationPage() {
  const [selectedRush, setSelectedRush] = useState("square")
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [teams, setTeams] = useState(initialMockTeams)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([])
  const [searchOpen, setSearchOpen] = useState(false)

  // Temporary state for editing
  const [tempRating, setTempRating] = useState(0)
  const [tempFeedback, setTempFeedback] = useState("")

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentTeams = teams[selectedRush as keyof typeof teams] || []
  const currentTeam = selectedTeam ? currentTeams.find((team: any) => team.id === selectedTeam) : null

  // Auto-select first team when rush changes
  useEffect(() => {
    const teamsForRush = teams[selectedRush as keyof typeof teams] || []
    if (teamsForRush.length > 0) {
      setSelectedTeam(teamsForRush[0].id)
    } else {
      setSelectedTeam(null)
    }
  }, [selectedRush, teams])

  // Focus textarea when dialog opens
  useEffect(() => {
    if (isEditDialogOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [isEditDialogOpen])

  const handleEditMember = (member: any, teamId: string) => {
    setEditingMember({ ...member, teamId })
    setTempRating(member.rating)
    setTempFeedback(member.feedback || "")
    setIsEditDialogOpen(true)
  }

  const handleSaveFeedback = () => {
    if (!editingMember) return

    setTeams((prev) => ({
      ...prev,
      [selectedRush]: prev[selectedRush as keyof typeof prev].map((team: any) =>
        team.id === editingMember.teamId
          ? {
              ...team,
              members: team.members.map((member: any) =>
                member.uuid === editingMember.uuid ? { ...member, rating: tempRating, feedback: tempFeedback } : member,
              ),
            }
          : team,
      ),
    }))

    // Close dialog and reset state
    setIsEditDialogOpen(false)
    setEditingMember(null)
    setTempRating(0)
    setTempFeedback("")
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setEditingMember(null)
    setTempRating(0)
    setTempFeedback("")
  }

  const handleAddTeam = () => {
    if (newTeamMembers.length === 3) {
      const newTeamId = `team-${currentTeams.length + 1}`
      const newTeam = {
        id: newTeamId,
        name: `Team ${currentTeams.length + 1}`,
        members: newTeamMembers.map((uuid) => {
          const student = allStudents.find((s) => s.uuid === uuid)
          return {
            uuid,
            name: student?.name || "",
            username: student?.username || "",
            rating: 0,
            feedback: "",
          }
        }),
      }

      setTeams((prev) => ({
        ...prev,
        [selectedRush]: [...prev[selectedRush as keyof typeof prev], newTeam],
      }))

      setNewTeamMembers([])
      setIsAddingTeam(false)
    }
  }

  const getRatingBadge = (rating: number) => {
    const option = ratingOptions.find((r) => r.value === rating)
    return (
      <Badge className={option?.color}>
        {rating} - {option?.label}
      </Badge>
    )
  }

  const getRatingStats = () => {
    const allMembers = currentTeams.flatMap((team: any) => team.members)
    return ratingOptions.map((option) => ({
      ...option,
      count: allMembers.filter((member: any) => member.rating === option.value).length,
    }))
  }

  const getUsedStudentIds = () => {
    return currentTeams.flatMap((team: any) => team.members.map((member: any) => member.uuid))
  }

  const getAvailableStudents = () => {
    const usedIds = getUsedStudentIds()
    // Also exclude students already selected for the new team
    const allExcludedIds = [...usedIds, ...newTeamMembers]
    return allStudents.filter((student) => !allExcludedIds.includes(student.uuid))
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rush Evaluation</h2>
          <p className="text-muted-foreground">Evaluate student performance in rush projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedRush} onValueChange={setSelectedRush}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Rush Project" />
            </SelectTrigger>
            <SelectContent>
              {rushProjects.map((rush) => (
                <SelectItem key={rush.id} value={rush.id}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {rush.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddingTeam(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        </div>
      </div>

      {/* Rush Project Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {rushProjects.find((r) => r.id === selectedRush)?.name}
          </CardTitle>
          <CardDescription>{rushProjects.find((r) => r.id === selectedRush)?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {getRatingStats().map((stat) => (
              <div key={stat.value} className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold mb-2">{stat.count}</div>
                <div className="text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Teams List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams ({currentTeams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTeams.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No teams found</p>
                <p className="text-sm text-muted-foreground">Add a team to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentTeams.map((team: any) => (
                  <Button
                    key={team.id}
                    variant={selectedTeam === team.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {team.name}
                    <Badge variant="secondary" className="ml-auto">
                      {team.members.length}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{currentTeam ? `${currentTeam.name} - Members` : "Select a team to view members"}</CardTitle>
            {currentTeam && <CardDescription>Evaluate each team member's performance</CardDescription>}
          </CardHeader>
          <CardContent>
            {!currentTeam ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a team from the left to view and edit member evaluations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTeam.members.map((member: any) => (
                  <div key={member.uuid} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-sm">
                          {member.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.username}</div>
                        </div>
                        <div>{getRatingBadge(member.rating)}</div>
                        {member.feedback && (
                          <div className="text-sm bg-muted p-3 rounded max-w-md">
                            <div className="flex items-center gap-1 mb-1">
                              <MessageSquare className="h-3 w-3" />
                              <span className="font-medium text-xs">Feedback:</span>
                            </div>
                            {member.feedback}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEditMember(member, currentTeam.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Team Dialog */}
      <Dialog open={isAddingTeam} onOpenChange={setIsAddingTeam}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>
              Select 3 students to form a new team for the {rushProjects.find((r) => r.id === selectedRush)?.name} rush.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm font-medium">Selected Members ({newTeamMembers.length}/3):</div>
            <div className="space-y-2">
              {newTeamMembers.map((uuid, index) => {
                const student = allStudents.find((s) => s.uuid === uuid)
                return (
                  <div key={uuid} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{student?.name}</div>
                      <div className="text-sm text-muted-foreground">{student?.username}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewTeamMembers(newTeamMembers.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
            {newTeamMembers.length < 3 && (
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Search className="h-4 w-4 mr-2" />
                    Add Student...
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search students..." />
                    <CommandList>
                      <CommandEmpty>No available students found.</CommandEmpty>
                      <CommandGroup>
                        {getAvailableStudents().map((student) => (
                          <CommandItem
                            key={student.uuid}
                            value={student.name}
                            onSelect={() => {
                              if (newTeamMembers.length < 3 && !newTeamMembers.includes(student.uuid)) {
                                setNewTeamMembers([...newTeamMembers, student.uuid])
                              }
                              setSearchOpen(false)
                            }}
                          >
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">{student.username}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTeam(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTeam} disabled={newTeamMembers.length !== 3}>
              Create Team ({newTeamMembers.length}/3)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Rush Evaluation</DialogTitle>
            <DialogDescription>
              Update rating and feedback for {editingMember?.name} in the{" "}
              {rushProjects.find((r) => r.id === selectedRush)?.name} rush.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="rating">Rating</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ratingOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={tempRating === option.value ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-start text-left"
                      onClick={() => setTempRating(option.value)}
                    >
                      <div className="font-semibold">
                        {option.value} - {option.label.split(" ")[0]}
                      </div>
                      <div className="text-xs opacity-70">{option.label}</div>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  ref={textareaRef}
                  id="feedback"
                  value={tempFeedback}
                  onChange={(e) => setTempFeedback(e.target.value)}
                  placeholder="Add detailed feedback about the student's performance, teamwork, and technical skills..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeedback}>
              <Check className="h-4 w-4 mr-2" />
              Save Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
