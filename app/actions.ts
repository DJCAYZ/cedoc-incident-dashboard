"use server";

import { incidentsTable, resourcesTable, sessionsTable } from '@/db/schema';
import { drizzle } from 'drizzle-orm/libsql';
import { eq, desc, ne, and, sql, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import dayjs from 'dayjs';

const db = drizzle(process.env.DB_FILE_NAME!);

export type InsertIncident = typeof incidentsTable.$inferInsert;
export type Incident = typeof incidentsTable.$inferSelect;
export type ResourceMetrics = typeof resourcesTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;

// --- Session Logic ---

export async function getActiveSessions() {
    return await db.select().from(sessionsTable).where(eq(sessionsTable.status, 'active')).orderBy(desc(sessionsTable.started_at));
}

export async function getSessionById(id: number): Promise<Session | undefined> {
    const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    return sessions.length > 0 ? sessions[0] : undefined;
}

export async function createEventSession(name: string) {
    const newSession = await db.insert(sessionsTable).values({
        name: name,
        type: 'event',
        status: 'active',
        started_at: Date.now()
    }).returning();
    revalidatePath('/');
    revalidatePath('/admin');
    return newSession[0];
}

export async function closeSession(id: number) {
    await db.update(sessionsTable).set({ status: 'closed', closed_at: Date.now() }).where(eq(sessionsTable.id, id));
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function getAllSessions() {
    return await db.select().from(sessionsTable).orderBy(desc(sessionsTable.started_at));
}

// --- Incident Logic ---

export async function getIncidents(sessionId?: number) {
    if (sessionId) {
        return await db.select().from(incidentsTable).where(eq(incidentsTable.session_id, sessionId)).orderBy(desc(incidentsTable.created_at));
    }
    return await db.select().from(incidentsTable).orderBy(desc(incidentsTable.created_at));
}

export async function getActiveIncidents(sessionId?: number) {
    if (sessionId) {
        return await db.select().from(incidentsTable).where(and(ne(incidentsTable.status, 'Closed'), eq(incidentsTable.session_id, sessionId))).orderBy(desc(incidentsTable.created_at));
    }
    return await db.select().from(incidentsTable).where(ne(incidentsTable.status, 'Closed')).orderBy(desc(incidentsTable.created_at));
}

export async function getResolvedIncidents(sessionId?: number) {
    if (sessionId) {
        return await db.select().from(incidentsTable).where(and(eq(incidentsTable.status, 'Closed'), eq(incidentsTable.session_id, sessionId))).orderBy(desc(incidentsTable.created_at));
    }
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
        resolved_at: Date.now()
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

// --- KPI Logic ---

export async function getKpiData(timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    let startTime = 0;
    const now = dayjs();
    
    if (timeRange === 'daily') startTime = now.startOf('day').valueOf();
    else if (timeRange === 'weekly') startTime = now.startOf('week').valueOf();
    else if (timeRange === 'monthly') startTime = now.startOf('month').valueOf();
    else if (timeRange === 'yearly') startTime = now.startOf('year').valueOf();
    
    // Get incidents within range
    const incidents = await db.select().from(incidentsTable).where(gte(incidentsTable.created_at, startTime));
    
    return incidents;
}