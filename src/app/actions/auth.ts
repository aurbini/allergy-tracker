'use server'

import bcrypt from 'bcryptjs'

import { db } from '@/db/client'
import { users } from '@/db/schema'
import { getCoordinates } from '@/lib/location'

export async function registerUser(
  name: string,
  email: string,
  password: string,
  city: string,
  state: string,
  country: string
) {
  const hash = await bcrypt.hash(password, 10)

  // Get coordinates for the location (with rate limiting by email)
  const coordinates = await getCoordinates(city, state, country, email)

  await db.insert(users).values({
    name,
    email,
    password: hash,
    city,
    state,
    country,
    latitude: coordinates?.latitude?.toString(),
    longitude: coordinates?.longitude?.toString(),
  })
  return { success: true }
}
