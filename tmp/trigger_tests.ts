import postgres from 'postgres';
import fetch from 'node-fetch'; // Fallback if fetch is missing but it's built-in in recent Node.js versions
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { pgbouncer: true });
const SECRET = 'crm-donna-2025-ec8f9a3b-4d2e-4c91-b8a7-9f2e1d6c5b4a';

async function runTests() {
  try {
    console.log("🧹 Limpiando tareas de prueba anteriores...");
    await sql`DELETE FROM donna_tasks WHERE title LIKE '%Test Antigravity%'`;

    const now = Date.now();
    // 1. Task for Daily Briefing (scheduled in 3 hours)
    const timeLater = new Date(now + 3 * 60 * 60000).toISOString();
    // 2. Task for 1 Hour Reminder (scheduled in 55 mins)
    const time1h = new Date(now + 55 * 60000).toISOString();
    // 3. Task for 10 Min Reminder (scheduled in 12 mins)
    const time10m = new Date(now + 12 * 60000).toISOString();

    console.log("📝 Creando tareas de prueba...");
    await sql`
      INSERT INTO donna_tasks (title, description, scheduled_at, status)
      VALUES 
      ('Reunión Estratégica (Test Antigravity)', 'Prueba del Resumen Matutino (5 AM)', ${timeLater}, 'pending'),
      ('Llamada con Cliente VIP (Test Antigravity)', 'Prueba del Recordatorio de 1 Hora', ${time1h}, 'pending'),
      ('Revisar Cotizaciones (Test Antigravity)', 'Prueba del Recordatorio de 10 Minutos', ${time10m}, 'pending')
    `;

    console.log("✅ Tareas insertadas. Esperando 2 segundos...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("🚀 Disparando Resumen Matutino (5 AM)...");
    const res1 = await fetch(`https://cesar-crm.onrender.com/api/cron/daily-briefing?secret=${SECRET}`);
    const data1 = await res1.json();
    console.log("-> Resumen Matutino:", data1);

    console.log("🚀 Disparando Recordatorios Exactos (1h y 10m)...");
    const res2 = await fetch(`https://cesar-crm.onrender.com/api/cron/agenda-reminders?secret=${SECRET}`);
    const data2 = await res2.json();
    console.log("-> Recordatorios:", data2);

  } catch(e) {
    console.error("❌ Error running tests:", e);
  } finally {
    await sql.end();
  }
}

runTests();
