import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

// Handle SSL for Vercel database - bypass certificate validation
const pool = new Pool({
  connectionString: process.env.DATABASE_POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
  },
})

export const db = drizzle(pool, { schema })
