const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    // Recordatorios (cualquier estado, hoy)
    console.log('--- Recordatorios (Reminders Table) ---');
    const res = await client.query("SELECT id, title, send_at, status, channel FROM reminders WHERE send_at > (NOW() - interval '24 hours') AND send_at < (NOW() + interval '24 hours') ORDER BY send_at ASC");
    console.log(JSON.stringify(res.rows, null, 2));

    await client.end();
}
main().catch(console.error);
