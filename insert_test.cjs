const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    console.log('Connected to Supabase...');
    const now = new Date();
    const f1 = new Date(now.getTime() - 60000);
    const f2 = new Date('2026-03-21T18:20:00Z');
    const sql = "INSERT INTO quotations (title,status,estado_seguimiento,proximo_seguimiento,intentos_realizados,numero_whatsapp,notas_seguimiento,total_amount,created_by,created_at,updated_at) VALUES ($1,'sent','PENDIENTE',$2,0,'593963410409','[TEST] Recordatorio inmediato',250,'Donna-Test',NOW(),NOW()),($3,'sent','PENDIENTE',$4,0,'593963410409','[TEST] Recordatorio 1:20PM',500,'Donna-Test',NOW(),NOW()) RETURNING id,title,proximo_seguimiento";
    const r = await client.query(sql, ['TEST-1: Recordatorio AHORA', f1, 'TEST-2: Recordatorio 1:20 PM', f2]);
    console.log('Inserted:', JSON.stringify(r.rows, null, 2));
    await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
