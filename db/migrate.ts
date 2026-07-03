import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { sessionsTable, incidentsTable } from './schema';

async function migrate() {
    const db = drizzle(process.env.DB_FILE_NAME!);
    
    console.log("Starting migration...");
    
    try {
        // 1. Create sessions table
        console.log("Creating sessions table...");
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'daily',
                status TEXT NOT NULL DEFAULT 'active',
                started_at INTEGER NOT NULL,
                closed_at INTEGER
            )
        `);
        
        // 2. Add columns to incidents table
        console.log("Adding columns to incidents table...");
        try { await db.run(sql`ALTER TABLE incidents ADD COLUMN session_id INTEGER REFERENCES sessions(id)`); } catch(e) { console.log("session_id might already exist"); }
        try { await db.run(sql`ALTER TABLE incidents ADD COLUMN call_taker TEXT NOT NULL DEFAULT 'Unknown'`); } catch(e) { console.log("call_taker might already exist"); }
        try { await db.run(sql`ALTER TABLE incidents ADD COLUMN responder TEXT NOT NULL DEFAULT 'Unknown'`); } catch(e) { console.log("responder might already exist"); }
        
        // 3. Create Legacy Session if it doesn't exist
        const legacyCheck = await db.select().from(sessionsTable).where(sql`name = 'Legacy Data'`).limit(1);
        let legacyId: number;
        
        if (legacyCheck.length === 0) {
            console.log("Creating legacy session...");
            const res = await db.insert(sessionsTable).values({
                name: "Legacy Data",
                type: "daily",
                status: "closed",
                started_at: 0,
                closed_at: Date.now()
            }).returning({ id: sessionsTable.id });
            legacyId = res[0].id;
        } else {
            legacyId = legacyCheck[0].id;
        }
        
        // 4. Update existing incidents without session_id to Legacy Data
        console.log("Migrating legacy incidents...");
        await db.run(sql`UPDATE incidents SET session_id = ${legacyId} WHERE session_id IS NULL`);
        
        console.log("Migration complete!");
    } catch(err) {
        console.error("Migration failed:", err);
    }
}

migrate();
