const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    console.log('--- Resumen de Datos ---');
    
    // Cotizaciones pendientes con/sin numero
    const resQuot = await client.query("SELECT count(*) as total, count(numero_whatsapp) as with_phone FROM quotations WHERE estado_seguimiento IN ('PENDIENTE', 'ENVIADO', 'EN_SEGUIMIENTO')");
    console.log('Cotizaciones Pendientes:', resQuot.rows[0]);
    
    // Tareas pendientes hoy
    const resTasks = await client.query("SELECT count(*) as total FROM donna_tasks WHERE status = 'pending' AND scheduled_at <= (NOW() + interval '2 hours')");
    console.log('Tareas próximas/vencidas (Próximas 2h):', resTasks.rows[0]);
    
    // Ultimos logs de recordatorios enviados
    const lastRem = await client.query("SELECT title, reminded_1h, reminded_10m, scheduled_at FROM donna_tasks WHERE status = 'pending' ORDER BY scheduled_at DESC LIMIT 10");
    console.log('Últimas Tareas:', JSON.stringify(lastRem.rows, null, 2));

    await client.end();
}
main().catch(console.error);
