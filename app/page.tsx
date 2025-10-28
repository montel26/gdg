"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context-new"
import { EventHeader } from "@/components/event-header"
import { ScheduleFilters } from "@/components/schedule-filters"
import { ScheduleTimeline } from "@/components/schedule-timeline"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function Home() {
  const [selectedTrack, setSelectedTrack] = useState("All")
  const { event, sessions, isLoading } = useData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!event || !sessions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    )
  }

  const tracks = Array.from(new Set(sessions.map((s) => s.track)))

  const filteredSessions = selectedTrack === "All" ? sessions : sessions.filter((s) => s.track === selectedTrack)

  return (
    <div className="min-h-screen bg-background">
      <EventHeader event={event} />

      <div className="sticky top-0 z-10 shadow-sm">
        <ScheduleFilters tracks={tracks} selectedTrack={selectedTrack} onTrackChange={setSelectedTrack} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Event Schedule</h2>
            <p className="mt-2 text-muted-foreground">
              {filteredSessions.length} {filteredSessions.length === 1 ? "session" : "sessions"}
              {selectedTrack !== "All" && ` in ${selectedTrack}`}
            </p>
          </div>
          <Link href="/speakers">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Users className="h-4 w-4" />
              View All Speakers
            </Button>
          </Link>
        </div>

        <ScheduleTimeline sessions={filteredSessions} />
      </div>
    </div>
  )
}
