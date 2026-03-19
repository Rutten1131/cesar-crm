// lib/templates/collection-templates.ts

/**
 * 4.4 Cadencia de Cobranza Persuasiva
 *
 * Recordatorio 1 (Día 1) — Aviso amable, trabajo entregado.
 * Recordatorio 2 (Día 3) — Reiteración de valor + facilidad de pago.
 * Recordatorio 3 (Día 7) — Solicita fecha estimada.
 * Recordatorio 4 (Día 14) — Cerrar el proyecto formalmente.
 */

export function getCollectionTemplate(
    attempt: number,
    customerName: string,
    serviceName: string,
    amount: number,
    agentName: string = 'Donna',
    companyName: string = 'OBJETIVO'
): string {
    const firstName = customerName.split(' ')[0];
    const formattedAmount = amount.toFixed(2);

    switch (attempt) {
        case 1:
            return `¡Hola ${firstName}! Te saluda ${agentName} de ${companyName}. 👋\n\nQuería avisarte que el *${serviceName}* ya está listo y entregado. Nos quedó pendiente el detallito del pago de *$${formattedAmount}*.\n\nCuando puedas me avisas para coordinar. ¡Saludos! ✨`;
            
        case 2:
            return `¡Hola ${firstName}, buen día! ☀️\n\nSolo paso a recordarte que tenemos pendiente el pago de *$${formattedAmount}* por el servicio de *${serviceName}* que realizamos.\n\nCualquier consulta o si prefieres coordinar otra forma de pago, con gusto te ayudo.`;
            
        case 3:
            return `¡Hola ${firstName}, espero que todo vaya bien!\n\nTe escribo porque ya llevamos unos días con el pago pendiente por el *${serviceName}*. ¿Me podrías indicar una fecha aproximada en que podrías realizar la transferencia de los *$${formattedAmount}*?\n\nQuedo muy atenta a tu confirmación. 🙏`;
            
        case 4:
            return `¡Hola ${firstName}! Disculpa la insistencia.\n\nNecesito que coordinemos el pago de *$${formattedAmount}* correspondiente al *${serviceName}* para poder cerrar formalmente el proyecto administrativamente de nuestra parte.\n\nQuedamos a la espera de tus comentarios.`;
            
        default:
            return `Hola ${firstName}, tienes un saldo pendiente de $${formattedAmount} por ${serviceName}. Por favor confirma cuando puedas hacer el pago.`;
    }
}

export function getPaymentConfirmationTemplate(
    customerName: string,
    serviceName: string,
    amount: number,
    date: string,
    companyName: string = 'OBJETIVO'
): string {
    const firstName = customerName.split(' ')[0];
    const formattedAmount = amount.toFixed(2);

    return `¡Hola ${firstName}! ✅\n\nConfirmamos la recepción de tu pago de *$${formattedAmount}* por concepto de *${serviceName}* (Fecha de registro: ${date}).\n\nGracias por tu confianza. ¡Ha sido un placer trabajar contigo! Quedamos a tu disposición para futuros proyectos en ${companyName}. 🚀`;
}
