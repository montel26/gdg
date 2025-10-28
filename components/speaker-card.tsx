import type { Speaker } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Link from "next/link"
import { useData } from "@/lib/data-context-new"

interface SpeakerCardProps {
  speaker: Speaker
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  const { getReviewsBySpeakerId } = useData()
  const reviews = getReviewsBySpeakerId(speaker.id)
  
  // Calculate rating and review count dynamically from actual reviews
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0
  const reviewCount = reviews.length
  return (
    <Link href={`/speakers/${speaker.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-background">
              <AvatarImage src={speaker.image || "/placeholder.svg"} alt={speaker.name} />
              <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-tight mb-1">{speaker.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{speaker.title}</p>
              {speaker.company && <Badge variant="secondary">{speaker.company}</Badge>}
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">{speaker.bio}</p>
          {reviewCount > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
