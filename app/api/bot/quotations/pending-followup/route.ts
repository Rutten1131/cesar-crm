import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { verifyBotAuth } from '@/lib/bot-auth';
import { and, lte, inArray, or, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bot/quotations/pending-followup
 *
 * Devuelve las cotizaciones que necesitan seguimiento:
 * 1. estadoSeguimiento en ['PENDIENTE', 'ENVIADO', 'EN_SEGUIMIENTO']
 * 2. proximoSeguimiento <= HOY (o es nulo para el primer intento)
 * 3. intentosRealizados < 5
 */
export async function GET(request: Request) {
    const authError = verifyBotAuth(request);
    if (authError) return authError;

    try {
        const now = new Date();

        const pendingQuotations = await db.query.quotations.findMany({
            where: and(
                inArray(schema.quotations.estadoSeguimiento, ['PENDIENTE', 'ENVIADO', 'EN_SEGUIMIENTO']),
                or(
                    isNull(schema.quotations.proximoSeguimiento),
                    lte(schema.quotations.proximoSeguimiento, now)
                ),
                // Only follow up to 5 times
                lte(schema.quotations.intentosRealizados, 4)
            ),
            with: {
                // Not strictly defined in schema relationships but typically you'd want contact/lead info
            }
        });

        // Manual join to get lead/contact info since `with` requires defined relations in Drizzle
        const results = await Promise.all(pendingQuotations.map(async (q) => {
            let contactInfo = null;
            if (q.leadId) {
                contactInfo = await db.query.leads.findFirst({
                    where: (leads, { eq }) => eq(leads.id, q.leadId)
                });
            } else if (q.contactId) {
                contactInfo = await db.query.contacts.findFirst({
                    where: (contacts, { eq }) => eq(contacts.id, q.contactId)
                });
            }

            return {
                ...q,
                customerName: contactInfo?.contactName || contactInfo?.businessName || 'Cliente',
                phone: q.numeroWhatsapp || contactInfo?.phone || null
            };
        }));

        const validResults = results.filter(r => r.phone);

        return NextResponse.json({
            success: true,
            count: validResults.length,
            data: validResults
        });

    } catch (error) {
        console.error('[BotAPI] Error getting pending followups:', error);
        return NextResponse.json(
            { error: 'Error interno al consultar cotizaciones pendientes' },
            { status: 500 }
        );
    }
}
