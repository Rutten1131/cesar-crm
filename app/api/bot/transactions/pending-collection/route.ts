import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { verifyBotAuth } from '@/lib/bot-auth';
import { and, lte, inArray, eq, or, notInArray, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bot/transactions/pending-collection
 *
 * Devuelve transacciones que necesitan cobranza:
 * 1. type = 'INCOME'
 * 2. status in ['PENDING', 'OVERDUE']
 * 3. dueDate <= HOY
 * 4. estadoCobro not in ['PAGADO', 'INCOBRABLE']
 * 5. proximoRecordatorio <= HOY (o es nulo)
 */
export async function GET(request: Request) {
    const authError = verifyBotAuth(request);
    if (authError) return authError;

    try {
        const now = new Date();

        const pendingCollections = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.type, 'INCOME'),
                inArray(schema.transactions.status, ['PENDING', 'OVERDUE']),
                lte(schema.transactions.dueDate, now),
                notInArray(schema.transactions.estadoCobro, ['PAGADO', 'INCOBRABLE']),
                or(
                    isNull(schema.transactions.proximoRecordatorio),
                    lte(schema.transactions.proximoRecordatorio, now)
                )
            ),
            with: {
                client: true, // Assuming client relation is set up, else we fetch manually like quotations
            }
        });

        // Manual join to get client info since `with` requires defined relations in Drizzle schema.ts (which weren't explicitly set with `relations`)
        const results = await Promise.all(pendingCollections.map(async (t) => {
            let contactInfo = null;
            if (t.clientId) {
                contactInfo = await db.query.clients.findFirst({
                    where: (clients, { eq }) => eq(clients.id, t.clientId!)
                });
            } else if (t.leadId) {
                contactInfo = await db.query.leads.findFirst({
                    where: (leads, { eq }) => eq(leads.id, t.leadId!)
                });
            }

            // Calculate days overdue
            const dueDate = new Date(t.dueDate!);
            const diffTime = Math.abs(now.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                ...t,
                customerName: contactInfo?.contactName || contactInfo?.businessName || 'Cliente',
                phone: t.numeroWhatsapp || contactInfo?.phone || null,
                diasVencida: diffDays
            };
        }));

        const validResults = results.filter(r => r.phone);

        return NextResponse.json({
            success: true,
            count: validResults.length,
            data: validResults
        });

    } catch (error) {
        console.error('[BotAPI] Error getting pending collections:', error);
        return NextResponse.json(
            { error: 'Error interno al consultar cobranzas pendientes' },
            { status: 500 }
        );
    }
}
