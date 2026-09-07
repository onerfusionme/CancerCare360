const { PrismaClient } = require('@prisma/client');

async function test(url) {
  console.log('Testing URL:', url);
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$connect();
    console.log('SUCCESS with:', url);
    const count = await prisma.user.count();
    console.log('User count:', count);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log('FAILED with:', url, err.message);
    return false;
  }
}

async function main() {
  const urls = [
    'postgresql://cancercare:cancercare123@[::1]:5432/cancercare360?schema=public',
    'postgresql://cancercare:cancercare123@127.0.0.1:5432/cancercare360?schema=public',
    'postgresql://cancercare:cancercare123@localhost:5432/cancercare360?schema=public',
    'postgresql://cancercare:cancercare123@172.29.208.111:5432/cancercare360?schema=public',
  ];
  for (const u of urls) {
    const ok = await test(u);
    if (ok) {
      console.log('FOUND WORKING URL:', u);
      break;
    }
  }
}

main();
