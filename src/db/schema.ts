import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const allergies = pgTable('allergies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  severity: text('severity').notNull(),
  userId: integer('user_id').references(() => users.id),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  password: text('password').notNull(),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  latitude: text('latitude'),
  longitude: text('longitude'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
