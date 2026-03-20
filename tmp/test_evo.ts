import { evolutionWhatsAppService } from './lib/whatsapp/EvolutionWhatsAppService';
import { WhatsAppAdapter } from './lib/messaging/adapters/WhatsAppAdapter';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log("Testing evolution via Adapter...");
  const adapter = new WhatsAppAdapter();
  
  const targetNumber = process.env.WHATSAPP_ADMIN_NUMBER || '593984368560';
  console.log("Target number:", targetNumber);
  console.log("EVOLUTION_API_URL locally:", process.env.EVOLUTION_API_URL);
  
  const res = await adapter.sendMessage(targetNumber, "Mensaje de prueba directo por adaptador");
  console.log("Result:", JSON.stringify(res, null, 2));

  console.log("Testing direct...");
  const res2 = await evolutionWhatsAppService.sendMessage(targetNumber, "Mensaje de prueba directo Evolution");
  console.log("Direct Result:", JSON.stringify(res2, null, 2));
}

test();
