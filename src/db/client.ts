import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

// Supabase connection configuration
console.log(
  'DATABASE_POSTGRES_URL length:',
  process.env.DATABASE_POSTGRES_URL?.length
)
console.log(
  'DATABASE_POSTGRES_URL starts with:',
  process.env.DATABASE_POSTGRES_URL?.substring(0, 20)
)
console.log(
  'All env vars with DATABASE:',
  Object.keys(process.env).filter((key) => key.includes('DATABASE'))
)

const pool = new Pool({
  connectionString: process.env.DATABASE_POSTGRES_URL,
  ssl: false,
})

export const db = drizzle(pool, { schema })
