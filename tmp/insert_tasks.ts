import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { pgbouncer: true });

async function insertTestTasks() {
  try {
    const time1h = new Date(Date.now() + 61 * 60000).toISOString();
    const time10m = new Date(Date.now() + 11 * 60000).toISOString();

    console.log("Inserting 1h task for:", time1h);
    await sql`
      INSERT INTO donna_tasks (title, description, scheduled_at, status)
      VALUES ('Recordatorio 1 hora Test Antigravity', 'Prueba automatica de 1 hora', ${time1h}, 'pending')
    `;

    console.log("Inserting 10m task for:", time10m);
    await sql`
      INSERT INTO donna_tasks (title, description, scheduled_at, status)
      VALUES ('Recordatorio 10 minutos Test Antigravity', 'Prueba automatica de 10 minutos', ${time10m}, 'pending')
    `;

    console.log("Tasks inserted.");
  } catch(e) {
    console.error("Error inserting tasks", e);
  } finally {
    await sql.end();
  }
}

insertTestTasks();
