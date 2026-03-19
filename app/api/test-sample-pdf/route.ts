import { NextResponse } from 'next/server';
import { pdfDocumentService } from '@/lib/donna/services/PdfDocumentService';

export const dynamic = 'force-dynamic';

// Sample Markdown content testing the new layout improvements
const sampleMarkdown = `
# Propuesta de Estrategia Digital 2026
**Preparado para:** Grupo Empresarial Reyes
**Responsable:** Ing. César Augusto Reyes Jaramillo
**Fecha:** 11 de Marzo, 2026

## 1. Introducción
Imagine esta escena: un futuro cliente busca sus servicios en internet y los encuentra en primer lugar, con una imagen impecable que transmite confianza total desde el primer segundo. **Ese es el objetivo vital de esta propuesta.**

No se trata solo de tener una página web; se trata de construir una **ventana digital estratégica** que trabaje para usted las 24 horas del día, convirtiendo visitantes en clientes reales.

## 2. Nuestra Propuesta de Valor
Para lograr un posicionamiento de autoridad en su sector, implementaremos una estructura técnica de alta conversión enfocada en tres pilares fundamentales:

*   **Diseño de Experiencia (UX):** Un sitio ultra-responsivo que se adapta perfectamente a móviles, tablets y computadoras, garantizando que nadie se pierda en el proceso.
*   **Velocidad y Rendimiento:** Optimizaremos cada recurso para una carga instantánea, reduciendo la tasa de rebote y mejorando la satisfacción del usuario.
*   **SEO de Nueva Generación:** Estaremos presentes justo donde sus clientes potenciales están buscando, utilizando palabras clave estratégicas para su mercado en Loja y el país.

## 3. Características del Sistema Donna
Donna no es solo un bot; es una asistente inteligente integrada que permite:
1.  **Atención 24/7:** Respuestas inmediatas a consultas frecuentes.
2.  **Calificación de Leads:** Identifica a los clientes más interesados automáticamente.
3.  **Generación de Documentos:** Crea cotizaciones y contratos como este en segundos.

________________________________________

## 4. Inversión del Proyecto
A continuación, se detalla la inversión requerida para la implementación de esta estructura digital:

RESUMEN DE INVERSIÓN
Servicio | Inversión
--- | ---
Desarrollo de Sitio Web Business Pro | $500.00
Implementación Donna Agent AI | $250.00
Integración de Reservas y Pagos | $150.00
________________________________________
**Total implementación única:** | **$900.00**

Costo operativo mensual: $15
(Incluye alojamiento premium, certificado SSL de seguridad y soporte técnico prioritario)

## 5. Términos y Condiciones
- El tiempo estimado de entrega es de 15 a 20 días hábiles.
- Se requiere un anticipo del 60% para iniciar el proyecto.
- El 40% restante se cancelará al momento de la entrega final y capacitación.

EL RESULTADO
Esta sección NO debería aparecer en el PDF generado. El sistema filtra inteligentemente cualquier texto bajo este encabezado para mantener la propuesta limpia y profesional, saltando directamente a la firma.

________________________________________
**Ing. César Reyes Jaramillo**
Responsable de Estrategia Digital | OBJETIVO
WhatsApp: +593 96 341 0409
`;

export async function GET() {
    try {
        const buffer = await pdfDocumentService.generatePdf(sampleMarkdown, 'quotation');
        
        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="plantilla_prueba.pdf"'
            }
        });
    } catch (error) {
        console.error('Error details:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
