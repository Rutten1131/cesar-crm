import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function check() {
  try {
    const res = await client`SELECT table_name FROM information_schema.tables WHERE table_name = 'donna_tasks'`;
    console.log('Table exists?', res.length > 0);
    
    if (res.length > 0) {
      const countRes = await client`SELECT count(*) FROM donna_tasks`;
      console.log('Total tasks in DB:', countRes[0].count);

      const tasksToday = await client`SELECT title, scheduled_at, reminded_morning, reminded_1h FROM donna_tasks WHERE scheduled_at >= CURRENT_DATE`;
      console.log('Tasks for today onwards:', tasksToday);
    }
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}
check();
