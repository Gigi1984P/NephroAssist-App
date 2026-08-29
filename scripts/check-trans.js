const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const de = await prisma.translation.findMany({ where: { language: 'de' }, select: { key: true, value: true }, take: 10 });
  const it = await prisma.translation.findMany({ where: { language: 'it' }, select: { key: true, value: true }, take: 10 });
  console.log('DE samples:', de.map(d => d.value));
  console.log('IT samples:', it.map(d => d.value));
  await prisma.$disconnect();
})();
