import { drizzle } from 'drizzle-orm/postgres-js'

const connectionString = process.env.DATABASE_POSTGRES_URL ?? ''
console.log('connectionString', connectionString)

export const db = drizzle(connectionString)
