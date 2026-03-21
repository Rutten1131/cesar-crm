// insert_test.js — Run with: node insert_test.js
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function main() {
    await client.connect();
    console.log('Connected to Supabase...');

    const now = new Date();
    
    // Test 1: Follow-up NOW (will be picked up on next cron cycle in ~5 min)
    const followup1 = new Date(now.getTime() - 60000); // 1 minute ago = ready NOW
    
    // Test 2: Follow-up at 1:20 PM Ecuador = 18:20 UTC
    const followup2 = new Date('2026-03-21T18:20:00Z');

    const sql = `
        INSERT INTO quotations (title, status, estado_seguimiento, proximo_seguimiento, intentos_realizados, numero_whatsapp, notas_seguimiento, total_amount, created_by, created_at, updated_at) 
        VALUES 
        ($1, 'sent', 'PENDIENTE', $2, 0, '593963410409', '[TEST] Recordatorio inmediato', 250.00, 'Donna-Test', NOW(), NOW()),
        ($3, 'sent', 'PENDIENTE', $4, 0, '593963410409', '[TEST] Recordatorio 1:20 PM', 500.00, 'Donna-Test', NOW(), NOW())
        RETURNING id, title, proximo_seguimiento;
    `;

    const result = await client.query(sql, [
        'TEST-1: Cotizacion Prueba — Recordatorio AHORA',
        followup1,
        'TEST-2: Cotizacion Prueba — Recordatorio 1:20 PM',
        followup2
    ]);

    console.log('Inserted test quotations:');
    result.rows.forEach(row => {
        console.log('  - ' + row.title + ' -> Follow-up at: ' + row.proximo_seguimiento);
    });

    await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
