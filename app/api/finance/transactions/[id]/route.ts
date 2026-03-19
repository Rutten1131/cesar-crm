import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    try {
        const body = await req.json();
        
        // Map camelCase to snake_case if needed
        const updates: any = {};
        if (body.status) updates.status = body.status;
        if (body.estadoCobro) updates.estado_cobro = body.estadoCobro;
        if (body.intentosCobro !== undefined) updates.intentos_cobro = body.intentosCobro;
        
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
