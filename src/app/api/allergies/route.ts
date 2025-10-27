import { getServerSession } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

import { and, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { allergies } from '@/db/schema'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userAllergies = await db
      .select()
      .from(allergies)
      .where(eq(allergies.userId, parseInt(session.user.id)))
      .orderBy(allergies.createdAt)

    return NextResponse.json({ allergies: userAllergies })
  } catch (error) {
    console.error('Error fetching allergies:', error)
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
    const { type, pollen, severity } = body

    // Validate required fields
    if (!type || !pollen || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields: type, pollen, severity' },
        { status: 400 }
      )
    }

    // Insert the allergy into the database
    const result = await db.insert(allergies).values({
      type,
      pollenName: pollen,
      severity,
      userId: parseInt(session.user.id),
    })

    return NextResponse.json({
      success: true,
      message: 'Allergy added successfully',
      // Cannot reliably provide insert ID due to driver support, so omit 'id'
    })
  } catch (error) {
    console.error('Error adding allergy:', error)
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
    const allergyId = searchParams.get('id')

    if (!allergyId) {
      return NextResponse.json(
        { error: 'Allergy ID is required' },
        { status: 400 }
      )
    }

    // Delete the allergy (only if it belongs to the user)
    await db
      .delete(allergies)
      .where(
        and(
          eq(allergies.id, parseInt(allergyId)),
          eq(allergies.userId, parseInt(session.user.id))
        )
      )

    return NextResponse.json({
      success: true,
      message: 'Allergy deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting allergy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
