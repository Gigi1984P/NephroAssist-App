const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newTranslations = [
  { key: "documents.desc", de: "Verwalten und reviewen Sie alle hochgeladenen Dokumente", it: "Gestisci e rivedi tutti i documenti caricati", category: "documents" },
  { key: "documents.upload", de: "Hochladen", it: "Carica", category: "documents" },
  { key: "documents.count", de: "Dokumente", it: "Documenti", category: "documents" },
  { key: "documents.empty", de: "Keine Dokumente", it: "Nessun documento", category: "documents" },
  { key: "documents.uploadFirst", de: "Laden Sie Ihr erstes Dokument hoch.", it: "Carica il tuo primo documento.", category: "documents" },
  { key: "documents.review", de: "Review", it: "Revisiona", category: "documents" },
  { key: "documents.uploadTitle", de: "Dokument hochladen", it: "Carica documento", category: "documents" },
  { key: "documents.dropFile", de: "Datei hierher ziehen oder", it: "Trascina il file qui o", category: "documents" },
  { key: "documents.selectFile", de: "Datei auswählen", it: "Seleziona file", category: "documents" },
  { key: "documents.decision", de: "Entscheidung", it: "Decisione", category: "documents" },
  { key: "documents.accept", de: "✓ Akzeptieren", it: "✓ Accetta", category: "documents" },
  { key: "documents.reject", de: "✗ Ablehnen", it: "✗ Rifiuta", category: "documents" },
  { key: "documents.requestInfo", de: "? Rückfrage", it: "? Richiedi info", category: "documents" },
  { key: "documents.commentOptional", de: "Kommentar (optional)", it: "Commento (opzionale)", category: "documents" },
  { key: "documents.commentPlaceholder", de: "z.B. Bitte bessere Qualität hochladen...", it: "es. Carica miglior qualità...", category: "documents" },
  { key: "blockers.desc", de: "Aktive Hindernisse und Probleme im Überblick", it: "Panoramica di ostacoli e problemi attivi", category: "blockers" },
  { key: "blockers.new", de: "Neuer Blocker", it: "Nuovo blocco", category: "blockers" },
  { key: "blockers.none", de: "Keine aktiven Blocker", it: "Nessun blocco attivo", category: "blockers" },
  { key: "blockers.allGood", de: "Alles läuft reibungslos!", it: "Tutto procede senza intoppi!", category: "blockers" },
  { key: "blockers.resolved", de: "Gelöst", it: "Risolto", category: "blockers" },
  { key: "blockers.newTitle", de: "Neuer Blocker", it: "Nuovo blocco", category: "blockers" },
  { key: "blockers.selectPatient", de: "Patient auswählen...", it: "Seleziona paziente...", category: "blockers" },
  { key: "blockers.descPlaceholder", de: "Beschreiben Sie das Problem...", it: "Descrivi il problema...", category: "blockers" },
  { key: "blockers.creating", de: "Wird erstellt...", it: "Creazione in corso...", category: "blockers" },
  { key: "blockers.create", de: "Blocker erstellen", it: "Crea blocco", category: "blockers" },
  { key: "appointments.desc", de: "Alle anstehenden Termine im Überblick", it: "Panoramica di tutti gli appuntamenti in arrivo", category: "appointments" },
  { key: "appointments.new", de: "Neuer Termin", it: "Nuovo appuntamento", category: "appointments" },
  { key: "appointments.count", de: "Termine", it: "Appuntamenti", category: "appointments" },
  { key: "appointments.none", de: "Keine Termine gefunden", it: "Nessun appuntamento trovato", category: "appointments" },
  { key: "appointments.tryFilter", de: "Versuchen Sie andere Filtereinstellungen", it: "Prova altre impostazioni di filtro", category: "appointments" },
  { key: "appointments.createFirst", de: "Erstellen Sie Ihren ersten Termin", it: "Crea il tuo primo appuntamento", category: "appointments" },
  { key: "notifications.title", de: "Benachrichtigungen", it: "Notifiche", category: "notifications" },
  { key: "notifications.allRead", de: "Alle gelesen", it: "Tutti letti", category: "notifications" },
  { key: "notifications.none", de: "Keine Benachrichtigungen", it: "Nessuna notifica", category: "notifications" },
];

(async () => {
  let created = 0;
  let updated = 0;
  
  for (const item of newTranslations) {
    for (const lang of ['de', 'it']) {
      const value = item[lang];
      if (!value) continue;
      
      const existing = await prisma.translation.findFirst({
        where: { key: item.key, language: lang }
      });
      
      if (existing) {
        await prisma.translation.update({
          where: { id: existing.id },
          data: { value, category: item.category }
        });
        updated++;
      } else {
        await prisma.translation.create({
          data: { key: item.key, language: lang, value, category: item.category }
        });
        created++;
      }
    }
  }
  
  console.log(`Done: ${created} created, ${updated} updated`);
  await prisma.$disconnect();
})();
