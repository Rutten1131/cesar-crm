
import { db } from './lib/db/index';
import { donnaTasks } from './lib/db/schema';
import { gte, and, lt } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Checking tasks for:', now.toISOString());
    
    const tasks = await db.select().from(donnaTasks).where(
      and(
        gte(donnaTasks.scheduledAt, startOfDay),
        lt(donnaTasks.scheduledAt, endOfDay)
      )
    );

    console.log('--- AGENDA DE HOY (DB) ---');
    console.log('Encontradas:', tasks.length);
    tasks.forEach(t => {
      console.log(`- [${t.scheduledAt.toISOString()}] ${t.title}`);
      console.log(`  Banderas: Morning:${t.remindedMorning}, 1h:${t.reminded1h}, 10m:${t.reminded10m}, Status:${t.status}`);
    });
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    process.exit(0);
  }
}

check();
