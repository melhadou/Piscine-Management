"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MessageSquare, Trophy } from "lucide-react"
import Link from "next/link"

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

interface StudentTableProps {
  students?: Student[]
}

export function StudentTable({ students = [] }: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 10

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No students found</p>
      </div>
    )
  }

  const totalPages = Math.ceil(students.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const endIndex = startIndex + studentsPerPage
  const currentStudents = students.slice(startIndex, endIndex)

  const getStatusBadge = (student: Student) => {
    if (!student.grades) {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700">
          No Data
        </Badge>
      )
    }

    const completedGrades = Object.values(student.grades).filter((grade) => grade.status === "finished")
    const averageGrade =
      completedGrades.length > 0
        ? completedGrades.reduce((sum, grade) => sum + grade.grade, 0) / completedGrades.length
        : 0

    const rushRating = student.rushRating || 0

    if (student.level >= 8.0 && averageGrade >= 80 && rushRating >= 3) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
    } else if (student.level >= 6.0 && averageGrade >= 70) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
    } else if (student.level >= 4.0 && averageGrade >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Average</Badge>
    } else if (student.location === "unavailable") {
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700">
          Inactive
        </Badge>
      )
    } else {
      return <Badge variant="destructive">Needs Attention</Badge>
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 8.0) return "text-green-600 font-semibold"
    if (level >= 6.0) return "text-blue-600 font-semibold"
    if (level >= 4.0) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  const getRushRatingBadge = (rating?: number) => {
    if (!rating || rating === 0) {
      return (
        <Badge variant="outline" className="text-xs">
          No Rating
        </Badge>
      )
    }

    const colors = {
      4: "bg-green-100 text-green-800 border-green-200",
      3: "bg-blue-100 text-blue-800 border-blue-200",
      2: "bg-yellow-100 text-yellow-800 border-yellow-200",
      1: "bg-red-100 text-red-800 border-red-200",
    }

    return (
      <Badge className={colors[rating as keyof typeof colors]} variant="outline">
        {rating}/4
      </Badge>
    )
  }

  const getCompletedExercises = (student: Student) => {
    if (!student.grades || typeof student.grades !== "object") {
      return "0/0"
    }

    const completed = Object.values(student.grades).filter((grade) => grade && grade.status === "finished").length
    const total = Object.keys(student.grades).length
    return `${completed}/${total}`
  }

  const getAverageGrade = (student: Student) => {
    if (!student.grades || typeof student.grades !== "object") {
      return "N/A"
    }

    const completedGrades = Object.values(student.grades).filter((grade) => grade && grade.status === "finished")
    if (completedGrades.length === 0) return "N/A"

    const average = completedGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / completedGrades.length
    const roundedAverage = Math.round(average)

    // Ensure we return a string to avoid NaN display
    return isNaN(roundedAverage) ? "N/A" : roundedAverage.toString()
  }

  const formatLevel = (level: number) => {
    if (typeof level !== "number" || isNaN(level)) {
      return "0.00"
    }
    return level.toFixed(2)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Exercises</TableHead>
              <TableHead>Avg Grade</TableHead>
              <TableHead>Rush Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.map((student) => (
              <TableRow key={student.uuid}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {student.firstName || "Unknown"} {student.lastName || "Student"}
                    </div>
                    <div className="text-sm text-muted-foreground">{student.login || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{student.email || "N/A"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={getLevelColor(student.level || 0)}>{formatLevel(student.level || 0)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getCompletedExercises(student)}</span>
                    <Badge variant="outline" className="text-xs">
                      {student.location !== "unavailable" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{getAverageGrade(student)}</span>
                </TableCell>
                <TableCell>{getRushRatingBadge(student.rushRating)}</TableCell>
                <TableCell>{getStatusBadge(student)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/student/${student.uuid}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/notes?student=${student.uuid}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/rush-evaluation`}>
                        <Trophy className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, students.length)} of {students.length} students
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
