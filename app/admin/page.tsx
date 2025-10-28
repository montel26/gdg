"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Users, MessageSquare, LayoutDashboard, Plus, LogOut } from "lucide-react"
import { useData } from "@/lib/data-context-new"
import Link from "next/link"
import { EventForm } from "@/components/admin/event-form"
import { SessionForm } from "@/components/admin/session-form"
import { SpeakerForm } from "@/components/admin/speaker-form"

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const router = useRouter()
  const { speakers, sessions, reviews, event, isLoading, deleteSession, deleteSpeaker, deleteReview } = useData()
  const [showEventForm, setShowEventForm] = useState(false)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showSpeakerForm, setShowSpeakerForm] = useState(false)
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [speakerModalOpen, setSpeakerModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ✅ Check simple frontend auth using localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!loggedIn) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/admin/login")
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId)
        alert('Session deleted successfully!')
      } catch (error) {
        console.error(error)
        alert('Failed to delete session.')
      }
    }
  }

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (confirm('Are you sure you want to delete this speaker?')) {
      try {
        await deleteSpeaker(speakerId)
        alert('Speaker deleted successfully!')
      } catch (error) {
        console.error(error)
        alert('Failed to delete speaker.')
      }
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId)
        alert('Review deleted successfully!')
      } catch (error) {
        console.error(error)
        alert('Failed to delete review.')
      }
    }
  }

  const handleEditSession = (sessionId: string) => {
    setEditingSession(sessionId || null)
    setSessionModalOpen(true)
  }

  const handleEditSpeaker = (speakerId: string) => {
    setEditingSpeaker(speakerId || null)
    setSpeakerModalOpen(true)
  }

  const handleCloseSessionModal = () => {
    setSessionModalOpen(false)
    setEditingSession(null)
  }

  const handleCloseSpeakerModal = () => {
    setSpeakerModalOpen(false)
    setEditingSpeaker(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  const stats = [
    { label: "Total Sessions", value: sessions.length, icon: Calendar, color: "text-blue-600" },
    { label: "Total Speakers", value: speakers.length, icon: Users, color: "text-green-600" },
    { label: "Total Reviews", value: reviews.length, icon: MessageSquare, color: "text-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your GDG event</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">View Public Site</Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className={`h-12 w-12 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="event" className="space-y-6">
          <TabsList>
            <TabsTrigger value="event">Event Details</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Event, Sessions, Speakers, Reviews content stays the same */}
          {/* Use handleEditSession, handleEditSpeaker, handleDeleteSession, etc. */}
        </Tabs>
      </div>

      {/* Modals */}
      <Dialog open={sessionModalOpen} onOpenChange={setSessionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Add Session"}</DialogTitle>
          </DialogHeader>
          <SessionForm session={editingSession ? sessions.find(s => s.id === editingSession) : undefined} onCancel={handleCloseSessionModal} />
        </DialogContent>
      </Dialog>

      <Dialog open={speakerModalOpen} onOpenChange={setSpeakerModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSpeaker ? "Edit Speaker" : "Add Speaker"}</DialogTitle>
          </DialogHeader>
          <SpeakerForm speaker={editingSpeaker ? speakers.find(s => s.id === editingSpeaker) : undefined} onCancel={handleCloseSpeakerModal} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
