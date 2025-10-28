import { type Session } from "@/lib/data-context-new"
import { useData } from "@/lib/data-context-new"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SessionCardProps {
  session: Session
}

export function SessionCard({ session }: SessionCardProps) {
  const { getSpeakerById, getReviewsBySessionId } = useData()
  const speakers = session.speakerIds.map(getSpeakerById).filter(Boolean)
  const reviews = getReviewsBySessionId(session.id)
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">
                {session.startTime} - {session.endTime}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{session.room}</span>
            </div>
            <Link href={`/sessions/${session.id}`} className="group">
              <h3 className="text-xl font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">{session.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{session.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {session.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Badge className="flex-shrink-0">{session.track}</Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
          <div className="flex flex-wrap items-center gap-4">
            {speakers.map((speaker) => (
              <Link key={speaker?.id} href={`/speakers/${speaker?.id}`} className="flex items-center gap-3 group">
                <Avatar className="h-10 w-10 ring-2 ring-background group-hover:ring-primary transition-all">
                  <AvatarImage src={speaker?.image || "/placeholder.svg"} alt={speaker?.name} />
                  <AvatarFallback>{speaker?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{speaker?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {speaker?.title} at {speaker?.company}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {reviews.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ⭐ ({reviews.length})
              </div>
            )}
            <Link href={`/sessions/${session.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
