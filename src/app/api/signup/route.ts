import { NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { users } from '@/db/schema'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    console.log('Signup attempt for:', email)

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (existing) {
      console.log('Email already exists:', email)
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    console.log('Inserting user:', { name, email })
    
    await db.insert(users).values({ name, email, password: hashed })
    console.log('User created successfully')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
