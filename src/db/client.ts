import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from './schema'

console.log(
  'process.env.DATABASE_POSTGRES_URL',
  process.env.DATABASE_POSTGRES_URL
)
const connectionString = process.env.DATABASE_POSTGRES_URL ?? ''

export const db = drizzle(connectionString, { schema })
