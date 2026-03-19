import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { whatsappService } from '@/lib/whatsapp/WhatsAppService';
import { and, eq, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const targetNumber = process.env.WHATSAPP_ADMIN_NUMBER || '593984368560';
        let sentCount = 0;

        // ==========================================
        // 1. Check for 1-HOUR Reminders
        // ==========================================
        // Tasks scheduled within the next 65 minutes but after now, that haven't had the 1h reminder
        const oneHourAhead = new Date(now.getTime() + 65 * 60000); // Look ahead up to 65 mins to catch them
        const oneHourTasks = await db.query.donnaTasks.findMany({
            where: and(
                eq(schema.donnaTasks.status, 'pending'),
                eq(schema.donnaTasks.reminded1h, false),
                gte(schema.donnaTasks.scheduledAt, now),
                lte(schema.donnaTasks.scheduledAt, oneHourAhead)
            )
        });

        for (const task of oneHourTasks) {
            // Calculate exact minutes left just to be safe in the text
            const diffMs = task.scheduledAt.getTime() - now.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            const messageBody = `⏳ *Recordatorio (Falta 1 hora)*\nCésar, tienes el siguiente evento agendado para las ${task.scheduledAt.toLocaleTimeString('es-ES', { timeZone: 'America/Guayaquil', hour: '2-digit', minute: '2-digit' })}:\n\n*${task.title}*\n${task.description ? '_' + task.description + '_' : ''}`;
            
            const sendResult = await whatsappService.sendMessage(targetNumber, messageBody);
            
            if (sendResult.success) {
                await db.update(schema.donnaTasks)
                    .set({ reminded1h: true, updatedAt: new Date() })
                    .where(eq(schema.donnaTasks.id, task.id));
                sentCount++;
            }
        }

        // ==========================================
        // 2. Check for 10-MINUTE Reminders
        // ==========================================
        // Tasks scheduled within the next 15 minutes but after now, that haven't had the 10m reminder
        const tenMinsAhead = new Date(now.getTime() + 15 * 60000); 
        const tenMinsTasks = await db.query.donnaTasks.findMany({
            where: and(
                eq(schema.donnaTasks.status, 'pending'),
                eq(schema.donnaTasks.reminded10m, false),
                gte(schema.donnaTasks.scheduledAt, now),
                lte(schema.donnaTasks.scheduledAt, tenMinsAhead)
            )
        });

        for (const task of tenMinsTasks) {
            const messageBody = `🚀 *¡ATENCIÓN! (Faltan 10 min)*\nCésar, tu evento está a punto de comenzar:\n\n*${task.title}*`;
            
            const sendResult = await whatsappService.sendMessage(targetNumber, messageBody);
            
            if (sendResult.success) {
                await db.update(schema.donnaTasks)
                    .set({ reminded10m: true, updatedAt: new Date() })
                    .where(eq(schema.donnaTasks.id, task.id));
                sentCount++;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Agenda reminders processed', 
            details: {
                processed1Hour: oneHourTasks.length,
                processed10Min: tenMinsTasks.length,
                totalSent: sentCount
            }
        });

    } catch (error: any) {
        console.error('[CRON Agenda Reminders Error]:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
