// Test if PrismaClient works in the same way as NestJS PrismaService
const { PrismaClient } = require("@prisma/client");

class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
  async onModuleInit() {
    await this.$connect();
  }
}

const p = new PrismaService();
p.onModuleInit()
  .then(() => { 
    console.log("DB_CONNECTION: OK via PrismaService pattern"); 
    return p.$queryRaw`SELECT current_user, current_database()`;
  })
  .then(r => { console.log("QUERY:", JSON.stringify(r)); return p.$disconnect(); })
  .catch(e => { console.error("DB_CONNECTION: FAIL -", e.message.substring(0, 200)); process.exit(1); });
