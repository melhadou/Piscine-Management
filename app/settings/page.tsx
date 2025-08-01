"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, Users, Shield, Database, Mail, Trash2, Plus, Save, Download } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for staff members
const mockStaff = [
  {
    id: "1",
    name: "John Admin",
    email: "john.admin@piscine.com",
    role: "admin",
    avatar: "/placeholder-user.jpg",
    lastLogin: "2024-01-15 14:30",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Staff",
    email: "sarah.staff@piscine.com",
    role: "staff",
    avatar: "/placeholder-user.jpg",
    lastLogin: "2024-01-15 09:15",
    status: "active",
  },
  {
    id: "3",
    name: "Mike Evaluator",
    email: "mike.eval@piscine.com",
    role: "evaluator",
    avatar: "/placeholder-user.jpg",
    lastLogin: "2024-01-14 16:45",
    status: "inactive",
  },
]

export default function SettingsPage() {
  const [staff, setStaff] = useState(mockStaff)
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [editingStaff, setEditingStaff] = useState<string | null>(null)
  const [newStaff, setNewStaff] = useState({ name: "", email: "", role: "staff" })
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoBackup: true,
    requireTwoFactor: false,
    allowGuestAccess: false,
    dataRetentionDays: 365,
    maxFileSize: 10,
  })

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email) {
      const newMember = {
        id: Date.now().toString(),
        ...newStaff,
        avatar: "/placeholder-user.jpg",
        lastLogin: "Never",
        status: "active",
      }
      setStaff([...staff, newMember])
      setNewStaff({ name: "", email: "", role: "staff" })
      setIsAddingStaff(false)
    }
  }

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter((member) => member.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setStaff(
      staff.map((member) =>
        member.id === id ? { ...member, status: member.status === "active" ? "inactive" : "active" } : member,
      ),
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "staff":
        return "bg-blue-100 text-blue-800"
      case "evaluator":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your piscine dashboard configuration</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">Receive email notifications for important events</div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Backup</Label>
                  <div className="text-sm text-muted-foreground">Automatically backup data daily</div>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoBackup: checked }))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="retention">Data Retention (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, dataRetentionDays: Number.parseInt(e.target.value) }))
                  }
                  className="w-32"
                />
                <div className="text-sm text-muted-foreground">
                  How long to keep student data after piscine completion
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filesize">Max File Size (MB)</Label>
                <Input
                  id="filesize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxFileSize: Number.parseInt(e.target.value) }))}
                  className="w-32"
                />
                <div className="text-sm text-muted-foreground">Maximum size for CSV file uploads</div>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Management
                  </CardTitle>
                  <CardDescription>Manage staff members and their permissions</CardDescription>
                </div>
                <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>Add a new staff member to the piscine management system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newStaff.role}
                          onValueChange={(value) => setNewStaff((prev) => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="evaluator">Evaluator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingStaff(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStaff}>Add Staff Member</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <div className="text-xs text-muted-foreground">Last login: {member.lastLogin}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(member.id)}>
                        {member.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {member.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteStaff(member.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Require all staff to use 2FA for enhanced security
                  </div>
                </div>
                <Switch
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, requireTwoFactor: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow Guest Access</Label>
                  <div className="text-sm text-muted-foreground">Allow read-only access for guest users</div>
                </div>
                <Switch
                  checked={settings.allowGuestAccess}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowGuestAccess: checked }))}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Session Management</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">Active Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">7 days</div>
                      <p className="text-xs text-muted-foreground">Session Timeout</p>
                    </CardContent>
                  </Card>
                </div>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Revoke All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Manage data backup, export, and cleanup operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-muted-foreground">Total Students</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">3,891</div>
                    <p className="text-xs text-muted-foreground">Total Notes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">156 MB</div>
                    <p className="text-xs text-muted-foreground">Database Size</p>
                  </CardContent>
                </Card>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Backup & Export</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Create Backup
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Backup
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">Last backup: January 15, 2024 at 3:00 AM</div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data Cleanup</h4>
                <div className="flex flex-wrap gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clean Old Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clean Old Data</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove data older than {settings.dataRetentionDays} days. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Clean Data</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Optimize Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
