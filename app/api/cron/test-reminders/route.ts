import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/test-reminders
 * 
 * TEMPORARY: Inserts two test quotations with César's phone number
 * to verify the follow-up reminder system works end-to-end.
 * DELETE THIS FILE AFTER TESTING.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminPhone = '593963410409'; // César's phone

        // Test Quotation 1 — Follow-up at 12:30 PM Ecuador (UTC-5 = 17:30 UTC)
        const followup1 = new Date();
        followup1.setUTCHours(17, 30, 0, 0); // 12:30 PM Ecuador

        // Test Quotation 2 — Follow-up at 1:20 PM Ecuador (UTC-5 = 18:20 UTC)
        const followup2 = new Date();
        followup2.setUTCHours(18, 20, 0, 0); // 1:20 PM Ecuador

        const inserted = await db.insert(schema.quotations).values([
            {
                title: '🧪 TEST 1: Cotización Prueba — Recordatorio 12:30 PM',
                status: 'sent',
                estadoSeguimiento: 'PENDIENTE',
                proximoSeguimiento: followup1,
                intentosRealizados: 0,
                numeroWhatsapp: adminPhone,
                notasSeguimiento: '[TEST] Creada automáticamente para verificar el sistema de recordatorios.',
                totalAmount: 250.00,
                createdBy: 'Donna-Test',
            },
            {
                title: '🧪 TEST 2: Cotización Prueba — Recordatorio 1:20 PM',
                status: 'sent',
                estadoSeguimiento: 'PENDIENTE',
                proximoSeguimiento: followup2,
                intentosRealizados: 0,
                numeroWhatsapp: adminPhone,
                notasSeguimiento: '[TEST] Creada automáticamente para verificar el sistema de recordatorios.',
                totalAmount: 500.00,
                createdBy: 'Donna-Test',
            }
        ]).returning();

        return NextResponse.json({
            success: true,
            message: 'Test quotations inserted successfully',
            quotations: inserted.map(q => ({
                id: q.id,
                title: q.title,
                phone: q.numeroWhatsapp,
                nextFollowup: q.proximoSeguimiento,
            }))
        });

    } catch (error: any) {
        console.error('❌ Test Insert Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
