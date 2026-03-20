
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const sql = postgres(process.env.DATABASE_URL!);

  try {
    const now = new Date();
    // Use ISO strings for Postgres comparison if needed, or rely on drivers
    const tasks = await sql`
      SELECT * FROM donna_tasks 
      WHERE scheduled_at >= CURRENT_DATE 
      AND scheduled_at < CURRENT_DATE + INTERVAL '1 day'
    `;

    console.log('--- AGENDA DE HOY (DB) ---');
    console.log('Encontradas:', tasks.length);
    tasks.forEach(t => {
      console.log(`- [${t.scheduled_at}] ${t.title}`);
      console.log(`  Banderas: Morning:${t.reminded_morning}, 1h:${t.reminded_1h}, 10m:${t.reminded_10m}, Status:${t.status}`);
    });
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await sql.end();
  }
}

check();
