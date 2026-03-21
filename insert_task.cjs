const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    console.log('Connected to Supabase...');
    
    // Appointment scheduled for 14:40 Ecuador time = 19:40 UTC
    // Since 'withTimezone: true' is supported for 'scheduled_at', we can insert a full ISO string.
    const scheduledAt = '2026-03-21T19:40:00Z';
    
    const sql = `
        INSERT INTO donna_tasks (title, description, scheduled_at, status, reminded_morning, reminded_1h, reminded_10m) 
        VALUES ($1, $2, $3, 'pending', false, false, false) 
        RETURNING id, title, scheduled_at;
    `;
    
    const r = await client.query(sql, [
        '☎️ Reunión Demo con Cliente VIP (Prueba 14:40)',
        'Test del recordatorio de 1 HORA antes.',
        scheduledAt
    ]);
    
    console.log('Inserted Task:', JSON.stringify(r.rows, null, 2));
    await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
