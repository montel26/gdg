import { NextRequest, NextResponse } from 'next/server'
import { reviewQueries } from '@/lib/db'

export async function GET() {
  try {
    const reviews = await reviewQueries.getAll()
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json()
    
    // Validate that at least one of speakerId or sessionId is provided
    if (!reviewData.speakerId && !reviewData.sessionId) {
      return NextResponse.json(
        { error: 'Either speakerId or sessionId must be provided' },
        { status: 400 }
      )
    }
    
    const newReview = await reviewQueries.create(reviewData)
    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
