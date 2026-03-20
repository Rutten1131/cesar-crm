import postgres from 'postgres';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We should connect to the transaction port (6543) or direct port (5432).
// pgbouncer=true handles connection pooling.
const sql = postgres(process.env.DATABASE_URL!, { pgbouncer: true });

async function apply() {
  try {
    console.log("Reading SQL file...");
    const content = fs.readFileSync('drizzle/0003_init_donna_tasks.sql', 'utf8');
    
    // Postgres.js can execute multiple statements separated by semicolons if they are simple, OR we can split by '--> statement-breakpoint' 
    const statements = content.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements. Executing...`);
    
    for(const stmt of statements) {
      console.log('> ' + stmt.substring(0, 50) + '...');
      await sql.unsafe(stmt);
    }
    
    console.log("Migration applied successfully!");
    
  } catch(e) {
    console.error("Migration error:", e);
  } finally {
    await sql.end();
  }
}

apply();
