import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { users } from '@/db/schema'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)

    await db.insert(users).values({ name, email, password: hashed })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
