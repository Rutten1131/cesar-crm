CREATE TABLE "donna_tasks" (
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
--> statement-breakpoint
ALTER TABLE "pending_messages_queue" ADD COLUMN "claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "fecha_primer_contacto" timestamp;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "proximo_seguimiento" timestamp;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "intentos_realizados" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "estado_seguimiento" text DEFAULT 'PENDIENTE';--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "numero_whatsapp" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "notas_seguimiento" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "intentos_cobro" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "proximo_recordatorio" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "estado_cobro" text DEFAULT 'PENDIENTE';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "numero_whatsapp" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "log_cobranza" text;--> statement-breakpoint
ALTER TABLE "donna_tasks" ADD CONSTRAINT "donna_tasks_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;