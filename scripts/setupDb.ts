import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Client } from 'pg'

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env

if (!POSTGRES_DB) {
  throw new Error('POSTGRES_DB is not defined in .env.local')
}

const main = async () => {
  const defaultClient = new Client({
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT) || 5432,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: 'postgres', // always connect to default first
    ssl: false,
  })

  await defaultClient.connect()

  // Check if db exists
  const res = await defaultClient.query(
    `SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}'`
  )

  if (res.rowCount === 0) {
    console.log(`Database "${POSTGRES_DB}" does not exist. Creating...`)
    await defaultClient.query(`CREATE DATABASE "${POSTGRES_DB}"`)
  } else {
    console.log(`Database "${POSTGRES_DB}" already exists ✅`)
  }

  await defaultClient.end()

  // Connect to target db
  const targetClient = new Client({
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT) || 5432,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    ssl: false,
  })

  await targetClient.connect()

  const db = drizzle(targetClient)
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './drizzle' })

  await targetClient.end()
  console.log('✅ Setup complete!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
