import axios from 'axios';

export class EvolutionWhatsAppService {
    private getCredentials() {
        return {
            apiUrl: process.env.EVOLUTION_API_URL || '',
            apiKey: process.env.EVOLUTION_API_KEY || '',
            instance: process.env.EVOLUTION_INSTANCE || ''
        };
    }

    /**
     * Formats phone number for Evolution API
     * Evolution API expects: 593963410409@s.whatsapp.net
     */
    private formatNumber(phone: string): string {
        const clean = phone.replace(/\D/g, '');
        return `${clean}@s.whatsapp.net`;
    }

    async sendMessage(phone: string, text: string) {
        const { apiUrl, apiKey, instance } = this.getCredentials();
        const url = `${apiUrl}/message/sendText/${instance}`;

        const payload = {
            number: this.formatNumber(phone),
            options: {
                delay: 1200,
                presence: "composing",
                linkPreview: true
            },
            textMessage: {
                text: text
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'apikey': apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            const errData = error.response?.data || error.message;
            console.error('❌ [EvolutionAPI] sendMessage Error:', JSON.stringify(errData));
            return { success: false, error: typeof errData === 'string' ? errData : JSON.stringify(errData) };
        }
    }

    async sendDocument(phone: string, buffer: Buffer, fileName: string, caption?: string) {
        const { apiUrl, apiKey, instance } = this.getCredentials();
        const url = `${apiUrl}/message/sendMedia/${instance}`;
        const formattedNumber = this.formatNumber(phone);

        const payload = {
            number: formattedNumber,
            mediaMessage: {
                mediatype: "document",
                caption: caption || "",
                media: buffer.toString('base64'),
                fileName: fileName
            }
        };

        console.log(`📤 [EvolutionAPI] Sending document to ${formattedNumber} via ${url}`);

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'apikey': apiKey,
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });
            console.log(`✅ [EvolutionAPI] Document sent successfully`);
            return { success: true, data: response.data };
        } catch (error: any) {
            const errData = error.response?.data || error.message;
            console.error('❌ [EvolutionAPI] sendDocument Error:', JSON.stringify(errData));
            return { success: false, error: typeof errData === 'string' ? errData : JSON.stringify(errData) };
        }
    }
}

export const evolutionWhatsAppService = new EvolutionWhatsAppService();

