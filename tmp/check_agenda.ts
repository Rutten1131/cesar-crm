
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { donnaTasks } from './lib/db/schema';
import { gte, lte, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function check() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  console.log('Checking tasks for:', now.toISOString());
  
  const tasks = await db.select().from(donnaTasks).where(
    and(
      gte(donnaTasks.scheduledAt, startOfDay),
      lte(donnaTasks.scheduledAt, endOfDay)
    )
  );

  console.log('Tasks found today:', tasks.length);
  tasks.forEach(t => {
    console.log(`- [${t.scheduledAt.toISOString()}] ${t.title} | Morning: ${t.remindedMorning} | 1h: ${t.reminded1h} | 10m: ${t.reminded10m}`);
  });

  process.exit(0);
}

check();
