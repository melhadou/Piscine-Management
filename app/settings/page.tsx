"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Users,
  Shield,
  Database,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Key,
  UserCheck,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock staff data
const mockStaff = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@piscine.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-09-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@piscine.com",
    role: "staff",
    status: "active",
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2023-09-15T09:30:00Z",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@piscine.com",
    role: "evaluator",
    status: "inactive",
    lastLogin: "2024-01-10T12:20:00Z",
    createdAt: "2023-10-01T14:15:00Z",
  },
]

const roles = [
  { value: "admin", label: "Administrator", description: "Full system access" },
  { value: "staff", label: "Staff Member", description: "Can manage students and notes" },
  { value: "evaluator", label: "Evaluator", description: "Can only evaluate and add notes" },
]

export default function SettingsPage() {
  const [staff, setStaff] = useState(mockStaff)
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoBackup: true,
    guestAccess: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxFileSize: 10,
    dataRetention: 365,
  })

  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "staff",
  })

  const handleAddStaff = () => {
    const staff_member = {
      id: staff.length + 1,
      ...newStaff,
      status: "active",
      lastLogin: null,
      createdAt: new Date().toISOString(),
    }
    setStaff([...staff, staff_member])
    setNewStaff({ name: "", email: "", role: "staff" })
    setIsAddingStaff(false)
  }

  const handleUpdateStaff = () => {
    setStaff(staff.map((s) => (s.id === editingStaff.id ? editingStaff : s)))
    setEditingStaff(null)
  }

  const handleDeleteStaff = (staffId: number) => {
    setStaff(staff.filter((s) => s.id !== staffId))
  }

  const handleToggleStatus = (staffId: number) => {
    setStaff(staff.map((s) => (s.id === staffId ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)))
  }

  const getRoleBadge = (role: string) => {
    const roleInfo = roles.find((r) => r.value === role)
    const colors = {
      admin: "bg-red-100 text-red-800",
      staff: "bg-blue-100 text-blue-800",
      evaluator: "bg-green-100 text-green-800",
    }
    return <Badge className={colors[role as keyof typeof colors]}>{roleInfo?.label || role}</Badge>
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="outline" className="border-red-300 text-red-700">
        Inactive
      </Badge>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage system settings and staff accounts</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure general system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">Receive email notifications for important events</div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Backup</Label>
                  <div className="text-sm text-muted-foreground">Automatically backup data daily</div>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number.parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: Number.parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>
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
                  <CardDescription>Manage staff accounts and permissions</CardDescription>
                </div>
                <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                      <DialogDescription>Create a new staff account with appropriate permissions.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={newStaff.role}
                          onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <div>
                                  <div className="font-medium">{role.label}</div>
                                  <div className="text-sm text-muted-foreground">{role.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddStaff} disabled={!newStaff.name || !newStaff.email}>
                        Add Staff Member
                      </Button>
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
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(member.id)}>
                        <UserCheck className="h-4 w-4 mr-1" />
                        {member.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingStaff(member)}>
                        <Edit className="h-4 w-4" />
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
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">Require 2FA for all staff accounts</div>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Guest Access</Label>
                  <div className="text-sm text-muted-foreground">Allow read-only access for guests</div>
                </div>
                <Switch
                  checked={settings.guestAccess}
                  onCheckedChange={(checked) => setSettings({ ...settings, guestAccess: checked })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <Label className="text-base">Password Requirements</Label>
                </div>
                <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                  <div>• Minimum 8 characters</div>
                  <div>• At least one uppercase letter</div>
                  <div>• At least one number</div>
                  <div>• At least one special character</div>
                </div>
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
              <CardDescription>Backup, export, and manage system data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Download className="h-6 w-6 mb-2" />
                  Export All Data
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Upload className="h-6 w-6 mb-2" />
                  Import Data
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Create Backup
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Database className="h-6 w-6 mb-2" />
                  Database Stats
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention (days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings({ ...settings, dataRetention: Number.parseInt(e.target.value) })}
                  className="w-32"
                />
                <div className="text-sm text-muted-foreground">
                  How long to keep deleted records before permanent removal
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-base">Database Statistics</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">342</div>
                    <div className="text-sm text-muted-foreground">Total Notes</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">28</div>
                    <div className="text-sm text-muted-foreground">Rush Teams</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Staff Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff member information and permissions.</DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select
                  value={editingStaff.role}
                  onValueChange={(value) => setEditingStaff({ ...editingStaff, role: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateStaff}>Update Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
