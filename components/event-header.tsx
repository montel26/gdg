import type { Event } from "@/lib/data-context-new"
import { Calendar, MapPin } from "lucide-react"

interface EventHeaderProps {
  event: Event
}

export function EventHeader({ event }: EventHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-[url('/gdg.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-[url('/generated-tech-pattern.png')] opacity-10 bg-cover bg-center" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">{event.name}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">{event.description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2 text-blue-100">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">{event.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
