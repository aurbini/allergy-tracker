import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

import { desc, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { symptoms } from '@/db/schema'
import { authOptions } from '@/lib/authOptions'
import { symptomSchema } from '@/schemas/symptomSchema'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all symptoms for the user, ordered by date (newest first)
    const userSymptoms = await db
      .select()
      .from(symptoms)
      .where(eq(symptoms.userId, parseInt(session.user.id)))
      .orderBy(desc(symptoms.date))

    return NextResponse.json({ symptoms: userSymptoms })
  } catch (error) {
    console.error('Error fetching symptoms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validatedData = symptomSchema.parse(body)
    const { type, severity, notes, date } = validatedData

    // Insert the symptom into the database
    const result = await db.insert(symptoms).values({
      type,
      severity,
      notes: notes || null,
      date: new Date(date),
      userId: parseInt(session.user.id),
    })

    return NextResponse.json({
      success: true,
      message: 'Symptom added successfully',
    })
  } catch (error) {
    console.error('Error adding symptom:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symptomId = searchParams.get('id')

    if (!symptomId) {
      return NextResponse.json(
        { error: 'Symptom ID is required' },
        { status: 400 }
      )
    }

    // Delete the symptom (only if it belongs to the user)
    const result = await db
      .delete(symptoms)
      .where(
        eq(symptoms.id, parseInt(symptomId)) &&
          eq(symptoms.userId, parseInt(session.user.id))
      )

    return NextResponse.json({
      success: true,
      message: 'Symptom deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting symptom:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
