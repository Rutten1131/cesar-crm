const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.sxsdmjpaqgmpmvozoicj:VhTQvB608MDLHoHs@aws-1-us-east-1.pooler.supabase.com:6543/postgres' });
async function main() {
    await client.connect();
    const res = await client.query("SELECT title, proximo_seguimiento FROM quotations WHERE title LIKE '%TEST-4%' OR title LIKE '%TEST-5%'");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
main();
