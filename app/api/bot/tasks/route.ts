import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTaskSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    scheduledAt: z.string().datetime(), // ISO string provided by LLM
    contactId: z.string().uuid().optional()
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = createTaskSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error }, { status: 400 });
        }

        const data = parsed.data;

        // Ensure date is in the future? Optional, but LLM might produce past dates by accident.
        const scheduledDate = new Date(data.scheduledAt);

        const newEvent = await db.insert(schema.donnaTasks)
            .values({
                title: data.title,
                description: data.description,
                scheduledAt: scheduledDate,
                contactId: data.contactId,
                status: 'pending'
            })
            .returning({ id: schema.donnaTasks.id });

        return NextResponse.json({
            success: true,
            message: 'Task created successfully',
            taskId: newEvent[0].id
        });

    } catch (error: any) {
        console.error('[API Bot Tasks Error]:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
