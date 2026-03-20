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

        console.log('--- FULL SCHEMA SYNC START ---');

        // 0. Ensure pgcrypto
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        // 1. Add ALL missing columns to leads table (matches Drizzle schema exactly)
        const leadsColumns = [
            // Basic
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS connection_type text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_activity text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS interested_product text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS verbal_agreements text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS personality_type text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS communication_style text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS key_phrases text`,
            // FODA
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS strengths text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS weaknesses text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS opportunities text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS threats text`,
            // Advanced Business Data
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS relationship_type text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS quantified_problem text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS conservative_goal text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS years_in_business integer`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS number_of_employees integer`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS number_of_branches integer`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS current_clients_per_month integer`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS average_ticket integer`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS known_competition text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS high_season text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS critical_dates text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_followers integer`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS other_achievements text`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS specific_recognitions text`,
            // Files & Transcriptions
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS files text DEFAULT '[]'`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS audio_transcriptions text DEFAULT '[]'`,
            // Quotation
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS quotation text`,
            // Outreach
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS outreach_status text DEFAULT 'new'`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_status text DEFAULT 'pending'`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_sequence_step integer DEFAULT 0`,
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_newsletter_subscriber boolean DEFAULT false`,
            // Discovery link
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS discovery_lead_id uuid`,
        ];

        for (const stmt of leadsColumns) {
            await db.execute(sql.raw(stmt));
        }
        console.log('✅ leads table synced');

        // 2. Add ALL missing columns to clients table
        const clientsColumns = [
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS lead_id uuid`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_type text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_activity text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS interested_product text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS verbal_agreements text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS personality_type text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS communication_style text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS key_phrases text`,
            // Strategic
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS pains text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS goals text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS objections text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS strengths text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS weaknesses text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS opportunities text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS threats text`,
            // Advanced
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS relationship_type text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS quantified_problem text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS conservative_goal text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS years_in_business integer`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS number_of_employees integer`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS number_of_branches integer`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS current_clients_per_month integer`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS average_ticket integer`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS known_competition text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS high_season text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS critical_dates text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS facebook_followers integer`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS other_achievements text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS specific_recognitions text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS quotation text`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS discovery_lead_id uuid`,
            `ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes text`,
        ];

        for (const stmt of clientsColumns) {
            await db.execute(sql.raw(stmt));
        }
        console.log('✅ clients table synced');

        // 3. Ensure quotations columns
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS lead_id uuid`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS contact_id uuid`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS estado_seguimiento varchar(255) DEFAULT 'PENDIENTE'`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS proximo_seguimiento timestamp`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS intentos_realizados integer DEFAULT 0`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS fecha_primer_contacto timestamp`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS notas_seguimiento text`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS numero_whatsapp varchar(255)`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS url_documento text`);

        // 4. Ensure transactions columns
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS client_id uuid`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS lead_id uuid`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS estado_cobro varchar(255) DEFAULT 'PENDIENTE'`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS proximo_recordatorio timestamp`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intentos_cobro integer DEFAULT 0`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS numero_whatsapp varchar(255)`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS log_cobranza text`);

        console.log('--- FULL SCHEMA SYNC COMPLETE ---');

        // Verify
        const leadsCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'leads' ORDER BY ordinal_position`);
        const clientsCols = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position`);

        return NextResponse.json({
            success: true,
            message: 'Full schema synced',
            leads_columns: (leadsCols as any).map((r: any) => r.column_name),
            clients_columns: (clientsCols as any).map((r: any) => r.column_name),
            leads_count: (leadsCols as any).length,
            clients_count: (clientsCols as any).length,
        });
    } catch (error: any) {
        console.error('❌ Migration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
