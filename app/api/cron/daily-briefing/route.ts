import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { WhatsAppAdapter } from '@/lib/messaging/adapters/WhatsAppAdapter';
import { and, eq, gte, lt, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds Vercel

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        // Simple security check
        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Determine today's bounds (local timezone context assumed)
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch tasks for today that haven't been summarized in the morning
        const todaysTasks = await db.query.donnaTasks.findMany({
            where: and(
                eq(schema.donnaTasks.status, 'pending'),
                eq(schema.donnaTasks.remindedMorning, false),
                gte(schema.donnaTasks.scheduledAt, startOfDay),
                lt(schema.donnaTasks.scheduledAt, endOfDay)
            ),
            orderBy: [asc(schema.donnaTasks.scheduledAt)]
        });

        if (todaysTasks.length === 0) {
            return NextResponse.json({ success: true, message: 'No tasks for today. No briefing sent.' });
        }

        // Build the briefing text
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoyStr = `${dias[now.getDay()]} ${now.getDate()}`;
        
        let messageBody = `*🌅 Buenos días César*\nEste es tu resumen de actividades y agenda para hoy (${hoyStr}):\n\n`;
        
        for (const [index, task] of todaysTasks.entries()) {
            // Format time correctly in a typical LA timezone or UTC-5
            // NextJS runtime might be UTC, so let's adjust or use UTC string formatting manually
            // As a simple approach we assume the DB has correct times, we convert to local string
            const timeStr = task.scheduledAt.toLocaleTimeString('es-ES', { 
                timeZone: 'America/Guayaquil', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageBody += `*${index + 1}. ${timeStr}* - ${task.title}\n`;
            if (task.description) {
                messageBody += `   _${task.description}_\n`;
            }
            messageBody += `\n`;
        }

        messageBody += `¡Que tengas un excelente día de ventas! 🚀`;

        // Send via WhatsApp
        const targetNumber = process.env.WHATSAPP_ADMIN_NUMBER || '593963410409'; // Cesar's real number from .env.local fallback
        
        const adapter = new WhatsAppAdapter();
        const sendResult = await adapter.sendMessage(targetNumber, messageBody);

        if (sendResult.success) {
            // Mark tasks as remindedMorning = true
            const taskIds = todaysTasks.map(t => t.id);
            for (const id of taskIds) {
                await db.update(schema.donnaTasks)
                    .set({ remindedMorning: true, updatedAt: new Date() })
                    .where(eq(schema.donnaTasks.id, id));
            }
            
            return NextResponse.json({ success: true, count: todaysTasks.length, message: 'Daily briefing sent successfully' });
        } else {
            return NextResponse.json({ success: false, error: sendResult.error }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[CRON Daily Briefing Error]:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
