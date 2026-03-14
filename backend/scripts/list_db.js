const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const users = await p.user.findMany();
    const entries = await p.journalEntry.findMany();
    console.log('---USERS---');
    console.log(JSON.stringify(users, null, 2));
    console.log('---ENTRIES---');
    console.log(JSON.stringify(entries, null, 2));
  } catch (e) {
    console.error('ERROR', e);
  } finally {
    await p.$disconnect();
  }
})();
