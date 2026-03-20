import { NextResponse } from 'next/server';
import { WhatsAppAdapter } from '@/lib/messaging/adapters/WhatsAppAdapter';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetNumber = process.env.WHATSAPP_ADMIN_NUMBER || '593984368560';
        const messageBody = `⛰️ *Recordatorio Semanal* ⛰️\nCésar, recuerda anunciar la finca *"Aroma de Montaña"* hoy. ¡Mucho éxito!`;
        
        const adapter = new WhatsAppAdapter();
        const sendResult = await adapter.sendMessage(targetNumber, messageBody);

        if (sendResult.success) {
            return NextResponse.json({ success: true, message: 'Monday reminder sent' });
        } else {
            return NextResponse.json({ success: false, error: sendResult.error }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[CRON Monday Reminder Error]:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
