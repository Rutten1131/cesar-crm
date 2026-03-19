import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { whatsappService } from '@/lib/whatsapp/WhatsAppService';
import { getCollectionTemplate } from '@/lib/templates/collection-templates';
import { and, lte, inArray, or, isNull, eq, notInArray } from 'drizzle-orm';
import { telegramService } from '@/lib/telegram/TelegramService';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const pending = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.type, 'INCOME'),
                inArray(schema.transactions.status, ['PENDING', 'OVERDUE']),
                lte(schema.transactions.dueDate, now),
                notInArray(schema.transactions.estadoCobro, ['PAGADO', 'INCOBRABLE']),
                or(
                    isNull(schema.transactions.proximoRecordatorio),
                    lte(schema.transactions.proximoRecordatorio, now)
                )
            )
        });

        let processed = 0;
        const resultsLog = [];
        const THRESHOLD_DAY_21 = 21;

        for (const t of pending) {
            // Get customer info
            let phone = t.numeroWhatsapp;
            let cutomerName = 'Cliente';

            if (!phone) {
                if (t.clientId) {
                    const client = await db.query.clients.findFirst({ where: (l, { eq }) => eq(l.id, t.clientId!) });
                    if (client?.phone) phone = client.phone;
                    cutomerName = client?.contactName || client?.businessName || cutomerName;
                } else if (t.leadId) {
                    const lead = await db.query.leads.findFirst({ where: (l, { eq }) => eq(l.id, t.leadId!) });
                    if (lead?.phone) phone = lead.phone;
                    cutomerName = lead?.contactName || lead?.businessName || cutomerName;
                }
            }

            if (!phone || !t.dueDate) {
                resultsLog.push({ id: t.id, error: 'Missing phone or dueDate' });
                continue;
            }

            const dueDate = new Date(t.dueDate);
            const diffTime = now.getTime() - dueDate.getTime();
            const diasVencida = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Alert Cheche day 21
            if (diasVencida >= THRESHOLD_DAY_21) {
                const primaryUserId = process.env.TELEGRAM_CHAT_ID;
                if (primaryUserId && (t.intentosCobro || 0) < 5) { // Ensure we alert only once (attempt 5)
                     try {
                         await telegramService.sendMessage(
                             `🚨 *ALERTA DE COBRANZA*\n\nEl cliente *${cutomerName}* tiene *${diasVencida} días* de retraso con el pago de *$${t.amount.toFixed(2)}* por *${t.description}*.\n\nDonna ya ha enviado todos los recordatorios automáticos. Requiere intervención personal.`,
                             'Markdown'
                         );
                         await db.update(schema.transactions)
                             .set({ intentosCobro: 5, logCobranza: (t.logCobranza || '') + `\n[${new Date().toLocaleString('es-EC')}] Alerta generada a Cheche.` })
                             .where(eq(schema.transactions.id, t.id));
                         resultsLog.push({ id: t.id, status: 'Alert Sent' });
                     } catch(err) {}
                }
                continue;
            }

            // Determine attempt logic
            let attempt = (t.intentosCobro || 0) + 1;
            
            // Map attempt to strict requirements of delays
            // attempt 1: day 1
            // attempt 2: day 3
            // attempt 3: day 7
            // attempt 4: day 14
            let expectedDaysDelay = [1, 3, 7, 14, 21][attempt - 1] || 999;
            
            // Just send next sequential message if we passed the required wait
            const message = getCollectionTemplate(attempt, cutomerName, t.description, t.amount);

            // Send via WhatsApp
            const sendResult = await whatsappService.sendMessage(phone, message);

            if (sendResult.success) {
                let nextDelayDays = [3-1, 7-3, 14-7, 21-14][attempt - 1] || 7;
                let nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + nextDelayDays);

                await db.update(schema.transactions)
                    .set({
                        intentosCobro: attempt,
                        estadoCobro: 'EN_GESTION',
                        proximoRecordatorio: nextDate,
                        logCobranza: (t.logCobranza || '') + `\n[${new Date().toLocaleString('es-EC')}] Recordatorio ${attempt} enviado.`,
                        numeroWhatsapp: phone,
                        updatedAt: new Date()
                    })
                    .where(eq(schema.transactions.id, t.id));

                processed++;
                resultsLog.push({ id: t.id, status: 'Sent', attempt });
            } else {
                resultsLog.push({ id: t.id, error: sendResult.error });
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            details: resultsLog
        });

    } catch (error: any) {
        console.error('❌ Collection Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
