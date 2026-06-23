import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const incidentsTable = sqliteTable("incidents", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  location: text().notNull(),
  created_at: int().notNull(),
  status: text().notNull(),
});