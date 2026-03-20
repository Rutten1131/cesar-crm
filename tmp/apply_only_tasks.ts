import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!, { pgbouncer: true });

async function apply() {
  try {
    const q1 = `
      CREATE TABLE IF NOT EXISTS "donna_tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "contact_id" uuid,
        "title" text NOT NULL,
        "description" text,
        "scheduled_at" timestamp with time zone NOT NULL,
        "reminded_morning" boolean DEFAULT false NOT NULL,
        "reminded_1h" boolean DEFAULT false NOT NULL,
        "reminded_10m" boolean DEFAULT false NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log('Creating donna_tasks...');
    await sql.unsafe(q1);

    const q2 = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donna_tasks_contact_id_contacts_id_fk') THEN
            ALTER TABLE "donna_tasks" ADD CONSTRAINT "donna_tasks_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
        END IF;
      END $$;
    `;
    console.log('Adding foreign key constraint...');
    await sql.unsafe(q2);

    console.log('Success! Table initialized.');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await sql.end();
  }
}

apply();
