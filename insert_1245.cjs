const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    console.log('Connected to Supabase...');
    // 12:45 PM Ecuador = 17:45 UTC
    const followup = new Date('2026-03-21T17:45:00Z');
    const sql = "INSERT INTO quotations (title,status,estado_seguimiento,proximo_seguimiento,intentos_realizados,numero_whatsapp,notas_seguimiento,total_amount,created_by,created_at,updated_at) VALUES ($1,'sent','PENDIENTE',$2,0,'593963410409','[TEST] Recordatorio programado 12:45 PM Ecuador',350,'Donna-Test',NOW(),NOW()) RETURNING id,title,proximo_seguimiento";
    const r = await client.query(sql, ['TEST-3: Recordatorio 12:45 PM - Prueba de 10 min', followup]);
    console.log('Inserted:', JSON.stringify(r.rows, null, 2));
    await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
