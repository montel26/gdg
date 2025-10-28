"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { useData } from "@/lib/data-context-new"

interface SessionReviewFormProps {
  sessionId: string
  onSubmit?: (review: { rating: number; comment: string; userName: string }) => void
}

export function SessionReviewForm({ sessionId, onSubmit }: SessionReviewFormProps) {
  const { addReview } = useData()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating > 0 && comment.trim() && userName.trim()) {
      setIsLoading(true)
      try {
        await addReview({
          sessionId,
          rating,
          comment,
          userName,
          userEmail: userEmail.trim() || undefined,
          userAvatar: "/placeholder.svg",
          date: new Date().toISOString().split('T')[0]
        })
        onSubmit?.({ rating, comment, userName })
        setSubmitted(true)
        setTimeout(() => {
          setRating(0)
          setComment("")
          setUserName("")
          setUserEmail("")
          setSubmitted(false)
        }, 2000)
      } catch (error) {
        console.error('Error submitting review:', error)
        alert('Failed to submit review. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
      {submitted ? (
        <div className="py-8 text-center">
          <p className="text-lg font-medium text-green-600">Thank you for your review!</p>
          <p className="text-sm text-muted-foreground mt-2">Your feedback helps others.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <Label htmlFor="userEmail">Email (Optional)</Label>
            <Input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label>Rating</Label>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i < (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this talk..."
              rows={4}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={rating === 0 || isLoading}>
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}
    </Card>
  )
}
