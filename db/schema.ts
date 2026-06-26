import { pgTable, primaryKey } from 'drizzle-orm/pg-core';
import * as t from "drizzle-orm/pg-core";

export const incidentsTable = pgTable("incidents", {
  id: t.serial("id").primaryKey(),
  name: t.varchar("name").notNull(),
  type: t.varchar("type").notNull().default("Other"),
  severity: t.varchar("severity").notNull().default("🟢 Normal"),
  location: t.varchar("location").notNull(),
  barangay: t.varchar("barangay").notNull().default("Unknown"),
  status: t.varchar("status").notNull().default("Reported"),
  responding_unit: t.varchar("responding_unit").notNull().default("None"),
  casualties_dead: t.integer("casualties_dead").notNull().default(0),
  casualties_injured: t.integer("casualties_injured").notNull().default(0),
  casualties_missing: t.integer("casualties_missing").notNull().default(0),
  evacuated_families: t.integer("evacuated_families").notNull().default(0),
  evacuated_individuals: t.integer("evacuated_individuals").notNull().default(0),
  details: t.text("details").notNull().default(""),
  created_at: t.timestamp("created_at").notNull().defaultNow(),
  resolved_at: t.timestamp("resolved_at"),
});

export const resourcesTable = pgTable("resources", {
  id: t.integer("id").primaryKey(),
  ambulances_active: t.integer("ambulances_active").notNull().default(12),
  ambulances_total: t.integer("ambulances_total").notNull().default(15),
  fire_trucks_active: t.integer("fire_trucks_active").notNull().default(4),
  fire_trucks_total: t.integer("fire_trucks_total").notNull().default(5),
  rescue_boats_active: t.integer("rescue_boats_active").notNull().default(8),
  rescue_boats_total: t.integer("rescue_boats_total").notNull().default(8),
  personnel_total: t.integer("personnel_total").notNull().default(142),
});

export const barangaysTable = pgTable("barangays",{
  name: t.varchar().primaryKey(),
});

export const streetsTable = pgTable("streets", {
  name: t.varchar(),
  barangay: t.varchar(),
}, (table) => [
  primaryKey({ columns: [table.name, table.barangay] }),
]);

export const user = pgTable("user", {
	id: t.text("id").primaryKey(),
	name: t.text("name").notNull(),
	email: t.varchar("email", { length: 255 }).notNull().unique(),
	emailVerified: t.boolean("email_verified").notNull(),
	image: t.text("image"),
	createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
	updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
});

export const session = pgTable("session", {
	id: t.text("id").primaryKey(),
	userId: t.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	token: t.varchar("token", { length: 255 }).notNull().unique(),
	expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
	ipAddress: t.text("ip_address"),
	userAgent: t.text("user_agent"),
	createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
	updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
});

export const account = pgTable("account", {
	id: t.text("id").primaryKey(),
	userId: t.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	accountId: t.text("account_id").notNull(),
	providerId: t.text("provider_id").notNull(),
	accessToken: t.text("access_token"),
	refreshToken: t.text("refresh_token"),
	accessTokenExpiresAt: t.timestamp("access_token_expires_at", { precision: 6, withTimezone: true }),
	refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at", { precision: 6, withTimezone: true }),
	scope: t.text("scope"),
	idToken: t.text("id_token"),
	password: t.text("password"),
	createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
	updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
	id: t.text("id").primaryKey(),
	identifier: t.text("identifier").notNull(),
	value: t.text("value").notNull(),
	expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
	createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
	updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
});