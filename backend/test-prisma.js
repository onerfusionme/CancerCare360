// Test with postgres superuser
process.env.DATABASE_URL = "postgresql://postgres@127.0.0.1:5432/cancercare360?schema=public";
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.$connect()
  .then(() => { console.log("POSTGRES_CONNECT: OK"); return p.$queryRaw`SELECT 1`; })
  .then(() => { console.log("QUERY: OK"); return p.$disconnect(); })
  .catch(e => { console.error("FAIL:", e.message.substring(0, 200)); process.exit(1); });
