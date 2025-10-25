'use server'

import bcrypt from 'bcryptjs'

import { db } from '@/db/client'
import { users } from '@/db/schema'

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const hash = await bcrypt.hash(password, 10)
  await db.insert(users).values({ name, email, password: hash })
  return { success: true }
}
