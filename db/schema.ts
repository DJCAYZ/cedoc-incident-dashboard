import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const incidentsTable = sqliteTable("incidents", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull().default('Other'),
  severity: text().notNull().default('🟢 Normal'),
  location: text().notNull(),
  barangay: text().notNull().default('Unknown'),
  status: text().notNull().default('Reported'),
  responding_unit: text().notNull().default('None'),
  casualties_dead: int().notNull().default(0),
  casualties_injured: int().notNull().default(0),
  casualties_missing: int().notNull().default(0),
  evacuated_families: int().notNull().default(0),
  evacuated_individuals: int().notNull().default(0),
  created_at: int().notNull(),
  resolved_at: int(),
});

export const resourcesTable = sqliteTable("resources", {
  id: int().primaryKey().default(1),
  ambulances_active: int().notNull().default(12),
  ambulances_total: int().notNull().default(15),
  fire_trucks_active: int().notNull().default(4),
  fire_trucks_total: int().notNull().default(5),
  rescue_boats_active: int().notNull().default(8),
  rescue_boats_total: int().notNull().default(8),
  personnel_total: int().notNull().default(142)
});