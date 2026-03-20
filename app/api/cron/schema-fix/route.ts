import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('--- DATA MIGRATION START ---');
        
        // quotations
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS estado_seguimiento varchar(255) DEFAULT 'PENDIENTE'`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS proximo_seguimiento timestamp`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS intentos_realizados integer DEFAULT 0`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS fecha_primer_contacto timestamp`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS notas_seguimiento text`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS numero_whatsapp varchar(255)`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS url_documento text`);

        // transactions
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS estado_cobro varchar(255) DEFAULT 'PENDIENTE'`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS proximo_recordatorio timestamp`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intentos_cobro integer DEFAULT 0`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS numero_whatsapp varchar(255)`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS log_cobranza text`);

        console.log('--- DATA MIGRATION SUCCESS ---');

        // Verification query
        const quotesCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'quotations'`);
        const transCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'`);
        const leadsCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'leads'`);
        const contactsCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts'`);
        const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);

        return NextResponse.json({ 
            success: true, 
            message: 'Schema audited',
            tables: (tables as any).map((r: any) => r.table_name),
            verification: {
                quotations: (quotesCols as any).map((r: any) => r.column_name),
                transactions: (transCols as any).map((r: any) => r.column_name),
                leads: (leadsCols as any).map((r: any) => r.column_name),
                contacts: (contactsCols as any).map((r: any) => r.column_name)
            }
        });
    } catch (error: any) {
        console.error('❌ Migration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
