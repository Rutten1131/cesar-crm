const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    
    console.log('=== 1. REMINDERS TABLE (pending today) ===');
    const r1 = await client.query("SELECT id, title, send_at, status, channel FROM reminders WHERE status = 'pending' ORDER BY send_at ASC LIMIT 10");
    console.log(JSON.stringify(r1.rows, null, 2));
    
    console.log('\n=== 2. DONNA_TASKS TABLE (pending) ===');
    const r2 = await client.query("SELECT id, title, scheduled_at, reminded_1h, reminded_10m, status FROM donna_tasks WHERE status = 'pending' ORDER BY scheduled_at ASC LIMIT 10");
    console.log(JSON.stringify(r2.rows, null, 2));
    
    console.log('\n=== 3. QUOTATIONS pending follow-up ===');
    const r3 = await client.query("SELECT id, title, numero_whatsapp, proximo_seguimiento, estado_seguimiento, intentos_realizados FROM quotations WHERE estado_seguimiento IN ('PENDIENTE', 'ENVIADO', 'EN_SEGUIMIENTO') ORDER BY proximo_seguimiento ASC LIMIT 10");
    console.log(JSON.stringify(r3.rows, null, 2));
    
    console.log('\n=== 4. CURRENT SERVER TIME ===');
    const r4 = await client.query("SELECT NOW() as server_time");
    console.log(r4.rows[0]);
    
    await client.end();
}
main().catch(console.error);
