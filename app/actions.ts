"use server";

import { incidentsTable } from '@/db/schema';
import { drizzle } from 'drizzle-orm/libsql';

const db = drizzle(process.env.DB_FILE_NAME!);

export async function getIncidents() {
    return await db.select().from(incidentsTable);
}