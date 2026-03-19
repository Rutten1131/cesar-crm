import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { verifyBotAuth } from '@/lib/bot-auth';
import { eq, sql } from 'drizzle-orm';

/**
 * PATCH /api/bot/transactions/[id]/collection
 *
 * Actualiza los campos de cobranza después de que Donna envía recordatorio o confirma pago.
 * Body:
 * {
 *   intentosCobro: number (opcional),
 *   estadoCobro: string (PENDIENTE/EN_GESTION/PAGADO/INCOBRABLE),
 *   proximoRecordatorio: string (ISO Date) - nullable,
 *   notaAdicional: string (opcional),
 *   status: string (para cambiar status general de transaccion a PAID)
 * }
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const authError = verifyBotAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
        }

        const updates: any = {};
        if (body.intentosCobro !== undefined) updates.intentosCobro = body.intentosCobro;
        if (body.estadoCobro) updates.estadoCobro = body.estadoCobro;
        if (body.proximoRecordatorio !== undefined) updates.proximoRecordatorio = body.proximoRecordatorio ? new Date(body.proximoRecordatorio) : null;
        if (body.status) updates.status = body.status;

        let appendedLog = null;
        if (body.notaAdicional) {
            const timestamp = new Date().toLocaleString('es-EC');
            appendedLog = sql`COALESCE(${schema.transactions.logCobranza}, '') || '\n[' || ${timestamp} || '] ' || ${body.notaAdicional}`;
            updates.logCobranza = appendedLog;
        }

        const [updated] = await db
            .update(schema.transactions)
            .set({ 
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(schema.transactions.id, id))
            .returning();

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error('[BotAPI] Error updating collection status:', error);
        return NextResponse.json(
            { error: 'Error interno al actualizar cobranza' },
            { status: 500 }
        );
    }
}
