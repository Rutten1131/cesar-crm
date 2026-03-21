import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- DEBUG START ---');
console.log('Current WorkDir:', process.cwd());
const envPath = path.resolve(process.cwd(), '.env');
console.log('Target .env path:', envPath);
console.log('Target .env exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const res = dotenv.config({ path: envPath });
    if (res.error) console.error('dotenv.config Error:', res.error);
    else console.log('dotenv.config Success');
}

console.log('CRM_BASE_URL:', process.env.CRM_BASE_URL);
const secret = process.env.DONNA_API_SECRET || '';
console.log('DONNA_API_SECRET_LEN:', secret.length);
console.log('DONNA_API_SECRET_START:', secret.substring(0, 5));
console.log('--- DEBUG END ---');
