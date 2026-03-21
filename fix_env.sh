#!/bin/bash
cd /home/ubuntu/donna-agent

cat << 'EOF' > src/config/env.ts.new
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().min(1, "Telegram Bot Token is required"),
    OPENAI_API_KEY: z.string().min(1, "OpenAI API Key is required"),
    EVOLUTION_API_URL: z.string().url("Evolution API URL must be a valid URL"),
    EVOLUTION_API_KEY: z.string().min(1, "Evolution API Key is required"),
    EVOLUTION_INSTANCE: z.string().min(1, "Evolution Instance Name is required"),
    CRM_API_URL: z.string().url("CRM API URL must be a valid URL"),
    CRM_API_KEY: z.string().min(1, "CRM API Key is required"),
    DONNA_NUMBER: z.string().optional(),
    PORT: z.string().transform(Number).default("3000"),
    ENABLE_DEBUG: z.string().transform((val) => val === 'true').default("false"),
    OPENAI_MODEL: z.string().default("gpt-4o"),
    USE_O1_MODEL: z.string().transform((val) => val === 'true').default("true"),
    TOOL_MODEL_ID: z.string().default("gpt-4o-mini"),
});

export const env = envSchema.parse(process.env);
EOF

cp src/config/env.ts.new src/config/env.ts
rm src/config/env.ts.new

echo "Starting PM2..."
pm2 delete donna-agent || true
pm2 start "npx tsx src/index.ts" --name donna-agent
pm2 save
sleep 3
pm2 logs donna-agent --lines 20 --nostream
