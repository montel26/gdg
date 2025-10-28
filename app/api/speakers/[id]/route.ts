import { NextRequest, NextResponse } from 'next/server'
import { speakerQueries } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const speaker = await speakerQueries.getById(id)
    if (!speaker) {
      return NextResponse.json(
        { error: 'Speaker not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(speaker)
  } catch (error) {
    console.error('Error fetching speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    await speakerQueries.update(id, updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating speaker:', error)
    // Check if it's a serverless database error
    if (error?.message?.includes('serverless platforms')) {
      return NextResponse.json(
        { 
          error: 'Database write operations are not configured for this environment. ' +
                 'Please configure a database (Firestore, Supabase, etc.) for production.',
          code: 'DATABASE_NOT_CONFIGURED'
        },
        { status: 501 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await speakerQueries.delete(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting speaker:', error)
    // Check if it's a serverless database error
    if (error?.message?.includes('serverless platforms')) {
      return NextResponse.json(
        { 
          error: 'Database write operations are not configured for this environment. ' +
                 'Please configure a database (Firestore, Supabase, etc.) for production.',
          code: 'DATABASE_NOT_CONFIGURED'
        },
        { status: 501 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
