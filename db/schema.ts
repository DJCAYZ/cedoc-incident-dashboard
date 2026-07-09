import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
export const sessionsTable = sqliteTable("sessions", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  type: text().notNull().default('daily'),
  status: text().notNull().default('active'),
  started_at: int().notNull(),
  closed_at: int(),
});

export const incidentsTable = sqliteTable("incidents", {
  id: int().primaryKey({ autoIncrement: true }),
  session_id: int().references(() => sessionsTable.id),
  name: text().notNull(),
  type: text().notNull().default('Other'),
  severity: text().notNull().default('🟢 Normal'),
  location: text().notNull(),
  barangay: text().notNull().default('Unknown'),
  latitude: real(),
  longitude: real(),
  status: text().notNull().default('Reported'),
  responding_unit: text().notNull().default('None'),
  casualties_dead: int().notNull().default(0),
  casualties_injured: int().notNull().default(0),
  casualties_missing: int().notNull().default(0),
  evacuated_families: int().notNull().default(0),
  evacuated_individuals: int().notNull().default(0),
  details: text().notNull().default(""),
  call_taker: text().notNull().default('Unknown'),
  responder: text().notNull().default('Unknown'),
  created_at: int().notNull(),
  resolved_at: int(),
});

// Dynamic vehicles — each row is one vehicle type (e.g. Ambulance, Rescue Boat, Rescue Truck)
export const vehiclesTable = sqliteTable("vehicles", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  active: int().notNull().default(0),
  total: int().notNull().default(0),
});

// Dynamic water rescue equipment — each row is one item type (e.g. Vest, Helmet, Floater)
export const waterRescueEquipmentTable = sqliteTable("water_rescue_equipment", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  quantity: int().notNull().default(0),
  deployed: int().notNull().default(0),
});

// Personnel by agency — deployed/available per session
export const personnelTable = sqliteTable("personnel", {
  id: int().primaryKey({ autoIncrement: true }),
  session_id: int().references(() => sessionsTable.id),
  agency: text().notNull(),
  deployed: int().notNull().default(0),
  available: int().notNull().default(0),
});

// Disaster preparedness measures — title + description per session
export const preparednessTable = sqliteTable("preparedness", {
  id: int().primaryKey({ autoIncrement: true }),
  session_id: int().references(() => sessionsTable.id),
  title: text().notNull(),
  description: text().notNull(),
  created_at: int().notNull(),
});

// Flooded areas — per session, for typhoon/rain events
export const floodedAreasTable = sqliteTable("flooded_areas", {
  id: int().primaryKey({ autoIncrement: true }),
  session_id: int().references(() => sessionsTable.id),
  barangay: text().notNull(),
  area_description: text().notNull(),
  severity: text().notNull().default('Moderate'),
  created_at: int().notNull(),
});

// Water levels — manual entry for waterways, per session
export const waterLevelsTable = sqliteTable("water_levels", {
  id: int().primaryKey({ autoIncrement: true }),
  session_id: int().references(() => sessionsTable.id),
  waterway_name: text().notNull(),
  level_meters: int().notNull().default(0),
  status: text().notNull().default('Normal'),
  updated_at: int().notNull(),
});