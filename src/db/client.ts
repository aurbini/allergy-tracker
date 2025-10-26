import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

// Environment-based database configuration
const isProduction = process.env.NODE_ENV === 'production'
const connectionString = process.env.DATABASE_POSTGRES_URL

console.log('Environment:', process.env.NODE_ENV)
console.log('Connection string length:', connectionString?.length)
console.log(
  'Connection string starts with:',
  connectionString?.substring(0, 20)
)
console.log('Connection string ends with:', connectionString?.substring(-20))
console.log('Full connection string:', connectionString)

const pool = new Pool({
  connectionString,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
})

export const db = drizzle(pool, { schema })
