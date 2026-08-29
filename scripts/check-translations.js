const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const counts = await prisma.translation.groupBy({ by: ['language'], _count: { language: true } });
  console.log('Translation counts:', JSON.stringify(counts));
  const langKeys = await prisma.translation.findMany({ where: { key: { startsWith: 'lang' } }, select: { key: true, language: true, value: true } });
  console.log('Lang keys:', JSON.stringify(langKeys));
  await prisma.$disconnect();
})();
