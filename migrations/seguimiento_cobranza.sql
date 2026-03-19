-- =========================================================================
-- MIGRATION: SISTEMA DE SEGUIMIENTO Y COBRANZA AUTOMATIZADA
-- Date: March 2026
-- =========================================================================

-- 1. Modificar tabla quotations
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "contact_id" uuid REFERENCES "contacts"("id");
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "fecha_primer_contacto" timestamp;
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "proximo_seguimiento" timestamp;
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "intentos_realizados" integer DEFAULT 0;
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "estado_seguimiento" text DEFAULT 'PENDIENTE';
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "numero_whatsapp" text;
ALTER TABLE "quotations" ADD COLUMN IF NOT EXISTS "notas_seguimiento" text;

-- Agregar restricciones CHECK para estado_seguimiento (simulando enum de Drizzle)
ALTER TABLE "quotations" DROP CONSTRAINT IF EXISTS chk_estado_seguimiento;
ALTER TABLE "quotations" ADD CONSTRAINT chk_estado_seguimiento CHECK (estado_seguimiento IN ('PENDIENTE', 'ENVIADO', 'EN_SEGUIMIENTO', 'RESPONDIDO', 'CERRADO'));


-- 2. Modificar tabla transactions
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "intentos_cobro" integer DEFAULT 0;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "proximo_recordatorio" timestamp;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "estado_cobro" text DEFAULT 'PENDIENTE';
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "numero_whatsapp" text;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "log_cobranza" text;

-- Agregar restricciones CHECK para estado_cobro (simulando enum de Drizzle)
ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS chk_estado_cobro;
ALTER TABLE "transactions" ADD CONSTRAINT chk_estado_cobro CHECK (estado_cobro IN ('PENDIENTE', 'EN_GESTION', 'PAGADO', 'INCOBRABLE'));

-- Creación de índices para optimizar las consultas del cron
CREATE INDEX IF NOT EXISTS "idx_quotations_proximo_seguimiento" ON "quotations" ("proximo_seguimiento", "estado_seguimiento");
CREATE INDEX IF NOT EXISTS "idx_transactions_due_date_estado" ON "transactions" ("due_date", "estado_cobro", "type", "status");

-- Fin de migración
