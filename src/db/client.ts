import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

// Add sslmode=require to connection string for Vercel
const connectionString = process.env.DATABASE_URL?.includes('sslmode=') 
  ? process.env.DATABASE_URL 
  : `${process.env.DATABASE_URL}?sslmode=require`

const pool = new Pool({
  connectionString
})

export const db = drizzle(pool, { schema })
