"use client"

import { use } from "react"
import { useData } from "@/lib/data-context-new"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ReviewCard } from "@/components/review-card"
import { ReviewForm } from "@/components/review-form"
import { ArrowLeft, Star, Twitter, Linkedin, Github } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default function SpeakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getSpeakerById, getSessionsBySpeakerId, getReviewsBySpeakerId, isLoading } = useData()
  
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

  const speaker = getSpeakerById(id)

  if (!speaker) {
    notFound()
  }

  const sessions = getSessionsBySpeakerId(speaker.id)
  const reviews = getReviewsBySpeakerId(speaker.id)
  
  // Calculate rating and review count dynamically from actual reviews
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0
  const reviewCount = reviews.length

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/speakers">
            <Button variant="ghost" className="gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Speakers
            </Button>
          </Link>

          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Avatar className="h-32 w-32 ring-4 ring-background">
              <AvatarImage src={speaker.image || "/placeholder.svg"} alt={speaker.name} />
              <AvatarFallback className="text-3xl">{speaker.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{speaker.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{speaker.title}</p>
              {speaker.company && (
                <Badge className="mt-3" variant="secondary">
                  {speaker.company}
                </Badge>
              )}

              {reviewCount > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                {speaker.twitter && (
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Twitter className="h-4 w-4" />
                    {speaker.twitter}
                  </Button>
                )}
                {speaker.linkedin && (
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
                {speaker.github && (
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Github className="h-4 w-4" />
                    {speaker.github}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">{speaker.bio}</p>
          </section>

          {sessions.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Sessions</h2>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-medium">
                            {session.startTime} - {session.endTime}
                          </span>
                        </div>
                      </div>
                      <Badge>{session.track}</Badge>
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
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              <div className="lg:sticky lg:top-4 lg:self-start">
                <ReviewForm speakerId={speaker.id} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
