import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { UniversalPdfDocument } from '@/components/pdf/UniversalPdfDocument';

export type DocumentType = 'quotation' | 'contract' | 'generic';

export interface DocumentOptions {
    logoUrl?: string;
    footerUrl?: string;
    clientName?: string;
    signerName?: string;
}

export class PdfDocumentService {
    /**
     * Genera un PDF en memoria (Buffer) basado en el contenido markdown proporcionado.
     */
    async generatePdf(content: string, type: DocumentType = 'generic', options: DocumentOptions = {}): Promise<Buffer> {
        console.log(`🖨️ [PdfDocumentService] Generando PDF tipo: ${type}`);

        try {
            // Resolución de rutas absolutas para activos locales (requerido para renderToBuffer en Node)
            const path = await import('path');
            const fs = await import('fs');
            const publicPath = path.join(process.cwd(), 'public');

            const getAssetBase64 = (assetName: string) => {
                const fullPath = path.join(publicPath, assetName);
                if (fs.existsSync(fullPath)) {
                    const imageBuffer = fs.readFileSync(fullPath);
                    const extension = path.extname(assetName).substring(1);
                    return `data:image/${extension};base64,${imageBuffer.toString('base64')}`;
                }
                return undefined;
            };

            const defaultLogo = getAssetBase64('logo-membrete.png');
            const defaultFooter = getAssetBase64('pie-pagina.png');

            const docElement = React.createElement(UniversalPdfDocument, {
                content,
                logoUrl: options.logoUrl || defaultLogo,
                footerUrl: options.footerUrl || defaultFooter,
                showSignatureLines: type === 'contract' || type === 'quotation',
                signerName: options.signerName || 'Ing. César Reyes Jaramillo',
                clientName: options.clientName || 'EL CLIENTE'
            });

            // renderToBuffer es específico de Node.js
            const buffer = await renderToBuffer(docElement as any);
            console.log(`✅ [PdfDocumentService] PDF generado exitosamente (${buffer.length} bytes)`);
            return buffer;
        } catch (error: any) {
            console.error('❌ [PdfDocumentService] Error al generar PDF:', error);
            throw new Error(`Fallo en generación de PDF: ${error.message}`);
        }
    }
}

export const pdfDocumentService = new PdfDocumentService();
