import { NextRequest, NextResponse } from 'next/server'
import { speakerQueries } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const speaker = await speakerQueries.getById(params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    await speakerQueries.update(params.id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await speakerQueries.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting speaker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
