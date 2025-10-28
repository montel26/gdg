import { NextRequest, NextResponse } from 'next/server'
import { speakerQueries } from '@/lib/db'

export async function GET() {
  try {
    const speakers = await speakerQueries.getAll()
    return NextResponse.json(speakers)
  } catch (error) {
    console.error('Error fetching speakers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const speakerData = await request.json()
    const newSpeaker = await speakerQueries.create(speakerData)
    return NextResponse.json(newSpeaker, { status: 201 })
  } catch (error) {
    console.error('Error creating speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
