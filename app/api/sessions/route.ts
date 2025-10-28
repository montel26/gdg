import { NextRequest, NextResponse } from 'next/server'
import { sessionQueries } from '@/lib/db'

export async function GET() {
  try {
    const sessions = await sessionQueries.getAll()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()
    const newSession = await sessionQueries.create(sessionData)
    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
