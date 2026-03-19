import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch quotations with lead names if possible
        const allQuotations = await db.query.quotations.findMany({
            orderBy: [desc(schema.quotations.updatedAt)],
            with: {
                lead: true,
                // contact: true // If contact relation is defined in drizzle schema
            }
        });

        return NextResponse.json(allQuotations);
    } catch (error: any) {
        console.error('Error fetching quotations tracking:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
