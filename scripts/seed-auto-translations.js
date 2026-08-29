const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const translations = require('./generated_translations.json');

(async () => {
  let created = 0;
  let updated = 0;

  for (const item of translations) {
    const { key, de, it } = item;
    if (!key || !de) continue;
    
    try {
      const deRes = await prisma.translation.upsert({
        where: { key_language: { key, language: "de" } },
        create: { key, language: "de", value: de, category: "auto" },
        update: { value: de },
      });
      if (deRes.createdAt.getTime() === deRes.updatedAt.getTime()) created++; else updated++;
    } catch (e) { console.error('DE error for', key, e.message); }
    
    try {
      const itRes = await prisma.translation.upsert({
        where: { key_language: { key, language: "it" } },
        create: { key, language: "it", value: it || de, category: "auto" },
        update: { value: it || de },
      });
      if (itRes.createdAt.getTime() === itRes.updatedAt.getTime()) created++; else updated++;
    } catch (e) { console.error('IT error for', key, e.message); }
  }

  console.log(`Done: ${created} created, ${updated} updated`);
  await prisma.$disconnect();
})();
