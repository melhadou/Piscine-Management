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
    // Check if we're in the browser (not SSR)
    if (typeof window === 'undefined') return null
    
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CACHE_KEY)
      }
      return null
    }
  }

  // Save data to cache
  const setCachedData = (data: Student[]) => {
    // Check if we're in the browser (not SSR)
    if (typeof window === 'undefined') return
    
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
    // Check if we're in the browser (not SSR)
    if (typeof window === 'undefined') return true
    
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
    console.log('StudentCache: fetchStudents called, force:', force)
    
    // If not forced, check cache first
    if (!force) {
      const cachedData = getCachedData()
      if (cachedData && cachedData.length > 0) {
        console.log('StudentCache: Using existing cached data')
        setStudents(cachedData)
        setError(null)
        return
      }
    }

    console.log('StudentCache: Fetching from API...')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/students')
      console.log('StudentCache: API response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('StudentCache: API response data success:', data.success, 'students count:', data.students?.length || 0)
      
      if (data.success) {
        const studentsData = data.students || []
        console.log('StudentCache: Setting students data:', studentsData.length, 'students')
        setStudents(studentsData)
        setCachedData(studentsData)
        setError(null)
      } else {
        throw new Error(data.error || 'API returned success: false')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      console.error('StudentCache: Fetch error:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Clear cache
  const clearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
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
    // Only run on client side
    if (typeof window === 'undefined') return
    
    console.log('StudentCache: Initializing...')
    
    const cachedData = getCachedData()
    console.log('StudentCache: Cached data found:', !!cachedData, 'length:', cachedData?.length || 0)
    
    if (cachedData && cachedData.length > 0) {
      console.log('StudentCache: Using cached data')
      setStudents(cachedData)
      
      // If data is stale, fetch in background
      if (isDataStale()) {
        console.log('StudentCache: Data is stale, fetching fresh data in background')
        fetchStudents(true)
      }
    } else {
      // No valid cache, fetch immediately
      console.log('StudentCache: No cached data, fetching immediately')
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