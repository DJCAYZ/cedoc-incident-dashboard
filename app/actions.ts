"use server";

import { incidentsTable, resourcesTable } from '@/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, desc, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const db = drizzle(process.env.DATABASE_URL!);

export type InsertIncident = typeof incidentsTable.$inferInsert;
export type Incident = typeof incidentsTable.$inferSelect;
export type ResourceMetrics = typeof resourcesTable.$inferSelect;

export async function getIncidents() {
    return await db.select().from(incidentsTable).orderBy(desc(incidentsTable.created_at));
}

export async function getActiveIncidents() {
    return await db.select().from(incidentsTable).where(ne(incidentsTable.status, 'Closed')).orderBy(desc(incidentsTable.created_at));
}

export async function getResolvedIncidents() {
    return await db.select().from(incidentsTable).where(eq(incidentsTable.status, 'Closed')).orderBy(desc(incidentsTable.created_at));
}

export async function createIncident(data: InsertIncident) {
    await db.insert(incidentsTable).values(data);
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function resolveIncident(id: number) {
    await db.update(incidentsTable).set({ 
        status: 'Closed',
        resolved_at: new Date(),
    }).where(eq(incidentsTable.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function updateIncident(id: number, data: Partial<InsertIncident>) {
    await db.update(incidentsTable).set(data).where(eq(incidentsTable.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function getResources(): Promise<ResourceMetrics> {
    const rows = await db.select().from(resourcesTable).where(eq(resourcesTable.id, 1));
    if (rows.length === 0) {
        const defaultRow = {
            id: 1,
            ambulances_active: 12,
            ambulances_total: 15,
            fire_trucks_active: 4,
            fire_trucks_total: 5,
            rescue_boats_active: 8,
            rescue_boats_total: 8,
            personnel_total: 142
        };
        await db.insert(resourcesTable).values(defaultRow);
        return defaultRow;
    }
    return rows[0];
}

export async function updateResources(data: Partial<Omit<ResourceMetrics, 'id'>>) {
    await db.update(resourcesTable).set(data).where(eq(resourcesTable.id, 1));
    revalidatePath('/');
    revalidatePath('/admin');
}