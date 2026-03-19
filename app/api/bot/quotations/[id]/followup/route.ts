import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { verifyBotAuth } from '@/lib/bot-auth';
import { eq, sql } from 'drizzle-orm';

/**
 * PATCH /api/bot/quotations/[id]/followup
 *
 * Actualiza los campos de seguimiento después de que Donna envía un mensaje.
 * Body:
 * {
 *   intentosRealizados: number,
 *   estadoSeguimiento: string,
 *   proximoSeguimiento: string (ISO Date) - nullable,
 *   notaAdicional: string (opcional)
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
        if (body.intentosRealizados !== undefined) updates.intentosRealizados = body.intentosRealizados;
        if (body.estadoSeguimiento) updates.estadoSeguimiento = body.estadoSeguimiento;
        if (body.proximoSeguimiento !== undefined) updates.proximoSeguimiento = body.proximoSeguimiento ? new Date(body.proximoSeguimiento) : null;
        
        if (body.fechaPrimerContacto) updates.fechaPrimerContacto = new Date(body.fechaPrimerContacto);

        let appendedNote = null;
        if (body.notaAdicional) {
            const timestamp = new Date().toLocaleString('es-EC');
            appendedNote = sql`COALESCE(${schema.quotations.notasSeguimiento}, '') || '\n[' || ${timestamp} || '] ' || ${body.notaAdicional}`;
            updates.notasSeguimiento = appendedNote;
        }

        const [updated] = await db
            .update(schema.quotations)
            .set({ 
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(schema.quotations.id, id))
            .returning();

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error('[BotAPI] Error updating quotation warmup:', error);
        return NextResponse.json(
            { error: 'Error interno al actualizar seguimiento' },
            { status: 500 }
        );
    }
}
