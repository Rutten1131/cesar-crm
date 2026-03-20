import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { WhatsAppAdapter } from '@/lib/messaging/adapters/WhatsAppAdapter';
import { getFollowupTemplate } from '@/lib/templates/followup-templates';
import { and, lte, inArray, or, isNull, eq } from 'drizzle-orm';
// Removed invalid Donna import

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const pending = await db.query.quotations.findMany({
            where: and(
                inArray(schema.quotations.estadoSeguimiento, ['PENDIENTE', 'ENVIADO', 'EN_SEGUIMIENTO']),
                or(
                    isNull(schema.quotations.proximoSeguimiento),
                    lte(schema.quotations.proximoSeguimiento, now)
                ),
                lte(schema.quotations.intentosRealizados, 4) // Max 5 attempts (0-4)
            )
        });

        let processed = 0;
        const resultsLog = [];

        for (const q of pending) {
            // Get customer info
            let phone = q.numeroWhatsapp;
            let cutomerName = 'Cliente';

            if (!phone) {
                if (q.leadId) {
                    const lead = await db.query.leads.findFirst({ where: (l, { eq }) => eq(l.id, q.leadId!) });
                    if (lead?.phone) phone = lead.phone;
                    cutomerName = lead?.contactName || lead?.businessName || cutomerName;
                } else if (q.contactId) {
                    const contact = await db.query.contacts.findFirst({ where: (c, { eq }) => eq(c.id, q.contactId!) });
                    if (contact?.phone) phone = contact.phone;
                    cutomerName = contact?.contactName || contact?.businessName || cutomerName;
                }
            }

            if (!phone) {
                resultsLog.push({ id: q.id, error: 'No phone number' });
                continue;
            }

            const attempt = (q.intentosRealizados || 0) + 1;
            const message = getFollowupTemplate(attempt, cutomerName, q.title);

            // Format message for César to review and forward
            const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || '593963410409';
            const supervisorMessage = `🤖 *[Donna: Sugerencia de Seguimiento]*\nPara: *${cutomerName}* (${phone || 'Sin número'})\n---\n${message}`;

            // Send via WhatsApp to César
            const adapter = new WhatsAppAdapter();
            const sendResult = await adapter.sendMessage(adminNumber, supervisorMessage);

            if (sendResult.success) {
                // Calculate next follow up date based on attempt
                let nextDate = new Date();
                let nextStatus = 'EN_SEGUIMIENTO';
                switch(attempt) {
                    case 1: nextDate.setHours(nextDate.getHours() + 24); break;
                    case 2: nextDate.setHours(nextDate.getHours() + 24); break; // +48h total
                    case 3: nextDate.setHours(nextDate.getHours() + 24); break; // +72h total 
                    case 4: nextDate.setDate(nextDate.getDate() + 4); break;    // +7d total
                    case 5: nextDate = null as any; nextStatus = 'CERRADO'; break;
                }

                await db.update(schema.quotations)
                    .set({
                        intentosRealizados: attempt,
                        estadoSeguimiento: attempt === 1 ? 'ENVIADO' : nextStatus,
                        proximoSeguimiento: nextDate,
                        fechaPrimerContacto: attempt === 1 ? new Date() : q.fechaPrimerContacto,
                        notasSeguimiento: (q.notasSeguimiento || '') + `\n[${new Date().toLocaleString('es-EC')}] Intento ${attempt} enviado.`,
                        numeroWhatsapp: phone,
                        updatedAt: new Date()
                    })
                    .where(eq(schema.quotations.id, q.id));

                processed++;
                resultsLog.push({ id: q.id, status: 'Sent', attempt });
            } else {
                resultsLog.push({ id: q.id, error: sendResult.error });
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            details: resultsLog
        });

    } catch (error: any) {
        console.error('❌ Followup Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
