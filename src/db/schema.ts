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
  type: varchar('type', { length: 50 }).notNull(), // tree, grass, weed
  pollenName: varchar('pollen_name', { length: 100 }).notNull(), // specific pollen name
  severity: varchar('severity', { length: 20 }).notNull(), // mild, moderate, severe
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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

export const symptoms = pgTable('symptoms', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // sneezing, runny_nose, itchy_eyes, etc.
  severity: varchar('severity', { length: 20 }).notNull(), // mild, moderate, severe
  notes: text('notes'), // optional notes about the symptom
  date: timestamp('date').notNull().defaultNow(), // when the symptom occurred
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
