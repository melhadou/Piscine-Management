"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Users,
  GraduationCap,
  Trophy,
  RefreshCw,
} from "lucide-react"

interface ImportResult {
  success: boolean
  message: string
  data?: any[]
  errors?: string[]
  warnings?: string[]
}

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState("students")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setSelectedFile(file)
      setImportResult(null)
      // Preview the CSV data
      previewCSV(file)
    } else {
      alert("Please select a valid CSV file")
    }
  }, [])

  const previewCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").slice(0, 6) // Preview first 5 rows + header
      const data = lines.map((line) => line.split(","))
      setPreviewData(data)
    }
    reader.readAsText(file)
  }

  const simulateImport = async () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    clearInterval(progressInterval)
    setUploadProgress(100)

    // Simulate import results based on type
    let result: ImportResult

    switch (importType) {
      case "students":
        result = {
          success: true,
          message: "Successfully imported student data",
          data: [
            { name: "John Doe", email: "john@example.com", status: "imported" },
            { name: "Jane Smith", email: "jane@example.com", status: "imported" },
            { name: "Bob Wilson", email: "bob@example.com", status: "updated" },
          ],
          warnings: ["2 students already existed and were updated"],
        }
        break
      case "grades":
        result = {
          success: true,
          message: "Successfully imported exam grades",
          data: [
            { student: "John Doe", exam: "Exam 01", grade: 85, status: "imported" },
            { student: "Jane Smith", exam: "Exam 01", grade: 92, status: "imported" },
          ],
          warnings: ["1 grade was overwritten"],
        }
        break
      case "rush_teams":
        result = {
          success: true,
          message: "Successfully imported rush team assignments",
          data: [
            { team: "Team Alpha", members: "John, Jane, Bob", project: "Square", status: "imported" },
            { team: "Team Beta", members: "Alice, Charlie, David", project: "Square", status: "imported" },
          ],
        }
        break
      default:
        result = {
          success: false,
          message: "Unknown import type",
          errors: ["Please select a valid import type"],
        }
    }

    setImportResult(result)
    setIsUploading(false)
  }

  const downloadTemplate = (type: string) => {
    let csvContent = ""

    switch (type) {
      case "students":
        csvContent = "username,name,email,uuid,age,gender,campus,coding_level,occupation\n"
        csvContent += "john.doe,John DOE,john@example.com,uuid-123,23,M,Paris,Beginner,Student\n"
        csvContent += "jane.smith,Jane SMITH,jane@example.com,uuid-456,24,F,London,Intermediate,Developer"
        break
      case "grades":
        csvContent = "username,exam_name,grade,validated\n"
        csvContent += "john.doe,Exam 00,45,false\n"
        csvContent += "john.doe,Exam 01,78,true\n"
        csvContent += "jane.smith,Exam 00,89,true"
        break
      case "rush_teams":
        csvContent = "team_name,project_type,member1,member2,member3,member4\n"
        csvContent += "Team Alpha,square,john.doe,jane.smith,bob.wilson,\n"
        csvContent += "Team Beta,skyscraper,alice.cooper,charlie.brown,david.jones,eve.taylor"
        break
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getImportTypeIcon = (type: string) => {
    switch (type) {
      case "students":
        return <Users className="h-4 w-4" />
      case "grades":
        return <GraduationCap className="h-4 w-4" />
      case "rush_teams":
        return <Trophy className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getImportTypeDescription = (type: string) => {
    switch (type) {
      case "students":
        return "Import basic student information including personal details and contact info"
      case "grades":
        return "Import exam grades and validation status for students"
      case "rush_teams":
        return "Import rush project team assignments and member groupings"
      default:
        return "Select an import type"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Import Data</h2>
          <p className="text-muted-foreground">Upload CSV files to import student data, grades, and team assignments</p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="templates">Download Templates</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>Select the type of data you want to import and upload your CSV file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-type">Import Type</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select import type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Student Data
                        </div>
                      </SelectItem>
                      <SelectItem value="grades">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Exam Grades
                        </div>
                      </SelectItem>
                      <SelectItem value="rush_teams">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Rush Teams
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{getImportTypeDescription(importType)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input id="csv-file" type="file" accept=".csv" onChange={handleFileSelect} disabled={isUploading} />
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading and processing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button onClick={simulateImport} disabled={!selectedFile || isUploading} className="w-full">
                  {isUploading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview and Results */}
            <Card>
              <CardHeader>
                <CardTitle>Preview & Results</CardTitle>
                <CardDescription>Preview your data before import and view results after processing</CardDescription>
              </CardHeader>
              <CardContent>
                {previewData.length > 0 && !importResult && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Data Preview (first 5 rows)</h4>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {previewData[0]?.map((header, index) => (
                              <TableHead key={index} className="text-xs">
                                {header}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.slice(1).map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex} className="text-xs">
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {importResult && (
                  <div className="space-y-4">
                    <Alert
                      className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                    >
                      {importResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertTitle>{importResult.success ? "Import Successful" : "Import Failed"}</AlertTitle>
                      <AlertDescription>{importResult.message}</AlertDescription>
                    </Alert>

                    {importResult.warnings && importResult.warnings.length > 0 && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Warnings</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1">
                            {importResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {importResult.errors && importResult.errors.length > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle>Errors</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1">
                            {importResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {importResult.data && importResult.data.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Imported Data Summary</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableBody>
                              {importResult.data.slice(0, 5).map((item, index) => (
                                <TableRow key={index}>
                                  {Object.entries(item).map(([key, value]) => (
                                    <TableCell key={key} className="text-xs">
                                      <div>
                                        <span className="font-medium">{key}:</span> {String(value)}
                                      </div>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        {importResult.data.length > 5 && (
                          <p className="text-sm text-muted-foreground">
                            ... and {importResult.data.length - 5} more items
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Data Template
                </CardTitle>
                <CardDescription>Template for importing basic student information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Includes:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Username</li>
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>UUID</li>
                    <li>Age, gender</li>
                    <li>Campus location</li>
                    <li>Coding level</li>
                    <li>Occupation</li>
                  </ul>
                </div>
                <Button onClick={() => downloadTemplate("students")} className="w-full mt-4" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Exam Grades Template
                </CardTitle>
                <CardDescription>Template for importing exam scores and validation status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Includes:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Student username</li>
                    <li>Exam name/type</li>
                    <li>Grade score</li>
                    <li>Validation status</li>
                  </ul>
                </div>
                <Button
                  onClick={() => downloadTemplate("grades")}
                  className="w-full mt-4"
                  variant="outline"
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Rush Teams Template
                </CardTitle>
                <CardDescription>Template for importing rush project team assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Includes:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Team name</li>
                    <li>Project type</li>
                    <li>Team members</li>
                    <li>Member usernames</li>
                  </ul>
                </div>
                <Button onClick={() => downloadTemplate("rush_teams")} className="w-full mt-4" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Guidelines</CardTitle>
              <CardDescription>Important information about CSV file formatting and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">File Requirements</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Files must be in CSV format (.csv)</li>
                    <li>First row must contain column headers</li>
                    <li>Use UTF-8 encoding for special characters</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Maximum 1000 rows per import</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Data Validation</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Email addresses must be valid format</li>
                    <li>UUIDs must be unique across system</li>
                    <li>Usernames must be unique and lowercase</li>
                    <li>Grades must be numeric (0-100)</li>
                    <li>Required fields cannot be empty</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Imports</CardTitle>
              <CardDescription>View your recent import activities and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-01-15 14:30</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Students
                      </div>
                    </TableCell>
                    <TableCell>students_batch_1.csv</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-01-14 09:15</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Grades
                      </div>
                    </TableCell>
                    <TableCell>exam_01_grades.csv</TableCell>
                    <TableCell>42</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Warning
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-01-13 16:45</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Rush Teams
                      </div>
                    </TableCell>
                    <TableCell>rush_square_teams.csv</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
