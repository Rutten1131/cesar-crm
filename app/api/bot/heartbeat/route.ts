import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donnaTasks, quotations } from '@/lib/db/schema';
import { and, eq, gte, lte, sql, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get Today's range in UTC
        // Since we are in Ecuador (UTC-5), "Today" is from 05:00 UTC today to 05:00 UTC tomorrow (approx)
        // But let's just use the current day's midnight to 23:59:59 in local time converted to UTC.
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // 2. Query Donna Tasks for Today
        const todayTasks = await db
            .select()
            .from(donnaTasks)
            .where(
                and(
                    eq(donnaTasks.status, 'pending'),
                    gte(donnaTasks.scheduledAt, startOfDay),
                    lte(donnaTasks.scheduledAt, endOfDay)
                )
            );

        // 3. Query Quotations pending follow-up for Today
        const pendingQuotations = await db
            .select()
            .from(quotations)
            .where(
                and(
                    or(
                        eq(quotations.estadoSeguimiento, 'PENDIENTE'),
                        eq(quotations.estadoSeguimiento, 'EN_SEGUIMIENTO')
                    ),
                    gte(quotations.proximoSeguimiento, startOfDay),
                    lte(quotations.proximoSeguimiento, endOfDay)
                )
            );

        // 4. Build Summary
        let summary = "📋 *Resumen de Tareas para Hoy:*\n\n";

        if (todayTasks.length === 0 && pendingQuotations.length === 0) {
            summary = "✅ No tienes tareas ni seguimientos programados para hoy. ¡Día despejado! 💪";
        } else {
            if (todayTasks.length > 0) {
                summary += `🔔 *Eventos y Tareas (${todayTasks.length}):*\n`;
                todayTasks.forEach(t => {
                    const time = new Date(t.scheduledAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: true });
                    summary += `• ${time} — ${t.title}\n`;
                });
                summary += "\n";
            }

            if (pendingQuotations.length > 0) {
                summary += `📧 *Seguimientos Pendientes (${pendingQuotations.length}):*\n`;
                pendingQuotations.forEach(q => {
                    summary += `• ${q.title} (${q.numeroWhatsapp || 'Sin número'})\n`;
                });
            }
        }

        return NextResponse.json({
            success: true,
            count: todayTasks.length + pendingQuotations.length,
            summary
        });

    } catch (error: any) {
        console.error('[API Heartbeat Error]:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
