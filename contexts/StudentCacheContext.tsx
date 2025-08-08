"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Student {
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

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface StudentCacheContextType {
  students: Student[]
  loading: boolean
  error: string | null
  fetchStudents: (force?: boolean) => Promise<void>
  clearCache: () => void
  isDataStale: () => boolean
  refreshCache: () => Promise<void>
}

const StudentCacheContext = createContext<StudentCacheContextType | undefined>(undefined)

const CACHE_KEY = 'piscine_students_cache'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

interface StudentCacheProviderProps {
  children: ReactNode
}

export function StudentCacheProvider({ children }: StudentCacheProviderProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if cached data exists and is valid
  const getCachedData = (): Student[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const cacheEntry: CacheEntry<Student[]> = JSON.parse(cached)
      const now = Date.now()

      if (now > cacheEntry.expiry) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return cacheEntry.data
    } catch (error) {
      console.error('Error reading cached data:', error)
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  }

  // Save data to cache
  const setCachedData = (data: Student[]) => {
    try {
      const cacheEntry: CacheEntry<Student[]> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_DURATION
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry))
    } catch (error) {
      console.error('Error caching data:', error)
    }
  }

  // Check if data is stale (older than 15 minutes)
  const isDataStale = (): boolean => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return true

      const cacheEntry: CacheEntry<Student[]> = JSON.parse(cached)
      const now = Date.now()
      const staleThreshold = 15 * 60 * 1000 // 15 minutes

      return (now - cacheEntry.timestamp) > staleThreshold
    } catch (error) {
      return true
    }
  }

  // Fetch students data
  const fetchStudents = async (force: boolean = false) => {
    // If not forced, check cache first
    if (!force) {
      const cachedData = getCachedData()
      if (cachedData && cachedData.length > 0) {
        setStudents(cachedData)
        setError(null)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/students')
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      if (data.success) {
        const studentsData = data.students || []
        setStudents(studentsData)
        setCachedData(studentsData)
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch students')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      console.error('Error fetching students:', err)
    } finally {
      setLoading(false)
    }
  }

  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    setStudents([])
    setError(null)
  }

  // Refresh cache (force fetch and clear stale data)
  const refreshCache = async () => {
    clearCache()
    await fetchStudents(true)
  }

  // Load cached data on mount
  useEffect(() => {
    const cachedData = getCachedData()
    if (cachedData && cachedData.length > 0) {
      setStudents(cachedData)
      
      // If data is stale, fetch in background
      if (isDataStale()) {
        fetchStudents(true)
      }
    } else {
      // No valid cache, fetch immediately
      fetchStudents(true)
    }
  }, [])

  const value: StudentCacheContextType = {
    students,
    loading,
    error,
    fetchStudents,
    clearCache,
    isDataStale,
    refreshCache
  }

  return (
    <StudentCacheContext.Provider value={value}>
      {children}
    </StudentCacheContext.Provider>
  )
}

export function useStudentCache() {
  const context = useContext(StudentCacheContext)
  if (context === undefined) {
    throw new Error('useStudentCache must be used within a StudentCacheProvider')
  }
  return context
}