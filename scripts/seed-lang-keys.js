const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LANG_KEYS = [
  { key: "lang.german", de: "Deutsch", it: "Tedesco", category: "language" },
  { key: "lang.english", de: "English", it: "Inglese", category: "language" },
  { key: "lang.turkish", de: "Türkçe", it: "Turco", category: "language" },
  { key: "lang.arabic", de: "العربية", it: "Arabo", category: "language" },
  { key: "lang.italian", de: "Italiano", it: "Italiano", category: "language" },
];

(async () => {
  for (const item of LANG_KEYS) {
    await prisma.translation.upsert({
      where: { key_language: { key: item.key, language: "de" } },
      create: { key: item.key, language: "de", value: item.de, category: item.category },
      update: { value: item.de, category: item.category },
    });
    await prisma.translation.upsert({
      where: { key_language: { key: item.key, language: "it" } },
      create: { key: item.key, language: "it", value: item.it, category: item.category },
      update: { value: item.it, category: item.category },
    });
    console.log(`Seeded ${item.key}`);
  }
  console.log('Done seeding lang keys');
  await prisma.$disconnect();
})();
