const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    
    // Almacenar el timestamp literal exacto que queremos, sin que la librería Node convierta basados en la zona horaria del VPS.
    // Drizzle en Render (UTC) inserta strings UTC (hora Ecuador + 5). 
    // Hora requerida: 13:40 ECU = 18:40 UTC
    // Hora requerida: 14:10 ECU = 19:10 UTC

    const sql = `
        INSERT INTO quotations (title, status, estado_seguimiento, proximo_seguimiento, intentos_realizados, numero_whatsapp, notas_seguimiento, total_amount, created_by, created_at, updated_at) 
        VALUES 
        ('TEST-6: Reparación Bug Timezone (Prueba 13:40)', 'sent', 'PENDIENTE', '2026-03-21 18:40:00', 0, '593963410409', '[TEST] Hora Fija 13:40', 800, 'Donna-Test', NOW(), NOW()),
        ('TEST-7: Reparación Bug Timezone (Prueba 14:10)', 'sent', 'PENDIENTE', '2026-03-21 19:10:00', 0, '593963410409', '[TEST] Hora Fija 14:10', 900, 'Donna-Test', NOW(), NOW())
        RETURNING id, title, proximo_seguimiento;
    `;
    
    const r = await client.query(sql);
    console.log('Inserted:', JSON.stringify(r.rows, null, 2));
    await client.end();
}
main().catch(e => { console.error(e); process.exit(1); });
