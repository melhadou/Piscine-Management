"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, MessageSquare } from "lucide-react"
import Link from "next/link"

interface Student {
  uuid: string
  username: string
  name: string
  email: string
  level: number
  examGrades: {
    exam00: number
    exam01: number
    exam02: number
    finalExam: number
  }
  finalExamValidated: boolean
  rushesValidated: string
  validatedProjects: number
  codingLevel: string
}

interface StudentTableProps {
  students: Student[]
}

export function StudentTable({ students }: StudentTableProps) {
  const getStatusColor = (student: Student) => {
    if (student.finalExamValidated && student.level >= 3.0) {
      return "bg-green-100 text-green-800 border-green-200"
    }
    if (!student.finalExamValidated && student.level >= 2.5) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getStatusText = (student: Student) => {
    if (student.finalExamValidated && student.level >= 3.0) {
      return "Recommended"
    }
    if (!student.finalExamValidated && student.level >= 2.5) {
      return "Review"
    }
    return "Not Recommended"
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Final Exam</TableHead>
            <TableHead>Rush Projects</TableHead>
            <TableHead>Coding Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.uuid} className={student.finalExamValidated ? "bg-green-50" : ""}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-muted-foreground">{student.username}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{student.level}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{student.examGrades.finalExam}</span>
                  {student.finalExamValidated ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge variant="destructive">✗</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{student.rushesValidated}</TableCell>
              <TableCell>
                <Badge variant="secondary">{student.codingLevel}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(student)}>{getStatusText(student)}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/student/${student.uuid}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
