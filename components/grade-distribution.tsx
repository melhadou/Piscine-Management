"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

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

interface GradeDistributionProps {
  students: Student[]
}

export function GradeDistribution({ students }: GradeDistributionProps) {
  // Calculate grade distribution
  const getGradeDistribution = () => {
    const distribution = {
      "0-2": 0,
      "2-4": 0,
      "4-6": 0,
      "6-8": 0,
      "8-10": 0,
    }

    students.forEach((student) => {
      const level = student.level || 0
      if (level >= 0 && level < 2) {
        distribution["0-2"]++
      } else if (level >= 2 && level < 4) {
        distribution["2-4"]++
      } else if (level >= 4 && level < 6) {
        distribution["4-6"]++
      } else if (level >= 6 && level < 8) {
        distribution["6-8"]++
      } else if (level >= 8) {
        distribution["8-10"]++
      }
    })

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
    }))
  }

  const data = getGradeDistribution()

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" tick={{ fontSize: 12 }} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
