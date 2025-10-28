"use client"
import { Button } from "@/components/ui/button"

interface ScheduleFiltersProps {
  tracks: string[]
  selectedTrack: string
  onTrackChange: (track: string) => void
}

export function ScheduleFilters({ tracks, selectedTrack, onTrackChange }: ScheduleFiltersProps) {
  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by track:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedTrack === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => onTrackChange("All")}
            >
              All
            </Button>
            {tracks.map((track) => (
              <Button
                key={track}
                variant={selectedTrack === track ? "default" : "outline"}
                size="sm"
                onClick={() => onTrackChange(track)}
              >
                {track}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
