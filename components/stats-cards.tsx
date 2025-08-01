import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Trophy, TrendingUp } from "lucide-react"

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

interface StatsCardsProps {
  students: Student[]
}

export function StatsCards({ students }: StatsCardsProps) {
  const totalStudents = students?.length || 0

  const activeStudents = students?.filter((s) => s.location !== "unavailable").length || 0

  const averageLevel = totalStudents > 0 ? students.reduce((acc, s) => acc + (s.level || 0), 0) / totalStudents : 0

  const studentsWithGrades = students?.filter((s) => s.grades && Object.keys(s.grades).length > 0).length || 0

  const formatNumber = (num: number) => {
    if (typeof num !== "number" || isNaN(num)) {
      return "0"
    }
    return num.toFixed(1)
  }

  const formatPercentage = (numerator: number, denominator: number) => {
    if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
      return "0%"
    }
    return `${Math.round((numerator / denominator) * 100)}%`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground">Enrolled in piscine</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeStudents}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(activeStudents, totalStudents)} participation rate
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Level</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(averageLevel)}</div>
          <p className="text-xs text-muted-foreground">Current progression</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Grades</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentsWithGrades}</div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(studentsWithGrades, totalStudents)} have submissions
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
