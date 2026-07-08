import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { vehiclesTable } from './schema';

async function migrateV2() {
    const db = drizzle(process.env.DB_FILE_NAME!);

    console.log("Starting v2 migration...");

    try {
        // 1. Create vehicles table (replaces fixed-column resources table)
        console.log("Creating vehicles table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 0,
                total INTEGER NOT NULL DEFAULT 0
            )
        `);

        // 2. Seed default vehicles from old resources table if vehicles table is empty
        const existingVehicles = await db.select().from(vehiclesTable);
        if (existingVehicles.length === 0) {
            console.log("Seeding default vehicles from old resources data...");
            try {
                const oldResources = await db.run(sql`SELECT * FROM resources WHERE id = 1`);
                if (oldResources.rows && oldResources.rows.length > 0) {
                    const r = oldResources.rows[0] as Record<string, unknown>;
                    await db.insert(vehiclesTable).values([
                        { name: 'Ambulance', active: Number(r.ambulances_active) || 12, total: Number(r.ambulances_total) || 15 },
                        { name: 'Fire Truck', active: Number(r.fire_trucks_active) || 4, total: Number(r.fire_trucks_total) || 5 },
                        { name: 'Rescue Boat', active: Number(r.rescue_boats_active) || 8, total: Number(r.rescue_boats_total) || 8 },
                        { name: 'Rescue Truck', active: 0, total: 0 },
                    ]);
                } else {
                    await db.insert(vehiclesTable).values([
                        { name: 'Ambulance', active: 12, total: 15 },
                        { name: 'Fire Truck', active: 4, total: 5 },
                        { name: 'Rescue Boat', active: 8, total: 8 },
                        { name: 'Rescue Truck', active: 0, total: 0 },
                    ]);
                }
            } catch {
                // resources table may not exist
                console.log("Old resources table not found, seeding defaults...");
                await db.insert(vehiclesTable).values([
                    { name: 'Ambulance', active: 12, total: 15 },
                    { name: 'Fire Truck', active: 4, total: 5 },
                    { name: 'Rescue Boat', active: 8, total: 8 },
                    { name: 'Rescue Truck', active: 0, total: 0 },
                ]);
            }
        }

        // 3. Create water_rescue_equipment table
        console.log("Creating water_rescue_equipment table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS water_rescue_equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                deployed INTEGER NOT NULL DEFAULT 0
            )
        `);

        // Seed default equipment
        const eqCheck = await db.run(sql`SELECT COUNT(*) as cnt FROM water_rescue_equipment`);
        const eqCount = Number((eqCheck.rows[0] as Record<string, unknown>).cnt);
        if (eqCount === 0) {
            console.log("Seeding default water rescue equipment...");
            await db.run(sql`INSERT INTO water_rescue_equipment (name, quantity, deployed) VALUES ('Vest', 0, 0), ('Helmet', 0, 0), ('Floater', 0, 0), ('Rope', 0, 0), ('Flashlight', 0, 0)`);
        }

        // 4. Create personnel table
        console.log("Creating personnel table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS personnel (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER REFERENCES sessions(id),
                agency TEXT NOT NULL,
                deployed INTEGER NOT NULL DEFAULT 0,
                available INTEGER NOT NULL DEFAULT 0
            )
        `);

        // 5. Create preparedness table
        console.log("Creating preparedness table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS preparedness (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER REFERENCES sessions(id),
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        `);

        // 6. Create flooded_areas table
        console.log("Creating flooded_areas table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS flooded_areas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER REFERENCES sessions(id),
                barangay TEXT NOT NULL,
                area_description TEXT NOT NULL,
                severity TEXT NOT NULL DEFAULT 'Moderate',
                created_at INTEGER NOT NULL
            )
        `);

        // 7. Create water_levels table
        console.log("Creating water_levels table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS water_levels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER REFERENCES sessions(id),
                waterway_name TEXT NOT NULL,
                level_meters INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'Normal',
                updated_at INTEGER NOT NULL
            )
        `);

        console.log("V2 migration complete!");
    } catch (err) {
        console.error("V2 migration failed:", err);
    }
}

migrateV2();
