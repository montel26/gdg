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

  // Check authentication via API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/admin/login")
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/admin/login")
    }
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

          <TabsContent value="event" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Event Information</h2>
              <Button onClick={() => setShowEventForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Edit Event
              </Button>
            </div>
            {event && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                <p className="text-muted-foreground mb-4">{event.description}</p>
                <div className="grid gap-2 text-sm">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sessions</h2>
              <Button onClick={() => setShowSessionForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Session
              </Button>
            </div>
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{session.track}</Badge>
                        <Badge variant="outline">{session.room}</Badge>
                        <Badge variant="outline">{session.startTime} - {session.endTime}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSession(session.id)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSession(session.id)}>Delete</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="speakers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Speakers</h2>
              <Button onClick={() => setShowSpeakerForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Speaker
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {speakers.map((speaker) => (
                <Card key={speaker.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{speaker.name}</h3>
                      <p className="text-sm text-muted-foreground">{speaker.title}</p>
                      <p className="text-sm text-muted-foreground">{speaker.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSpeaker(speaker.id)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSpeaker(speaker.id)}>Delete</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Form Modal */}
      {showEventForm && event && (
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm event={event} onCancel={() => setShowEventForm(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Speaker Add Modal */}
      <Dialog open={showSpeakerForm} onOpenChange={setShowSpeakerForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Speaker</DialogTitle>
          </DialogHeader>
          <SpeakerForm onCancel={() => setShowSpeakerForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Session Add Modal */}
      <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Session</DialogTitle>
          </DialogHeader>
          <SessionForm onCancel={() => setShowSessionForm(false)} />
        </DialogContent>
      </Dialog>
      {/* Session Edit Modal */}
      <Dialog open={sessionModalOpen} onOpenChange={setSessionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Add Session"}</DialogTitle>
          </DialogHeader>
          <SessionForm session={editingSession ? sessions.find(s => s.id === editingSession) : undefined} onCancel={handleCloseSessionModal} />
        </DialogContent>
      </Dialog>

      {/* Speaker Edit Modal */}
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
