"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, CheckCircle, XCircle } from "lucide-react"
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
  rushParticipation: Array<{
    project: string
    team: string
    grade: number
  }>
  profileImage?: string
}

interface StudentTableProps {
  students: Student[]
}

export function StudentTable({ students }: StudentTableProps) {
  const getStatusColor = (validated: boolean) => {
    return validated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusIcon = (validated: boolean) => {
    return validated ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Final Exam</TableHead>
            <TableHead>Rush Participation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.uuid} className={student.finalExamValidated ? "bg-green-50" : ""}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.profileImage || "/placeholder.svg"} alt={student.name} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.username}</div>
                    <div className="text-xs text-muted-foreground">{student.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{student.level}</div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Grade: {student.examGrades.finalExam}</span>
                  </div>
                  <Badge className={getStatusColor(student.finalExamValidated)}>
                    {getStatusIcon(student.finalExamValidated)}
                    <span className="ml-1">{student.finalExamValidated ? "Validated" : "Not Validated"}</span>
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {student.rushParticipation.length > 0 ? (
                  <div className="space-y-1">
                    {student.rushParticipation.map((rush, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">{rush.project}</div>
                        <div className="text-muted-foreground">
                          {rush.team} - Grade: {rush.grade}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">No participation</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(student.finalExamValidated)}>
                  {student.finalExamValidated ? "Recommended" : "Review Required"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/student/${student.uuid}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View profile</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
