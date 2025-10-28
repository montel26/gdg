import type { Session } from "@/lib/data-context-new"
import { SessionCard } from "./session-card"

interface ScheduleTimelineProps {
  sessions: Session[]
}

export function ScheduleTimeline({ sessions }: ScheduleTimelineProps) {
  
  const timeSlots = sessions.reduce(
    (acc, session) => {
      const timeKey = `${session.startTime} - ${session.endTime}`
      if (!acc[timeKey]) {
        acc[timeKey] = []
      }
      acc[timeKey].push(session)
      return acc
    },
    {} as Record<string, Session[]>,
  )

  return (
    <div className="space-y-12">
      {Object.entries(timeSlots).map(([timeSlot, sessions]) => (
        <div key={timeSlot}>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {timeSlot.split(" - ")[0]}
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
