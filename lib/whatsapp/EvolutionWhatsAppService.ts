import axios from 'axios';

export class EvolutionWhatsAppService {
    private getCredentials() {
        return {
            apiUrl: process.env.EVOLUTION_API_URL || 'http://129.153.116.213:8080',
            apiKey: process.env.EVOLUTION_API_KEY || '42a447c1-3d74-4b52-9571-042c174f7621',
            instance: process.env.EVOLUTION_INSTANCE || 'Automatizotunegocio'
        };
    }

    async sendMessage(phone: string, text: string) {
        const { apiUrl, apiKey, instance } = this.getCredentials();
        const url = `${apiUrl}/message/sendText/${instance}`;

        // Send just the plain number, Evolution handles the format
        const cleanNumber = phone.replace(/\D/g, '');

        const payload = {
            number: cleanNumber,
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
        const cleanNumber = phone.replace(/\D/g, '');

        // Evolution API needs the data URI scheme for base64
        const mediaBase64 = `data:application/pdf;base64,${buffer.toString('base64')}`;

        const payload = {
            number: cleanNumber,
            options: {
                delay: 1200,
                presence: "composing"
            },
            mediaMessage: {
                mediatype: "document",
                caption: caption || "",
                media: mediaBase64,
                fileName: fileName
            }
        };

        console.log(`📤 [EvolutionAPI] Sending PDF to ${cleanNumber}`);

        try {
            // Disable timeout and limits for large PDFs
            const response = await axios.post(url, payload, {
                headers: {
                    'apikey': apiKey,
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });
            console.log(`✅ [EvolutionAPI] Document sent successfully!`);
            return { success: true, data: response.data };
        } catch (error: any) {
            const errData = error.response?.data || error.message;
            console.error('❌ [EvolutionAPI] sendDocument 400 Error:', JSON.stringify(errData));
            // Return raw error so we can read it in logs
            return { success: false, error: typeof errData === 'string' ? errData : JSON.stringify(errData) };
        }
    }
}

export const evolutionWhatsAppService = new EvolutionWhatsAppService();

