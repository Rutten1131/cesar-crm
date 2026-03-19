// lib/templates/followup-templates.ts

/**
 * 3.3 Cadencia de Seguimiento (5 intentos)
 *
 * Intento 1 — Entrega: Saludo + cotización adjunta + invitación a consultar dudas
 * Intento 2 — Recordatorio (+24 horas): Verificación de recepción + disposición a resolver preguntas
 * Intento 3 — Valor (+48 horas): Recordatorio de beneficio específico
 * Intento 4 — Urgencia (+72 horas): Mención de disponibilidad o plazo de la oferta
 * Intento 5 — Cierre (+7 días): Mensaje final, dejando puerta abierta
 */

export function getFollowupTemplate(
    attempt: number, 
    customerName: string, 
    serviceName: string,
    agentName: string = 'Donna',
    companyName: string = 'OBJETIVO'
): string {
    const firstName = customerName.split(' ')[0];

    switch (attempt) {
        case 1:
            return `¡Hola ${firstName}! Te saluda ${agentName} del equipo de ${companyName}. 👋\n\nTe adjunto la cotización para el servicio de *${serviceName}* que conversaste con Cheche.\n\nPor favor, revísala y avísame si tienes alguna duda. ¡Estoy aquí para ayudarte!`;
        
        case 2:
            return `¡Hola ${firstName}! Buen día. ☀️\n\nSolo te escribo rapidito para confirmar que hayas recibido el documento con la propuesta de *${serviceName}* sin problemas.\n\n¿Tienes alguna pregunta sobre los detalles o el alcance? Será un gusto aclararlo.`;
            
        case 3:
            return `¡Hola ${firstName}! Espero que estés teniendo una excelente semana.\n\nQuería recordarte que con la propuesta de *${serviceName}* no solo obtienes el servicio, sino un sistema enfocado en ahorrarte tiempo y generar valor real para tu negocio. 🚀\n\nCheche me comentó que este proyecto tiene mucho potencial. ¿Qué te ha parecido la propuesta hasta ahora?`;
            
        case 4:
            return `¡Hola ${firstName}! ¿Cómo te va?\n\nTe escribo porque nuestra disponibilidad de agenda para este mes se está llenando, y queríamos saber si deseas que reservemos tu espacio para arrancar con *${serviceName}*.\n\nDéjame saber si tomamos acción o si prefieres dejarlo para más adelante. ⏳`;
            
        case 5:
            return `¡Hola ${firstName}! 🌟\n\nComo no he tenido respuesta, asumo que de momento este proyecto no es prioridad o los tiempos no se alinean. No te preocupes, dejaré tu cotización en pausa.\n\nSi en el futuro deseas retomar lo de *${serviceName}*, sabes que cuentas con nosotros aquí en ${companyName}. ¡Que tengas mucho éxito! 🙌`;
            
        default:
            return `Hola ${firstName}, te escribe ${agentName} por tu cotización de ${serviceName}. Cuéntame si tienes novedades.`;
    }
}
