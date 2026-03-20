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

        // 0. Ensure extension exists
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        // 1. Ensure core tables exist
        await db.execute(sql`CREATE TABLE IF NOT EXISTS leads (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            business_name text NOT NULL,
            contact_name text NOT NULL,
            phone text,
            email text,
            city text,
            address text,
            business_type text,
            status text DEFAULT 'sin_contacto',
            phase integer DEFAULT 1,
            notes text,
            source text DEFAULT 'recorridos',
            created_at timestamp DEFAULT now() NOT NULL,
            updated_at timestamp DEFAULT now() NOT NULL
        )`);

        await db.execute(sql`CREATE TABLE IF NOT EXISTS clients (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            business_name text NOT NULL,
            contact_name text NOT NULL,
            phone text,
            email text,
            city text,
            address text,
            contract_value double precision,
            contract_start_date timestamp,
            status text DEFAULT 'active',
            created_at timestamp DEFAULT now() NOT NULL,
            updated_at timestamp DEFAULT now() NOT NULL
        )`);

        // 2. Ensure quotations and transactions are up to date
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES leads(id)`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES contacts(id)`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS estado_seguimiento varchar(255) DEFAULT 'PENDIENTE'`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS proximo_seguimiento timestamp`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS intentos_realizados integer DEFAULT 0`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS fecha_primer_contacto timestamp`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS notas_seguimiento text`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS numero_whatsapp varchar(255)`);
        await db.execute(sql`ALTER TABLE quotations ADD COLUMN IF NOT EXISTS url_documento text`);

        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id)`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES leads(id)`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS estado_cobro varchar(255) DEFAULT 'PENDIENTE'`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS proximo_recordatorio timestamp`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS intentos_cobro integer DEFAULT 0`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS numero_whatsapp varchar(255)`);
        await db.execute(sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS log_cobranza text`);

        // Final verification query
        const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Core schema synced',
            tables: (tables as any).map((r: any) => r.table_name)
        });
    } catch (error: any) {
        console.error('❌ Migration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
