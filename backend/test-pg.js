// Test with raw pg driver, not Prisma
const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'cancercare360',
  user: 'cancercare',
  password: 'cancercare123',
});
client.connect()
  .then(() => { console.log("PG_CONNECT: OK"); return client.query("SELECT 1"); })
  .then(r => { console.log("PG_QUERY: OK, rows:", r.rows.length); return client.end(); })
  .catch(e => { console.error("PG_FAIL:", e.message); process.exit(1); });
