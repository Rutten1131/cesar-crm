import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        version: '2026-03-20-v2',
        timestamp: new Date().toISOString(),
        service: 'CRM Objetivo'
    }, { status: 200 });
}
