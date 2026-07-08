"use server";

import {
  incidentsTable,
  sessionsTable,
  vehiclesTable,
  waterRescueEquipmentTable,
  personnelTable,
  preparednessTable,
  floodedAreasTable,
  waterLevelsTable,
} from "@/db/schema";
import { drizzle } from "drizzle-orm/libsql";
import { eq, desc, ne, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";

const db = drizzle(process.env.DB_FILE_NAME!);

export type InsertIncident = typeof incidentsTable.$inferInsert;
export type Incident = typeof incidentsTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Vehicle = typeof vehiclesTable.$inferSelect;
export type WaterRescueEquipment = typeof waterRescueEquipmentTable.$inferSelect;
export type Personnel = typeof personnelTable.$inferSelect;
export type Preparedness = typeof preparednessTable.$inferSelect;
export type FloodedArea = typeof floodedAreasTable.$inferSelect;
export type WaterLevel = typeof waterLevelsTable.$inferSelect;

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
}

// --- Session Logic ---

export async function getActiveSessions() {
  return await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.status, "active"))
    .orderBy(desc(sessionsTable.started_at));
}

export async function getSessionById(
  id: number
): Promise<Session | undefined> {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, id))
    .limit(1);
  return sessions.length > 0 ? sessions[0] : undefined;
}

export async function createEventSession(name: string) {
  const newSession = await db
    .insert(sessionsTable)
    .values({
      name: name,
      type: "event",
      status: "active",
      started_at: Date.now(),
    })
    .returning();
  revalidateAll();
  return newSession[0];
}

export async function closeSession(id: number) {
  await db
    .update(sessionsTable)
    .set({ status: "closed", closed_at: Date.now() })
    .where(eq(sessionsTable.id, id));
  revalidateAll();
}

export async function getAllSessions() {
  return await db
    .select()
    .from(sessionsTable)
    .orderBy(desc(sessionsTable.started_at));
}

// --- Incident Logic ---

export async function getIncidents(sessionId?: number) {
  if (sessionId) {
    return await db
      .select()
      .from(incidentsTable)
      .where(eq(incidentsTable.session_id, sessionId))
      .orderBy(desc(incidentsTable.created_at));
  }
  return await db
    .select()
    .from(incidentsTable)
    .orderBy(desc(incidentsTable.created_at));
}

export async function getActiveIncidents(sessionId?: number) {
  if (sessionId) {
    return await db
      .select()
      .from(incidentsTable)
      .where(
        and(
          ne(incidentsTable.status, "Closed"),
          eq(incidentsTable.session_id, sessionId)
        )
      )
      .orderBy(desc(incidentsTable.created_at));
  }
  return await db
    .select()
    .from(incidentsTable)
    .where(ne(incidentsTable.status, "Closed"))
    .orderBy(desc(incidentsTable.created_at));
}

export async function getResolvedIncidents(sessionId?: number) {
  if (sessionId) {
    return await db
      .select()
      .from(incidentsTable)
      .where(
        and(
          eq(incidentsTable.status, "Closed"),
          eq(incidentsTable.session_id, sessionId)
        )
      )
      .orderBy(desc(incidentsTable.created_at));
  }
  return await db
    .select()
    .from(incidentsTable)
    .where(eq(incidentsTable.status, "Closed"))
    .orderBy(desc(incidentsTable.created_at));
}

export async function createIncident(data: InsertIncident) {
  await db.insert(incidentsTable).values(data);
  revalidateAll();
}

export async function resolveIncident(id: number) {
  await db
    .update(incidentsTable)
    .set({
      status: "Closed",
      resolved_at: Date.now(),
    })
    .where(eq(incidentsTable.id, id));
  revalidateAll();
}

export async function updateIncident(id: number, data: Partial<InsertIncident>) {
  await db.update(incidentsTable).set(data).where(eq(incidentsTable.id, id));
  revalidateAll();
}

// --- Vehicle Logic (dynamic) ---

export async function getVehicles(): Promise<Vehicle[]> {
  return await db.select().from(vehiclesTable).orderBy(vehiclesTable.id);
}

export async function addVehicle(name: string, active: number, total: number) {
  await db.insert(vehiclesTable).values({ name, active, total });
  revalidateAll();
}

export async function updateVehicle(id: number, active: number, total: number) {
  await db
    .update(vehiclesTable)
    .set({ active, total })
    .where(eq(vehiclesTable.id, id));
  revalidateAll();
}

export async function deleteVehicle(id: number) {
  await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
  revalidateAll();
}

// --- Water Rescue Equipment Logic (dynamic) ---

export async function getWaterRescueEquipment(): Promise<WaterRescueEquipment[]> {
  return await db
    .select()
    .from(waterRescueEquipmentTable)
    .orderBy(waterRescueEquipmentTable.id);
}

export async function addWaterRescueEquipment(
  name: string,
  quantity: number,
  deployed: number
) {
  await db
    .insert(waterRescueEquipmentTable)
    .values({ name, quantity, deployed });
  revalidateAll();
}

export async function updateWaterRescueEquipment(
  id: number,
  quantity: number,
  deployed: number
) {
  await db
    .update(waterRescueEquipmentTable)
    .set({ quantity, deployed })
    .where(eq(waterRescueEquipmentTable.id, id));
  revalidateAll();
}

export async function deleteWaterRescueEquipment(id: number) {
  await db
    .delete(waterRescueEquipmentTable)
    .where(eq(waterRescueEquipmentTable.id, id));
  revalidateAll();
}

// --- Personnel Logic (per session, per agency) ---

export async function getPersonnel(sessionId: number): Promise<Personnel[]> {
  const records = await db
    .select()
    .from(personnelTable)
    .where(eq(personnelTable.session_id, sessionId))
    .orderBy(personnelTable.agency);
  return records.filter((r) => r.agency !== "MDRRMO");
}

export async function upsertPersonnel(
  sessionId: number,
  agency: string,
  deployed: number,
  available: number
) {
  const existing = await db
    .select()
    .from(personnelTable)
    .where(
      and(
        eq(personnelTable.session_id, sessionId),
        eq(personnelTable.agency, agency)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(personnelTable)
      .set({ deployed, available })
      .where(eq(personnelTable.id, existing[0].id));
  } else {
    await db
      .insert(personnelTable)
      .values({ session_id: sessionId, agency, deployed, available });
  }
  revalidateAll();
}

// --- Preparedness Logic ---

export async function getPreparedness(sessionId: number): Promise<Preparedness[]> {
  return await db
    .select()
    .from(preparednessTable)
    .where(eq(preparednessTable.session_id, sessionId))
    .orderBy(desc(preparednessTable.created_at));
}

export async function createPreparedness(
  sessionId: number,
  title: string,
  description: string
) {
  await db.insert(preparednessTable).values({
    session_id: sessionId,
    title,
    description,
    created_at: Date.now(),
  });
  revalidateAll();
}

export async function deletePreparedness(id: number) {
  await db.delete(preparednessTable).where(eq(preparednessTable.id, id));
  revalidateAll();
}

// --- Flooded Areas Logic ---

export async function getFloodedAreas(sessionId: number): Promise<FloodedArea[]> {
  return await db
    .select()
    .from(floodedAreasTable)
    .where(eq(floodedAreasTable.session_id, sessionId))
    .orderBy(desc(floodedAreasTable.created_at));
}

export async function createFloodedArea(
  sessionId: number,
  barangay: string,
  areaDescription: string,
  severity: string
) {
  await db.insert(floodedAreasTable).values({
    session_id: sessionId,
    barangay,
    area_description: areaDescription,
    severity,
    created_at: Date.now(),
  });
  revalidateAll();
}

export async function deleteFloodedArea(id: number) {
  await db.delete(floodedAreasTable).where(eq(floodedAreasTable.id, id));
  revalidateAll();
}

// --- Water Levels Logic ---

export async function getWaterLevels(sessionId: number): Promise<WaterLevel[]> {
  return await db
    .select()
    .from(waterLevelsTable)
    .where(eq(waterLevelsTable.session_id, sessionId))
    .orderBy(waterLevelsTable.waterway_name);
}

export async function upsertWaterLevel(
  sessionId: number,
  waterwayName: string,
  levelMeters: number,
  status: string
) {
  const existing = await db
    .select()
    .from(waterLevelsTable)
    .where(
      and(
        eq(waterLevelsTable.session_id, sessionId),
        eq(waterLevelsTable.waterway_name, waterwayName)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(waterLevelsTable)
      .set({ level_meters: levelMeters, status, updated_at: Date.now() })
      .where(eq(waterLevelsTable.id, existing[0].id));
  } else {
    await db.insert(waterLevelsTable).values({
      session_id: sessionId,
      waterway_name: waterwayName,
      level_meters: levelMeters,
      status,
      updated_at: Date.now(),
    });
  }
  revalidateAll();
}

// --- KPI Logic ---

export async function getKpiData(
  timeRange: "daily" | "weekly" | "monthly" | "yearly"
) {
  let startTime = 0;
  const now = dayjs();

  if (timeRange === "daily") startTime = now.startOf("day").valueOf();
  else if (timeRange === "weekly") startTime = now.startOf("week").valueOf();
  else if (timeRange === "monthly") startTime = now.startOf("month").valueOf();
  else if (timeRange === "yearly") startTime = now.startOf("year").valueOf();

  const incidents = await db
    .select()
    .from(incidentsTable)
    .where(gte(incidentsTable.created_at, startTime));

  return incidents;
}

export async function getEventReportData(sessionId: number) {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found");
  
  const incidents = await getIncidents(sessionId);
  const personnel = await getPersonnel(sessionId);
  const vehicles = await getVehicles();
  const equipment = await getWaterRescueEquipment();
  const preparedness = await getPreparedness(sessionId);
  const floodedAreas = await getFloodedAreas(sessionId);
  const waterLevels = await getWaterLevels(sessionId);

  return {
    session,
    incidents,
    personnel,
    vehicles,
    equipment,
    preparedness,
    floodedAreas,
    waterLevels,
  };
}