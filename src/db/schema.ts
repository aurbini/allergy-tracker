import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'

export const allergies = pgTable('allergies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  severity: text('severity').notNull(),
})
