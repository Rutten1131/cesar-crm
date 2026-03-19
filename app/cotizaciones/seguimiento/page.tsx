"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, MessageCircle, ArrowLeft, Calendar, History, TrendingUp, Filter } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Quotation } from "@/lib/types"

export default function SeguimientoCotizacionesPage() {
    const [quotations, setQuotations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/cotizaciones/seguimiento")
            if (res.ok) {
                const data = await res.json()
                setQuotations(data)
            }
        } catch (error) {
            console.error("Error loading follow-up data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDIENTE': return 'bg-gray-500'
            case 'ENVIADO': return 'bg-blue-500'
            case 'EN_SEGUIMIENTO': return 'bg-orange-500'
            case 'RESPONDIDO': return 'bg-green-500'
            case 'CERRADO': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const handleWhatsApp = (q: any) => {
        const phone = q.numeroWhatsapp?.replace(/\D/g, '') || ''
        const message = `Hola, te saludo de Objetivo. Seguimos en contacto sobre la propuesta estratégica para *${q.lead?.businessName || 'tu negocio'}*. ¿Pudiste revisarla?`
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/cotizaciones">
                            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
                                <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Constructor
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                             Centro de Seguimiento <TrendingUp className="h-8 w-8 text-primary" />
                        </h1>
                        <p className="text-muted-foreground font-medium">Control en tiempo real de los hilos de conversación automáticos.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {quotations.length > 0 ? quotations.map((q, idx) => (
                            <Card key={q.id} className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm group hover:ring-2 hover:ring-primary/20 transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Status Sidebar */}
                                        <div className={cn("w-full md:w-3 border-r", getStatusColor(q.estadoSeguimiento))} />
                                        
                                        <div className="flex-1 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-xl tracking-tight">{q.lead?.businessName || 'Cotización Directa'}</h3>
                                                    <Badge className={cn("text-[10px] font-black uppercase tracking-widest", getStatusColor(q.estadoSeguimiento))}>
                                                        {q.estadoSeguimiento}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                                                    {q.title} • <span className="text-foreground">{q.lead?.contactName || 'Sin contacto'}</span>
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-3 mt-3">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                                                        <History className="h-3.5 w-3.5" />
                                                        {q.intentosRealizados} Intentos
                                                    </div>
                                                    {q.proximoSeguimiento && (
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            Próximo: {format(new Date(q.proximoSeguimiento), "dd 'de' MMMM", { locale: es })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="hidden lg:block text-right mr-4 max-w-[200px]">
                                                    <p className="text-[10px] uppercase font-black opacity-40 mb-1">Última nota</p>
                                                    <p className="text-xs italic text-muted-foreground line-clamp-1">
                                                        {q.notasSeguimiento?.split('\n').pop() || 'Sin actividad reciente'}
                                                    </p>
                                                </div>
                                                
                                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shrink-0" onClick={() => handleWhatsApp(q)}>
                                                    <MessageCircle className="h-6 w-6 text-green-500" />
                                                </Button>
                                                
                                                <Link href={`/leads/${q.leadId}`} className="flex-1 md:flex-none">
                                                    <Button className="h-12 w-full md:w-auto px-6 font-black uppercase text-xs tracking-widest rounded-2xl">
                                                        Ver Perfil
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="text-center p-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                                <Filter className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                                <h2 className="text-xl font-black opacity-50 uppercase tracking-tighter">Sin seguimientos activos</h2>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Las cotizaciones que generes con Donna o desde el constructor aparecerán aquí automáticamente.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
