"use client"

import { use } from "react"
import { useData } from "@/lib/data-context-new"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SessionReviewForm } from "@/components/session-review-form"
import { ReviewCard } from "@/components/review-card"

export const dynamic = 'force-dynamic'

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getSessionById, getReviewsBySessionId, getSpeakerById, isLoading } = useData()
  
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

  const session = getSessionById(id)
  const reviews = getReviewsBySessionId(id)

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <p className="text-muted-foreground mb-6">The session you're looking for doesn't exist.</p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schedule
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const speakers = session.speakerIds.map(getSpeakerById).filter(Boolean)
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Schedule
              </Button>
            </Link>
          </div>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold tracking-tight">{session.title}</h1>
                <Badge className="text-sm">{session.track}</Badge>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{speakers.length} speaker(s)</span>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">{session.description}</p>
              
              {session.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {speakers.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Speakers</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {speakers.map((speaker) => (
                  <Card key={speaker.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1">{speaker.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{speaker.title}</p>
                        {speaker.company && <Badge variant="secondary" className="mb-3">{speaker.company}</Badge>}
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                          {speaker.bio}
                        </p>
                        <Link href={`/speakers/${speaker.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this talk!</p>
                )}
              </div>
              <div className="lg:sticky lg:top-4 lg:self-start">
                <SessionReviewForm sessionId={session.id} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
