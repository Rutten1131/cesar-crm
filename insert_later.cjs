const pg = require('pg');
const client = new pg.Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    console.log('Connected to Supabase...');
    
    // 13:30 PM Ecuador = 18:30 UTC
    const followup1 = new Date('2026-03-21T18:30:00Z');
    
    // 14:20 PM Ecuador = 19:20 UTC
    const followup2 = new Date('2026-03-21T19:20:00Z');
    
    const sql = "INSERT INTO quotations (title,status,estado_seguimiento,proximo_seguimiento,intentos_realizados,numero_whatsapp,notas_seguimiento,total_amount,created_by,created_at,updated_at) VALUES ($1,'sent','PENDIENTE',$2,0,'593963410409','[TEST] Tarea 13:30',400,'Donna-Test',NOW(),NOW()),($3,'sent','PENDIENTE',$4,0,'593963410409','[TEST] Tarea 14:20',600,'Donna-Test',NOW(),NOW()) RETURNING id,title,proximo_seguimiento";
    
    const r = await client.query(sql, [
        'TEST-4: Diseño de Catálogo (Prueba 13:30)', followup1,
        'TEST-5: Consultoría SEO (Prueba 14:20)', followup2
    ]);
    
    console.log('Inserted:', JSON.stringify(r.rows, null, 2));
    await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
