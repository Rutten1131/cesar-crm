const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    
    // Tareas generales (tabla tasks)
    console.log('--- Tabla tasks (Recordatorios Hoy) ---');
    const resTasks = await client.query("SELECT id, title, reminder_at, reminder_sent, status FROM tasks WHERE reminder_at > (NOW() - interval '24 hours') AND reminder_at < (NOW() + interval '24 hours')");
    console.log(JSON.stringify(resTasks.rows, null, 2));

    // Tareas Donna (tabla donna_tasks)
    console.log('--- Tabla donna_tasks (Total Historial) ---');
    const resDonna = await client.query("SELECT count(*) FROM donna_tasks");
    console.log(resDonna.rows[0]);

    await client.end();
}
main().catch(console.error);
