const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    
    // Tareas hoy
    console.log('--- Tareas de hoy ---');
    const resToday = await client.query("SELECT id, title, scheduled_at, reminded_1h, reminded_10m, status FROM donna_tasks WHERE scheduled_at > (NOW() - interval '24 hours') AND scheduled_at < (NOW() + interval '24 hours') ORDER BY scheduled_at ASC");
    console.log(JSON.stringify(resToday.rows, null, 2));

    await client.end();
}
main().catch(console.error);
