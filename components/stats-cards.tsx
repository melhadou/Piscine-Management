import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Trophy, TrendingUp } from "lucide-react"

interface Student {
  finalExamValidated: boolean
  level: number
  validatedProjects: number
  rushesValidated: string
}

interface StatsCardsProps {
  students: Student[]
}

export function StatsCards({ students }: StatsCardsProps) {
  const totalStudents = students.length
  const passedFinalExam = students.filter((s) => s.finalExamValidated).length
  const averageLevel = students.reduce((acc, s) => acc + s.level, 0) / totalStudents
  const averageProjects = students.reduce((acc, s) => acc + s.validatedProjects, 0) / totalStudents

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">Active piscine candidates</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Final Exam Pass</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{passedFinalExam}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((passedFinalExam / totalStudents) * 100)}% pass rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Level</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageLevel.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Current progression level</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Projects</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(averageProjects)}</div>
          <p className="text-xs text-muted-foreground">Validated projects per student</p>
        </CardContent>
      </Card>
    </div>
  )
}
