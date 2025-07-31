"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Student {
  level: number
  examGrades: {
    finalExam: number
  }
}

interface GradeDistributionProps {
  students: Student[]
}

export function GradeDistribution({ students }: GradeDistributionProps) {
  // Create grade distribution data
  const gradeRanges = [
    { range: "0-20", min: 0, max: 20 },
    { range: "21-40", min: 21, max: 40 },
    { range: "41-60", min: 41, max: 60 },
    { range: "61-80", min: 61, max: 80 },
    { range: "81-100", min: 81, max: 100 },
  ]

  const data = gradeRanges.map((range) => ({
    range: range.range,
    count: students.filter(
      (student) => student.examGrades.finalExam >= range.min && student.examGrades.finalExam <= range.max,
    ).length,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
