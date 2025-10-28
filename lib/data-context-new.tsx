"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Speaker {
  id: string
  name: string
  title: string
  company?: string
  bio: string
  image: string
  twitter?: string
  linkedin?: string
  github?: string
  rating: number
  reviewCount: number
}

export interface Session {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  track: string
  speakerIds: string[]
  tags: string[]
}

export interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  image: string
}

export interface Review {
  id: string
  speakerId?: string
  sessionId?: string
  userName: string
  userEmail?: string
  userAvatar: string
  rating: number
  comment: string
  date: string
}

interface DataContextType {
  speakers: Speaker[]
  sessions: Session[]
  event: Event | null
  reviews: Review[]
  addSpeaker: (speaker: Omit<Speaker, "id" | "rating" | "reviewCount">) => Promise<void>
  updateSpeaker: (id: string, speaker: Partial<Speaker>) => Promise<void>
  deleteSpeaker: (id: string) => Promise<void>
  addSession: (session: Omit<Session, "id">) => Promise<void>
  updateSession: (id: string, session: Partial<Session>) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  updateEvent: (event: Partial<Event>) => Promise<void>
  addReview: (review: Omit<Review, "id">) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  getSpeakerById: (id: string) => Speaker | undefined
  getSessionById: (id: string) => Session | undefined
  getSessionsBySpeakerId: (speakerId: string) => Session[]
  getReviewsBySpeakerId: (speakerId: string) => Review[]
  getReviewsBySessionId: (sessionId: string) => Review[]
  isLoading: boolean
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      
      const [speakersRes, sessionsRes, eventRes, reviewsRes] = await Promise.all([
        fetch('/api/speakers'),
        fetch('/api/sessions'),
        fetch('/api/events'),
        fetch('/api/reviews')
      ])

      if (speakersRes.ok) {
        const speakersData = await speakersRes.json()
        setSpeakers(Array.isArray(speakersData) ? speakersData : [])
      } else {
        console.error('Failed to fetch speakers data:', speakersRes.status)
        setSpeakers([])
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      } else {
        console.error('Failed to fetch sessions data:', sessionsRes.status)
        setSessions([])
      }

      if (eventRes.ok) {
        const eventData = await eventRes.json()
        setEvent(eventData)
      } else {
        console.error('Failed to fetch event data:', eventRes.status)
        setEvent(null)
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      } else {
        console.error('Failed to fetch reviews data:', reviewsRes.status)
        setReviews([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch data on client side
    if (typeof window !== 'undefined') {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const addSpeaker = async (speakerData: Omit<Speaker, "id" | "rating" | "reviewCount">) => {
    try {
      const response = await fetch('/api/speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(speakerData)
      })

      if (response.ok) {
        await fetchData() 
      } else {
        throw new Error('Failed to add speaker')
      }
    } catch (error) {
      console.error('Error adding speaker:', error)
      throw error
    }
  }

  const updateSpeaker = async (id: string, speakerData: Partial<Speaker>) => {
    try {
      const response = await fetch(`/api/speakers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(speakerData)
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to update speaker')
      }
    } catch (error) {
      console.error('Error updating speaker:', error)
      throw error
    }
  }

  const deleteSpeaker = async (id: string) => {
    try {
      const response = await fetch(`/api/speakers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData() 
      } else {
        throw new Error('Failed to delete speaker')
      }
    } catch (error) {
      console.error('Error deleting speaker:', error)
      throw error
    }
  }

  const addSession = async (sessionData: Omit<Session, "id">) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to add session')
      }
    } catch (error) {
      console.error('Error adding session:', error)
      throw error
    }
  }

  const updateSession = async (id: string, sessionData: Partial<Session>) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to update session')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      throw error
    }
  }

  const deleteSession = async (id: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to delete session')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  const updateEvent = async (eventData: Partial<Event>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  const addReview = async (reviewData: Omit<Review, "id">) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to add review')
      }
    } catch (error) {
      console.error('Error adding review:', error)
      throw error
    }
  }

  const deleteReview = async (id: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData() // Refresh data
      } else {
        throw new Error('Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  const getSpeakerById = (id: string) => speakers.find((speaker) => speaker.id === id)

  const getSessionById = (id: string) => sessions.find((session) => session.id === id)

  const getSessionsBySpeakerId = (speakerId: string) =>
    sessions.filter((session) => session.speakerIds.includes(speakerId))

  const getReviewsBySpeakerId = (speakerId: string) => 
    reviews.filter((review) => review.speakerId === speakerId)

  const getReviewsBySessionId = (sessionId: string) => 
    reviews.filter((review) => review.sessionId === sessionId)

  const refreshData = async () => {
    await fetchData()
  }

  const value: DataContextType = {
    speakers,
    sessions,
    event,
    reviews,
    addSpeaker,
    updateSpeaker,
    deleteSpeaker,
    addSession,
    updateSession,
    deleteSession,
    updateEvent,
    addReview,
    deleteReview,
    getSpeakerById,
    getSessionById,
    getSessionsBySpeakerId,
    getReviewsBySpeakerId,
    getReviewsBySessionId,
    isLoading,
    refreshData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
