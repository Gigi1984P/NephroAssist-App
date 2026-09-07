import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TRANSLATIONS = [
  // === GENERAL / NAVIGATION ===
  { key: "app.title", de: "NephroAssist", it: "NephroAssist", category: "general" },
  { key: "nav.dashboard", de: "Dashboard", it: "Dashboard", category: "general" },
  { key: "nav.patients", de: "Patienten", it: "Pazienti", category: "general" },
  { key: "nav.admin", de: "Administration", it: "Amministrazione", category: "general" },
  { key: "nav.settings", de: "Einstellungen", it: "Impostazioni", category: "general" },
  { key: "nav.logout", de: "Abmelden", it: "Disconnetti", category: "general" },
  { key: "nav.login", de: "Anmelden", it: "Accedi", category: "general" },
  { key: "nav.back", de: "Zurück", it: "Indietro", category: "general" },
  { key: "nav.save", de: "Speichern", it: "Salva", category: "general" },
  { key: "nav.cancel", de: "Abbrechen", it: "Annulla", category: "general" },
  { key: "nav.edit", de: "Bearbeiten", it: "Modifica", category: "general" },
  { key: "nav.delete", de: "Löschen", it: "Elimina", category: "general" },
  { key: "nav.create", de: "Erstellen", it: "Crea", category: "general" },
  { key: "nav.search", de: "Suchen", it: "Cerca", category: "general" },
  { key: "nav.filter", de: "Filtern", it: "Filtra", category: "general" },
  { key: "nav.actions", de: "Aktionen", it: "Azioni", category: "general" },

  // === PATIENT ===
  { key: "patient.title", de: "Patienten", it: "Pazienti", category: "patient" },
  { key: "patient.new", de: "Neuer Patient", it: "Nuovo Paziente", category: "patient" },
  { key: "patient.edit", de: "Patient bearbeiten", it: "Modifica Paziente", category: "patient" },
  { key: "patient.firstName", de: "Vorname", it: "Nome", category: "patient" },
  { key: "patient.lastName", de: "Nachname", it: "Cognome", category: "patient" },
  { key: "patient.fullName", de: "Name", it: "Nome Completo", category: "patient" },
  { key: "patient.dateOfBirth", de: "Geburtsdatum", it: "Data di Nascita", category: "patient" },
  { key: "patient.age", de: "Alter", it: "Età", category: "patient" },
  { key: "patient.email", de: "E-Mail", it: "Email", category: "patient" },
  { key: "patient.phone", de: "Telefon", it: "Telefono", category: "patient" },
  { key: "patient.language", de: "Sprache", it: "Lingua", category: "patient" },
  { key: "patient.createdAt", de: "Erstellt", it: "Creato", category: "patient" },
  { key: "patient.updatedAt", de: "Aktualisiert", it: "Aggiornato", category: "patient" },
  { key: "patient.id", de: "Patienten-ID", it: "ID Paziente", category: "patient" },
  { key: "patient.notFound", de: "Patient nicht gefunden", it: "Paziente non trovato", category: "patient" },
  { key: "patient.details", de: "Patientendetails", it: "Dettagli Paziente", category: "patient" },
  { key: "patient.clinic", de: "Klinik", it: "Clinica", category: "patient" },
  { key: "patient.gp", de: "Hausarzt", it: "Medico di Medicina Generale", category: "patient" },
  { key: "patient.gpName", de: "Hausarzt Name", it: "Nome MMG", category: "patient" },
  { key: "patient.gpCity", de: "Hausarzt Stadt", it: "Città MMG", category: "patient" },
  { key: "patient.gpEmail", de: "Hausarzt E-Mail", it: "Email MMG", category: "patient" },
  { key: "patient.gpPhone", de: "Hausarzt Telefon", it: "Telefono MMG", category: "patient" },
  { key: "patient.gpAddress", de: "Hausarzt Adresse", it: "Indirizzo MMG", category: "patient" },

  // === ORGANIZATION ===
  { key: "org.title", de: "Organisation", it: "Organizzazione", category: "org" },
  { key: "org.name", de: "Organisationsname", it: "Nome Organizzazione", category: "org" },
  { key: "org.select", de: "Organisation auswählen", it: "Seleziona Organizzazione", category: "org" },

  // === CONSENT ===
  { key: "consent.title", de: "Einwilligung", it: "Consenso", category: "consent" },
  { key: "consent.pending", de: "Ausstehend", it: "In Attesa", category: "consent" },
  { key: "consent.granted", de: "Erteilt", it: "Concesso", category: "consent" },
  { key: "consent.revoked", de: "Widerrufen", it: "Revocato", category: "consent" },

  // === TRANSPLANT ===
  { key: "transplant.title", de: "Transplantation", it: "Trapianto", category: "transplant" },
  { key: "transplant.type", de: "Transplantationstyp", it: "Tipo di Trapianto", category: "transplant" },
  { key: "transplant.kidney", de: "Niere", it: "Rene", category: "transplant" },
  { key: "transplant.liver", de: "Leber", it: "Fegato", category: "transplant" },
  { key: "transplant.heart", de: "Herz", it: "Cuore", category: "transplant" },
  { key: "transplant.lung", de: "Lunge", it: "Polmone", category: "transplant" },
  { key: "transplant.pancreas", de: "Bauchspeicheldrüse", it: "Pancreas", category: "transplant" },
  { key: "transplant.combined", de: "Kombiniert", it: "Combinato", category: "transplant" },
  { key: "transplant.waitlist", de: "Warteliste", it: "Lista d'Attesa", category: "transplant" },
  { key: "transplant.waitlistSince", de: "Auf Warteliste seit", it: "In Lista d'Attesa dal", category: "transplant" },
  { key: "transplant.readiness", de: "Transplantations-Readiness", it: "Prontezza al Trapianto", category: "transplant" },
  { key: "transplant.readinessScore", de: "Readiness-Score", it: "Punteggio di Prontezza", category: "transplant" },

  // === CASE ===
  { key: "case.title", de: "Fall", it: "Caso", category: "case" },
  { key: "case.status", de: "Status", it: "Stato", category: "case" },
  { key: "case.active", de: "Aktiv", it: "Attivo", category: "case" },
  { key: "case.onHold", de: "Pausiert", it: "In Pausa", category: "case" },
  { key: "case.closed", de: "Abgeschlossen", it: "Chiuso", category: "case" },
  { key: "case.archived", de: "Archiviert", it: "Archiviato", category: "case" },
  { key: "case.program", de: "Programm", it: "Programma", category: "case" },
  { key: "case.coordinator", de: "Koordinator", it: "Coordinatore", category: "case" },
  { key: "case.created", de: "Fall erstellt", it: "Caso Creato", category: "case" },
  { key: "case.referralDate", de: "Einweisung", it: "Data di Invio", category: "case" },
  { key: "case.intakeDate", de: "Aufnahme", it: "Data di Ricovero", category: "case" },

  // === REQUIREMENTS ===
  { key: "req.title", de: "Untersuchungen", it: "Esami", category: "requirements" },
  { key: "req.open", de: "Offene Untersuchungen", it: "Esami Aperti", category: "requirements" },
  { key: "req.assign", de: "Zuweisen", it: "Assegna", category: "requirements" },
  { key: "req.status", de: "Status", it: "Stato", category: "requirements" },
  { key: "req.notStarted", de: "Nicht begonnen", it: "Non Iniziato", category: "requirements" },
  { key: "req.inProgress", de: "In Bearbeitung", it: "In Corso", category: "requirements" },
  { key: "req.accepted", de: "Akzeptiert", it: "Accettato", category: "requirements" },
  { key: "req.waived", de: "Befreit", it: "Esonerato", category: "requirements" },
  { key: "req.dueDate", de: "Fällig am", it: "Scadenza", category: "requirements" },
  { key: "req.completedAt", de: "Abgeschlossen am", it: "Completato il", category: "requirements" },

  // === DIALYSIS ===
  { key: "dialysis.title", de: "Dialyseregime", it: "Regime di Dialisi", category: "dialysis" },
  { key: "dialysis.procedure", de: "Dialyseverfahren", it: "Procedura di Dialisi", category: "dialysis" },
  { key: "dialysis.frequency", de: "Häufigkeit", it: "Frequenza", category: "dialysis" },
  { key: "dialysis.duration", de: "Dauer", it: "Durata", category: "dialysis" },
  { key: "dialysis.accessType", de: "Gefäßzugang", it: "Accesso Vascolare", category: "dialysis" },
  { key: "dialysis.targetWeight", de: "Zielgewicht", it: "Peso Obiettivo", category: "dialysis" },
  { key: "dialysis.ultrafiltration", de: "Ultrafiltrationsziel", it: "Obiettivo Ultrafiltrazione", category: "dialysis" },
  { key: "dialysis.bloodFlow", de: "Blutfluss", it: "Flusso ematico", category: "dialysis" },
  { key: "dialysis.dialysateFlow", de: "Dialysatfluss", it: "Flusso Dialisato", category: "dialysis" },
  { key: "dialysis.dialyzerType", de: "Dialysator-Typ", it: "Tipo di Dializzatore", category: "dialysis" },
  { key: "dialysis.dialyzerSize", de: "Dialysator-Größe", it: "Dimensione Dializzatore", category: "dialysis" },
  { key: "dialysis.potassium", de: "Kalium", it: "Potassio", category: "dialysis" },
  { key: "dialysis.calcium", de: "Calcium", it: "Calcio", category: "dialysis" },
  { key: "dialysis.sodium", de: "Natrium", it: "Sodio", category: "dialysis" },
  { key: "dialysis.bicarbonate", de: "Bicarbonat", it: "Bicarbonato", category: "dialysis" },
  { key: "dialysis.anticoagulation", de: "Antikoagulation", it: "Anticoagulazione", category: "dialysis" },
  { key: "dialysis.anticoagulationDose", de: "Antikoagulations-Dosierung", it: "Dosaggio Anticoagulante", category: "dialysis" },
  { key: "dialysis.medications", de: "Medikamente während Dialyse", it: "Farmaci durante la Dialisi", category: "dialysis" },
  { key: "dialysis.monitoring", de: "Überwachung", it: "Monitoraggio", category: "dialysis" },
  { key: "dialysis.labControls", de: "Labor-Kontrollen", it: "Controlli di Laboratorio", category: "dialysis" },
  { key: "dialysis.notes", de: "Notizen", it: "Note", category: "dialysis" },
  { key: "dialysis.hemodialysis", de: "Hämodialyse", it: "Emodialisi", category: "dialysis" },
  { key: "dialysis.hemodiafiltration", de: "Hämodiafiltration", it: "Emodiafiltrazione", category: "dialysis" },
  { key: "dialysis.peritoneal", de: "Peritonealdialyse", it: "Dialisi Peritoneale", category: "dialysis" },

  // === LAB ===
  { key: "lab.title", de: "Laborwerte", it: "Valori di Laboratorio", category: "lab" },
  { key: "lab.testType", de: "Testtyp", it: "Tipo di Test", category: "lab" },
  { key: "lab.value", de: "Wert", it: "Valore", category: "lab" },
  { key: "lab.unit", de: "Einheit", it: "Unità", category: "lab" },
  { key: "lab.reference", de: "Referenzbereich", it: "Range di Riferimento", category: "lab" },
  { key: "lab.testedAt", de: "Getestet am", it: "Testato il", category: "lab" },

  // === MEDICATIONS ===
  { key: "med.title", de: "Medikamentenplan", it: "Piano Farmacologico", category: "medications" },
  { key: "med.name", de: "Medikament", it: "Farmaco", category: "medications" },
  { key: "med.dosage", de: "Dosierung", it: "Dosaggio", category: "medications" },
  { key: "med.frequency", de: "Häufigkeit", it: "Frequenza", category: "medications" },
  { key: "med.route", de: "Darreichungsform", it: "Via di Somministrazione", category: "medications" },

  // === DOCUMENTS ===
  { key: "doc.title", de: "Dokumente", it: "Documenti", category: "documents" },
  { key: "doc.upload", de: "Dokument hochladen", it: "Carica Documento", category: "documents" },
  { key: "doc.filename", de: "Datei", it: "File", category: "documents" },
  { key: "doc.type", de: "Typ", it: "Tipo", category: "documents" },
  { key: "doc.status", de: "Status", it: "Stato", category: "documents" },
  { key: "doc.uploadedAt", de: "Hochgeladen", it: "Caricato", category: "documents" },

  // === APPOINTMENTS ===
  { key: "appt.title", de: "Termine", it: "Appuntamenti", category: "appointments" },
  { key: "appt.new", de: "Neuer Termin", it: "Nuovo Appuntamento", category: "appointments" },
  { key: "appt.type", de: "Typ", it: "Tipo", category: "appointments" },
  { key: "appt.date", de: "Datum", it: "Data", category: "appointments" },
  { key: "appt.location", de: "Ort", it: "Luogo", category: "appointments" },

  // === ONBOARDING ===
  { key: "onboarding.title", de: "Onboarding-Checkliste", it: "Checklist di Onboarding", category: "onboarding" },
  { key: "onboarding.progress", de: "Fortschritt", it: "Avanzamento", category: "onboarding" },
  { key: "onboarding.completed", de: "Abgeschlossen", it: "Completato", category: "onboarding" },
  { key: "onboarding.pending", de: "Ausstehend", it: "In Attesa", category: "onboarding" },

  // === COMMENTS ===
  { key: "comments.title", de: "Team-Kommentare", it: "Commenti del Team", category: "comments" },
  { key: "comments.placeholder", de: "Kommentar hinzufügen...", it: "Aggiungi commento...", category: "comments" },
  { key: "comments.send", de: "Senden", it: "Invia", category: "comments" },

  // === LOGIN / AUTH ===
  { key: "auth.login", de: "Anmelden", it: "Accedi", category: "auth" },
  { key: "auth.logout", de: "Abmelden", it: "Disconnetti", category: "auth" },
  { key: "auth.email", de: "E-Mail-Adresse", it: "Indirizzo Email", category: "auth" },
  { key: "auth.password", de: "Passwort", it: "Password", category: "auth" },
  { key: "auth.forgotPassword", de: "Passwort vergessen?", it: "Password dimenticata?", category: "auth" },
  { key: "auth.demoAccounts", de: "Demo-Zugangsdaten", it: "Account Demo", category: "auth" },
  { key: "auth.twoFactor", de: "Zwei-Faktor-Authentifizierung", it: "Autenticazione a Due Fattori", category: "auth" },
  { key: "auth.code", de: "Bestätigungscode", it: "Codice di Conferma", category: "auth" },
  { key: "auth.verify", de: "Code bestätigen", it: "Conferma Codice", category: "auth" },
  { key: "auth.resend", de: "Code erneut senden", it: "Reinvia Codice", category: "auth" },
  { key: "auth.invalidCredentials", de: "Ungültige Anmeldedaten", it: "Credenziali non valide", category: "auth" },
  { key: "auth.sessionExpired", de: "Sitzung abgelaufen", it: "Sessione scaduta", category: "auth" },
  { key: "auth.loginSubtitle", de: "Melden Sie sich mit Ihren Zugangsdaten an", it: "Accedi con le tue credenziali", category: "auth" },
  { key: "auth.registerSuccess", de: "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden.", it: "Registrazione completata. Conferma l'indirizzo email prima di accedere.", category: "auth" },
  { key: "auth.passwordResetSuccess", de: "Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.", it: "Password reimpostato con successo. Ora puoi accedere.", category: "auth" },
  { key: "auth.twoFactorSubtitle", de: "Bitte geben Sie den Code ein, den wir an {email} gesendet haben.", it: "Inserisci il codice inviato a {email}.", category: "auth" },
  { key: "auth.verifying", de: "Verifizieren...", it: "Verifica in corso...", category: "auth" },
  { key: "auth.signingIn", de: "Anmelden...", it: "Accesso in corso...", category: "auth" },
  { key: "auth.invalidResponse", de: "Ungültige Antwort", it: "Risposta non valida", category: "auth" },
  { key: "auth.networkError", de: "Netzwerkfehler", it: "Errore di rete", category: "auth" },
  { key: "auth.credentialsFilled", de: "Zugangsdaten eingefügt — jetzt anmelden!", it: "Credenziali inserite — accedi ora!", category: "auth" },
  { key: "auth.noAccount", de: "Noch kein Konto?", it: "Non hai un account?", category: "auth" },
  { key: "auth.register", de: "Registrieren", it: "Registrati", category: "auth" },
  { key: "auth.terms", de: "AGB", it: "Termini", category: "auth" },
  { key: "auth.privacy", de: "Datenschutz", it: "Privacy", category: "auth" },
  { key: "auth.imprint", de: "Impressum", it: "Impressum", category: "auth" },
  { key: "auth.clickToFill", de: "Klicken", it: "Clicca", category: "auth" },
  { key: "auth.passwordForAll", de: "Passwort für alle:", it: "Password per tutti:", category: "auth" },
  { key: "auth.validFor", de: "Gültig noch:", it: "Valido per:", category: "auth" },
  { key: "auth.cancel", de: "Abbrechen", it: "Annulla", category: "auth" },
  { key: "auth.forgotPasswordAlert", de: "Bitte kontaktieren Sie Ihren Administrator um das Passwort zurückzusetzen.", it: "Contatta l'amministratore per reimpostare la password.", category: "auth" },
  { key: "auth.emailPlaceholder", de: "name@beispiel.de", it: "nome@esempio.it", category: "auth" },

  // === ADMIN ===
  { key: "admin.title", de: "Administration", it: "Amministrazione", category: "admin" },
  { key: "admin.users", de: "Benutzer", it: "Utenti", category: "admin" },
  { key: "admin.userList", de: "Benutzerliste", it: "Elenco Utenti", category: "admin" },
  { key: "admin.roles", de: "Rollen", it: "Ruoli", category: "admin" },
  { key: "admin.role", de: "Rolle", it: "Ruolo", category: "admin" },
  { key: "admin.admin", de: "Admin", it: "Amministratore", category: "admin" },
  { key: "admin.coordinator", de: "Koordinator", it: "Coordinatore", category: "admin" },
  { key: "admin.physician", de: "Arzt", it: "Medico", category: "admin" },
  { key: "admin.nurse", de: "Pflege", it: "Infermiere", category: "admin" },
  { key: "admin.patient", de: "Patient", it: "Paziente", category: "admin" },
  { key: "admin.caregiver", de: "Angehöriger", it: "Caregiver", category: "admin" },
  { key: "admin.dialysisStaff", de: "Dialyse-Personal", it: "Personale Dialisi", category: "admin" },
  { key: "admin.active", de: "Aktiv", it: "Attivo", category: "admin" },
  { key: "admin.inactive", de: "Inaktiv", it: "Inattivo", category: "admin" },
  { key: "admin.lastLogin", de: "Letzter Login", it: "Ultimo Accesso", category: "admin" },
  { key: "admin.twoFactorEnabled", de: "2FA aktiviert", it: "2FA Attivato", category: "admin" },
  { key: "admin.settings", de: "System-Einstellungen", it: "Impostazioni di Sistema", category: "admin" },
  { key: "admin.auditLog", de: "Audit Log", it: "Log di Audit", category: "admin" },
  { key: "admin.statistics", de: "Statistiken", it: "Statistiche", category: "admin" },

  // === SETTINGS ===
  { key: "settings.title", de: "Einstellungen", it: "Impostazioni", category: "settings" },
  { key: "settings.save", de: "Einstellungen speichern", it: "Salva Impostazioni", category: "settings" },
  { key: "settings.email", de: "E-Mail-Einstellungen", it: "Impostazioni Email", category: "settings" },
  { key: "settings.smtp", de: "SMTP-Konfiguration", it: "Configurazione SMTP", category: "settings" },
  { key: "settings.notifications", de: "Benachrichtigungen", it: "Notifiche", category: "settings" },
  { key: "settings.security", de: "Sicherheit", it: "Sicurezza", category: "settings" },
  { key: "settings.language", de: "Sprache", it: "Lingua", category: "settings" },
  { key: "settings.testEmail", de: "Test-E-Mail senden", it: "Invia Email di Test", category: "settings" },

  // === ERRORS ===
  { key: "error.generic", de: "Ein Fehler ist aufgetreten", it: "Si è verificato un errore", category: "errors" },
  { key: "error.network", de: "Netzwerkfehler", it: "Errore di Rete", category: "errors" },
  { key: "error.notFound", de: "Nicht gefunden", it: "Non Trovato", category: "errors" },
  { key: "error.unauthorized", de: "Nicht autorisiert", it: "Non Autorizzato", category: "errors" },
  { key: "error.forbidden", de: "Zugriff verweigert", it: "Accesso Negato", category: "errors" },
  { key: "error.required", de: "Dieses Feld ist erforderlich", it: "Questo campo è obbligatorio", category: "errors" },
  { key: "error.invalidEmail", de: "Ungültige E-Mail-Adresse", it: "Indirizzo Email non valido", category: "errors" },

  // === SUCCESS ===
  { key: "success.saved", de: "Gespeichert", it: "Salvato", category: "success" },
  { key: "success.created", de: "Erstellt", it: "Creato", category: "success" },
  { key: "success.updated", de: "Aktualisiert", it: "Aggiornato", category: "success" },
  { key: "success.deleted", de: "Gelöscht", it: "Eliminato", category: "success" },

  // === LOADING ===
  { key: "loading.title", de: "Laden...", it: "Caricamento...", category: "loading" },
  { key: "loading.patient", de: "Patientendaten werden geladen...", it: "Caricamento dati paziente...", category: "loading" },

  // === COMMON ===
  { key: "common.yes", de: "Ja", it: "Sì", category: "common" },
  { key: "common.no", de: "Nein", it: "No", category: "common" },
  { key: "common.ok", de: "OK", it: "OK", category: "common" },
  { key: "common.close", de: "Schließen", it: "Chiudi", category: "common" },
  { key: "common.confirm", de: "Bestätigen", it: "Conferma", category: "common" },
  { key: "common.submit", de: "Absenden", it: "Invia", category: "common" },
  { key: "common.next", de: "Weiter", it: "Avanti", category: "common" },
  { key: "common.previous", de: "Zurück", it: "Indietro", category: "common" },
  { key: "common.none", de: "— Keiner —", it: "— Nessuno —", category: "common" },
  { key: "common.select", de: "Bitte wählen...", it: "Seleziona...", category: "common" },
  { key: "common.email", de: "E-Mail", it: "Email", category: "common" },
  { key: "common.phone", de: "Telefon", it: "Telefono", category: "common" },
  { key: "common.address", de: "Adresse", it: "Indirizzo", category: "common" },
  { key: "common.city", de: "Stadt", it: "Città", category: "common" },
  { key: "common.notes", de: "Notizen", it: "Note", category: "common" },
  { key: "common.date", de: "Datum", it: "Data", category: "common" },
  { key: "common.time", de: "Zeit", it: "Ora", category: "common" },
  { key: "common.status", de: "Status", it: "Stato", category: "common" },
  { key: "common.type", de: "Typ", it: "Tipo", category: "common" },
  { key: "common.name", de: "Name", it: "Nome", category: "common" },
  { key: "common.description", de: "Beschreibung", it: "Descrizione", category: "common" },

  // === SIDEBAR ===
  { key: "sidebar.patients", de: "Patienten", it: "Pazienti", category: "sidebar" },
  { key: "sidebar.overview", de: "Übersicht", it: "Panoramica", category: "sidebar" },
  { key: "sidebar.clinic", de: "Klinik", it: "Clinica", category: "sidebar" },
  { key: "sidebar.documents", de: "Dokumente", it: "Documenti", category: "sidebar" },
  { key: "sidebar.appointments", de: "Termine", it: "Appuntamenti", category: "sidebar" },
  { key: "sidebar.requirements", de: "Untersuchungen", it: "Esami", category: "sidebar" },
  { key: "sidebar.messages", de: "Nachrichten", it: "Messaggi", category: "sidebar" },
  { key: "sidebar.admin", de: "Administration", it: "Amministrazione", category: "sidebar" },
  { key: "sidebar.users", de: "Benutzer", it: "Utenti", category: "sidebar" },
  { key: "sidebar.systemSettings", de: "System-Einstellungen", it: "Impostazioni di Sistema", category: "sidebar" },
  { key: "sidebar.auditLog", de: "Audit Log", it: "Log di Audit", category: "sidebar" },
  { key: "sidebar.statistics", de: "Statistiken", it: "Statistiche", category: "sidebar" },

  // === PATIENT PAGE ===
  { key: "patient.searchPlaceholder", de: "Name oder E-Mail suchen...", it: "Cerca per nome o email...", category: "patient" },
  { key: "patient.noPatients", de: "Keine Patienten gefunden", it: "Nessun paziente trovato", category: "patient" },
  { key: "patient.noPatientsDesc", de: "Passen Sie Ihre Suche an oder fügen Sie einen Patienten hinzu.", it: "Modifica la ricerca o aggiungi un paziente.", category: "patient" },
  { key: "patient.contact", de: "Kontakt", it: "Contatto", category: "patient" },
  { key: "patient.actions", de: "Aktionen", it: "Azioni", category: "patient" },
  { key: "patient.details", de: "Details", it: "Dettagli", category: "patient" },
  { key: "patient.createTitle", de: "Neuer Patient", it: "Nuovo Paziente", category: "patient" },
  { key: "patient.editTitle", de: "Patient bearbeiten", it: "Modifica Paziente", category: "patient" },
  { key: "patient.deleteTitle", de: "Patient löschen", it: "Elimina Paziente", category: "patient" },
  { key: "patient.deleteConfirm", de: "Alle zugehörigen Daten werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.", it: "Tutti i dati correlati verranno eliminati. Questa azione non può essere annullata.", category: "patient" },
  { key: "patient.bulkDeleteTitle", de: "Massenlöschung", it: "Eliminazione di massa", category: "patient" },
  { key: "patient.bulkUpdateTitle", de: "Patienten bearbeiten", it: "Modifica pazienti", category: "patient" },
  { key: "patient.bulkUpdateHint", de: "Änderungen werden auf alle ausgewählten Patienten angewendet. Leere Felder werden ignoriert.", it: "Le modifiche verranno applicate a tutti i pazienti selezionati. I campi vuoti verranno ignorati.", category: "patient" },
  { key: "patient.caseStatus", de: "Fall-Status", it: "Stato del caso", category: "patient" },
  { key: "patient.assignCoordinator", de: "Koordinator zuweisen", it: "Assegna coordinatore", category: "patient" },
  { key: "patient.note", de: "Notiz", it: "Nota", category: "patient" },
  { key: "patient.notePlaceholder", de: "z.B. Wartezeit verkürzt, Priorität erhöht...", it: "es. riduzione tempo di attesa, priorità aumentata...", category: "patient" },
  { key: "patient.createUserAccount", de: "Login für Patienten-Portal", it: "Accesso al portale paziente", category: "patient" },
  { key: "patient.userAccountCheckbox", de: "User-Account erstellen", it: "Crea account utente", category: "patient" },
  { key: "patient.userEmail", de: "E-Mail für Login", it: "Email per l'accesso", category: "patient" },
  { key: "patient.passwordGenerated", de: "Wird automatisch generiert...", it: "Verrà generato automaticamente...", category: "patient" },
  { key: "patient.userCreated", de: "User-Account erstellt!", it: "Account utente creato!", category: "patient" },
  { key: "patient.loginCredentials", de: "E-Mail mit Zugangsdaten wurde an", it: "Email con credenziali inviata a", category: "patient" },
  { key: "patient.assignedRequirements", de: "Untersuchungen zugewiesen", it: "Esami assegnati", category: "patient" },
  { key: "patient.houseDoctor", de: "Hausarzt", it: "Medico di famiglia", category: "patient" },
  { key: "patient.stammdaten", de: "Patientenstammdaten", it: "Dati anagrafici paziente", category: "patient" },
  { key: "patient.saved", de: "Gespeichert", it: "Salvato", category: "patient" },

  // === EDIT PAGE ===
  { key: "edit.backToDetail", de: "Zurück zur Detailseite", it: "Torna ai dettagli", category: "edit" },
  { key: "edit.personalData", de: "Persönliche Daten", it: "Dati personali", category: "edit" },
  { key: "edit.contactData", de: "Kontaktdaten", it: "Dati di contatto", category: "edit" },
  { key: "edit.clinicTransplant", de: "Klinik & Transplantation", it: "Clinica e trapianto", category: "edit" },
  { key: "edit.gp", de: "Hausarzt", it: "Medico di famiglia", category: "edit" },
  { key: "edit.save", de: "Speichern", it: "Salva", category: "edit" },
  { key: "edit.cancel", de: "Abbrechen", it: "Annulla", category: "edit" },
  { key: "edit.saving", de: "Speichern...", it: "Salvataggio...", category: "edit" },
  { key: "edit.required", de: "Dieses Feld ist erforderlich", it: "Questo campo è obbligatorio", category: "edit" },

  // === CASE STATUS ===
  { key: "case.referral", de: "Überweisung", it: "Invio", category: "case" },
  { key: "case.evaluation", de: "Evaluierung", it: "Valutazione", category: "case" },
  { key: "case.approved", de: "Genehmigt", it: "Approvato", category: "case" },
  { key: "case.readyForReview", de: "Zur Prüfung", it: "In revisione", category: "case" },
  { key: "case.listed", de: "Gelistet", it: "In lista", category: "case" },
  { key: "case.transplanted", de: "Transplantiert", it: "Trapiantato", category: "case" },
  { key: "case.closed", de: "Geschlossen", it: "Chiuso", category: "case" },
  { key: "case.inactive", de: "Inaktiv", it: "Inattivo", category: "case" },

  // === CONSENT ===
  { key: "consent.none", de: "— Keiner —", it: "— Nessuno —", category: "consent" },

  // === INLINE EDIT ===
  { key: "inline.save", de: "Speichern", it: "Salva", category: "inline" },
  { key: "inline.cancel", de: "Abbrechen", it: "Annulla", category: "inline" },
  { key: "inline.editTooltip", de: "Klicken zum Bearbeiten", it: "Clicca per modificare", category: "inline" },
  { key: "inline.saveFailed", de: "Speichern fehlgeschlagen", it: "Salvataggio fallito", category: "inline" },

  // === LANGUAGE ===
  { key: "lang.german", de: "Deutsch", it: "Tedesco", category: "language" },
  { key: "lang.english", de: "English", it: "Inglese", category: "language" },
  { key: "lang.turkish", de: "Türkçe", it: "Turco", category: "language" },
  { key: "lang.arabic", de: "العربية", it: "Arabo", category: "language" },
  { key: "lang.italian", de: "Italiano", it: "Italiano", category: "language" },

  // === GP ===
  { key: "gp.title", de: "Hausarzt", it: "Medico di medicina generale", category: "gp" },
  { key: "gp.name", de: "Name", it: "Nome", category: "gp" },
  { key: "gp.city", de: "Stadt", it: "Città", category: "gp" },
  { key: "gp.email", de: "E-Mail", it: "Email", category: "gp" },
  { key: "gp.phone", de: "Telefon", it: "Telefono", category: "gp" },
  { key: "gp.address", de: "Adresse", it: "Indirizzo", category: "gp" },

  // === TRANSPLANT TYPES ===
  { key: "transplant.none", de: "— Keiner —", it: "— Nessuno —", category: "transplant" },

  // === GENERAL ===
  { key: "general.loading", de: "Laden...", it: "Caricamento...", category: "general" },
  { key: "general.error", de: "Ein Fehler ist aufgetreten", it: "Si è verificato un errore", category: "general" },
  { key: "general.networkError", de: "Netzwerkfehler", it: "Errore di rete", category: "general" },
  { key: "general.delete", de: "Löschen", it: "Elimina", category: "general" },
  { key: "general.edit", de: "Bearbeiten", it: "Modifica", category: "general" },
  { key: "general.create", de: "Erstellen", it: "Crea", category: "general" },
  { key: "general.save", de: "Speichern", it: "Salva", category: "general" },
  { key: "general.cancel", de: "Abbrechen", it: "Annulla", category: "general" },
  { key: "general.search", de: "Suchen", it: "Cerca", category: "general" },
  { key: "general.select", de: "Bitte wählen...", it: "Seleziona...", category: "general" },
  { key: "general.none", de: "—", it: "—", category: "general" },
  { key: "general.backToOverview", de: "Zurück zur Übersicht", it: "Torna alla panoramica", category: "general" },
  { key: "general.year", de: "Jahre", it: "anni", category: "general" },

  // === ORGANIZATION ===
  { key: "org.none", de: "— Keine —", it: "— Nessuna —", category: "org" },

  // === NEW DOCUMENTS / BLOCKERS / APPOINTMENTS ===
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

  // === LEGAL / IMPRESSUM ===
  { key: "legal.impressumTitle", de: "Impressum", it: "Impressum", category: "legal" },
  { key: "legal.tmgInfo", de: "Angaben gemäß § 5 TMG", it: "Informazioni ai sensi del § 5 TMG", category: "legal" },
  { key: "legal.companyName", de: "NephroAssist GmbH", it: "NephroAssist GmbH", category: "legal" },
  { key: "legal.contact", de: "Kontakt", it: "Contatto", category: "legal" },
  { key: "legal.phone", de: "Telefon", it: "Telefono", category: "legal" },
  { key: "legal.representedBy", de: "Vertreten durch", it: "Rappresentato da", category: "legal" },
  { key: "legal.ceo", de: "Geschäftsführer", it: "Amministratore Delegato", category: "legal" },
  { key: "legal.commercialRegister", de: "Handelsregister", it: "Registro delle Imprese", category: "legal" },
  { key: "legal.registerCourt", de: "Registergericht", it: "Tribunale di Registro", category: "legal" },
  { key: "legal.registerNumber", de: "Registernummer", it: "Numero di Registro", category: "legal" },
  { key: "legal.vatId", de: "Umsatzsteuer-ID", it: "Partita IVA", category: "legal" },
  { key: "legal.vatIdText", de: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz", it: "Partita IVA ai sensi del § 27 a UStG", category: "legal" },
  { key: "legal.disputeResolution", de: "Streitbeilegung", it: "Risoluzione delle Controversie", category: "legal" },
  { key: "legal.disputeText", de: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.", it: "La Commissione Europea fornisce una piattaforma per la risoluzione delle controversie online (ODR). Non siamo obbligati né disposti a partecipare a una procedura di risoluzione delle controversie presso un organismo di conciliazione dei consumatori.", category: "legal" },
  { key: "legal.liabilityContent", de: "Haftung für Inhalte", it: "Responsabilità per i Contenuti", category: "legal" },
  { key: "legal.liabilityContentText", de: "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.", it: "In qualità di fornitore di servizi, ai sensi del § 7 comma 1 TMG siamo responsabili dei nostri contenuti su queste pagine secondo le leggi generali. Ai sensi dei §§ 8-10 TMG, in qualità di fornitore di servizi non siamo obbligati a monitorare le informazioni trasmesse o memorizzate o a indagare su circostanze che indichino unattività illegale.", category: "legal" },
  { key: "legal.placeholderNotice", de: "Dieses Impressum dient als Platzhalter. Die Angaben können vom Betreiber jederzeit aktualisiert werden.", it: "Questo Impressum è un segnaposto. Le informazioni possono essere aggiornate in qualsiasi momento dall'operatore.", category: "legal" },

  // === LEGAL / PRIVACY POLICY ===
  { key: "legal.privacyPolicyTitle", de: "Datenschutzerklärung", it: "Informativa sulla Privacy", category: "legal" },
  { key: "legal.effectiveDate", de: "Stand", it: "Data", category: "legal" },
  { key: "legal.responsible", de: "Verantwortlicher", it: "Responsabile", category: "legal" },
  { key: "legal.responsibleText", de: "Verantwortlich für die Datenverarbeitung auf dieser Plattform ist", it: "Responsabile del trattamento dei dati su questa piattaforma è", category: "legal" },
  { key: "legal.purposes", de: "Zwecke der Datenverarbeitung", it: "Finalità del Trattamento dei Dati", category: "legal" },
  { key: "legal.purposeList1", de: "Bereitstellung und Betrieb der NephroAssist-Plattform", it: "Fornitura e gestione della piattaforma NephroAssist", category: "legal" },
  { key: "legal.purposeList2", de: "Patienten-Onboarding und Koordination von Transplantationsprozessen", it: "Onboarding dei pazienti e coordinamento dei processi di trapianto", category: "legal" },
  { key: "legal.purposeList3", de: "Benachrichtigungen zu Terminen, Aufgaben und Untersuchungen", it: "Notifiche su appuntamenti, attività ed esami", category: "legal" },
  { key: "legal.purposeList4", de: "Sicherstellung der Authentifizierung und Autorisierung", it: "Garanzia dell'autenticazione e dell'autorizzazione", category: "legal" },
  { key: "legal.purposeList5", de: "Erfüllung rechtlicher Aufbewahrungspflichten", it: "Adempimento degli obblighi di conservazione legale", category: "legal" },
  { key: "legal.legalBasis", de: "Rechtsgrundlagen", it: "Basi Giuridiche", category: "legal" },
  { key: "legal.legalBasisText", de: "Die Verarbeitung erfolgt auf Grundlage folgender Rechtsgrundlagen", it: "Il trattamento avviene sulla base delle seguenti basi giuridiche", category: "legal" },
  { key: "legal.legalBasis1", de: "Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)", it: "Art. 6 comma 1 lett. b GDPR (Esecuzione del contratto)", category: "legal" },
  { key: "legal.legalBasis2", de: "Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)", it: "Art. 6 comma 1 lett. c GDPR (Obbligo legale)", category: "legal" },
  { key: "legal.legalBasis3", de: "Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)", it: "Art. 6 comma 1 lett. f GDPR (Interesse legittimo)", category: "legal" },
  { key: "legal.legalBasis4", de: "Art. 9 Abs. 2 lit. h DSGVO (Gesundheitsdaten im Gesundheitswesen)", it: "Art. 9 comma 2 lett. h GDPR (Dati sanitari nel settore sanitario)", category: "legal" },
  { key: "legal.recipients", de: "Empfänger von Daten", it: "Destinatari dei Dati", category: "legal" },
  { key: "legal.recipientsText", de: "Daten werden nur an die für die Behandlung zuständigen Mitarbeiter der jeweiligen Klinik weitergegeben. Externe Dienstleister werden nur unter Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO eingesetzt.", it: "I dati sono trasmessi solo ai dipendenti della rispettiva clinica responsabili del trattamento. I fornitori di servizi esterni sono utilizzati solo in base a un contratto di trattamento ai sensi dell'art. 28 GDPR.", category: "legal" },
  { key: "legal.thirdCountries", de: "Datenübermittlung in Drittländer", it: "Trasferimento di Dati verso Paesi Terzi", category: "legal" },
  { key: "legal.thirdCountriesText", de: "Eine Übermittlung personenbezogener Daten in Länder außerhalb des EWR erfolgt nur, soweit dies erforderlich ist und angemessene Garantien im Sinne des Art. 44 ff. DSGVO vorliegen.", it: "Il trasferimento di dati personali verso paesi al di fuori dello Spazio Economico Europeo avviene solo se necessario e in presenza di garanzie adeguate ai sensi degli artt. 44 ss. GDPR.", category: "legal" },
  { key: "legal.retention", de: "Speicherdauer", it: "Durata della Conservazione", category: "legal" },
  { key: "legal.retentionText", de: "Personenbezogene Daten werden nur so lange gespeichert, wie dies für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen. Anmeldedaten werden gelöscht, sobald das Konto geschlossen wird, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.", it: "I dati personali sono conservati solo per il tempo necessario allo scopo previsto o previsto dalla legge. I dati di accesso vengono eliminati alla chiusura dell'account, salvo obblighi di conservazione legale.", category: "legal" },
  { key: "legal.rightsTitle", de: "Betroffenenrechte", it: "Diritti degli Interessati", category: "legal" },
  { key: "legal.rightsList1", de: "Recht auf Auskunft (Art. 15 DSGVO)", it: "Diritto di accesso (art. 15 GDPR)", category: "legal" },
  { key: "legal.rightsList2", de: "Recht auf Berichtigung (Art. 16 DSGVO)", it: "Diritto di rettifica (art. 16 GDPR)", category: "legal" },
  { key: "legal.rightsList3", de: "Recht auf Löschung (Art. 17 DSGVO)", it: "Diritto alla cancellazione (art. 17 GDPR)", category: "legal" },
  { key: "legal.rightsList4", de: "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)", it: "Diritto di limitazione del trattamento (art. 18 GDPR)", category: "legal" },
  { key: "legal.rightsList5", de: "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)", it: "Diritto alla portabilità dei dati (art. 20 GDPR)", category: "legal" },
  { key: "legal.rightsList6", de: "Widerspruchsrecht (Art. 21 DSGVO)", it: "Diritto di opposizione (art. 21 GDPR)", category: "legal" },
  { key: "legal.rightsContact", de: "Zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter", it: "Per esercitare i tuoi diritti, contattaci a", category: "legal" },
  { key: "legal.complaintRight", de: "Beschwerderecht", it: "Diritto di Reclamo", category: "legal" },
  { key: "legal.complaintText", de: "Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.", it: "Hai il diritto di presentare reclamo a un'autorità di controllo della protezione dei dati per il trattamento dei tuoi dati personali.", category: "legal" },
  { key: "legal.securityTitle", de: "Sicherheitsmaßnahmen", it: "Misure di Sicurezza", category: "legal" },
  { key: "legal.securityText", de: "Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Dazu gehören Verschlüsselung im Transit und bei der Speicherung, Zugriffskontrollen sowie regelmäßige Sicherheitsüberprüfungen.", it: "Adottiamo adeguate misure tecniche e organizzative per proteggere i tuoi dati da perdite, abusi e accessi non autorizzati. Ciò include la crittografia in transito e in archiviazione, i controlli di accesso e le verifiche di sicurezza regolari.", category: "legal" },
  { key: "legal.privacyChangeNotice", de: "Diese Datenschutzerklärung kann sich ändern. Die jeweils aktuelle Version ist auf dieser Seite einsehbar.", it: "La presente informativa sulla privacy può essere modificata. L'ultima versione è disponibile su questa pagina.", category: "legal" },

  // === LEGAL / TERMS OF SERVICE ===
  { key: "legal.termsTitle", de: "Allgemeine Geschäftsbedingungen (AGB)", it: "Termini e Condizioni Generali", category: "legal" },
  { key: "legal.scope", de: "Geltungsbereich", it: "Campo di Applicazione", category: "legal" },
  { key: "legal.scopeText", de: "Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Software NephroAssist, betrieben von der NephroAssist GmbH. Die Plattform unterstützt medizinische Einrichtungen bei der Koordination von Nierentransplantationsprozessen.", it: "I presenti Termini e Condizioni Generali si applicano all'uso del software NephroAssist, gestito da NephroAssist GmbH. La piattaforma supporta le strutture mediche nel coordinamento dei processi di trapianto renale.", category: "legal" },
  { key: "legal.subject", de: "Vertragsgegenstand", it: "Oggetto del Contratto", category: "legal" },
  { key: "legal.subjectText", de: "Der Anbieter stellt dem Nutzer eine cloudbasierte Softwarelösung zur Verfügung, die folgende Funktionen umfasst", it: "Il fornitore mette a disposizione dell'utente una soluzione software basata sul cloud che include le seguenti funzionalità", category: "legal" },
  { key: "legal.subjectList1", de: "Patienten-Onboarding und Statusverfolgung", it: "Onboarding dei pazienti e monitoraggio dello stato", category: "legal" },
  { key: "legal.subjectList2", de: "Verwaltung von Untersuchungsanforderungen und Dokumenten", it: "Gestione delle richieste di esame e dei documenti", category: "legal" },
  { key: "legal.subjectList3", de: "Kommunikation zwischen Patienten und Klinikpersonal", it: "Comunicazione tra pazienti e personale clinico", category: "legal" },
  { key: "legal.subjectList4", de: "Termin- und Aufgabenmanagement", it: "Gestione di appuntamenti e attività", category: "legal" },
  { key: "legal.eligibility", de: "Nutzungsberechtigung", it: "Idoneità all'Uso", category: "legal" },
  { key: "legal.eligibilityText", de: "Die Nutzung der Plattform ist nur nach erfolgreicher Registrierung und Bestätigung der E-Mail-Adresse möglich. Jeder Nutzer ist für die Sicherheit seiner Zugangsdaten selbst verantwortlich. Die Weitergabe von Zugangsdaten an Dritte ist untersagt.", it: "L'uso della piattaforma è possibile solo dopo una registrazione riuscita e la conferma dell'indirizzo email. Ogni utente è responsabile della sicurezza delle proprie credenziali di accesso. La condivisione delle credenziali con terzi è vietata.", category: "legal" },
  { key: "legal.dataProtection", de: "Datenschutz und Datensicherheit", it: "Protezione dei Dati e Sicurezza", category: "legal" },
  { key: "legal.dataProtectionText", de: "Der Anbieter verpflichtet sich, die geltenden datenschutzrechtlichen Bestimmungen (DSGVO, BDSG) einzuhalten. Gesundheitsdaten werden gemäß den Anforderungen an besondere Kategorien personenbezogener Daten verarbeitet.", it: "Il fornitore si impegna a rispettare le disposizioni vigenti in materia di protezione dei dati (GDPR, BDSG). I dati sanitari sono trattati in conformità con i requisiti per le categorie speciali di dati personali.", category: "legal" },
  { key: "legal.liability", de: "Haftungsausschluss und Gewährleistung", it: "Esclusione di Responsabilità e Garanzia", category: "legal" },
  { key: "legal.liabilityText", de: "Die Plattform dient der Unterstützung, nicht der Ersetzung ärztlicher Entscheidungen. Der Anbieter haftet nicht für medizinische Fehlentscheidungen, die auf der Nutzung der Software beruhen.", it: "La piattaforma è uno strumento di supporto, non sostituisce le decisioni mediche. Il fornitore non è responsabile per decisioni mediche errate basate sull'uso del software.", category: "legal" },
  { key: "legal.duration", de: "Vertragslaufzeit und Kündigung", it: "Durata del Contratto e Risoluzione", category: "legal" },
  { key: "legal.durationText", de: "Der Vertrag läuft auf unbestimmte Zeit. Beide Parteien können den Vertrag mit einer Frist von 30 Tagen zum Monatsende kündigen. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.", it: "Il contratto ha durata indeterminata. Entrambe le parti possono risolvere il contratto con un preavviso di 30 giorni alla fine del mese. Il diritto di risoluzione straordinaria per giusta causa resta salvo.", category: "legal" },
  { key: "legal.changes", de: "Änderungen der AGB", it: "Modifiche ai Termini e Condizioni", category: "legal" },
  { key: "legal.changesText", de: "Änderungen dieser AGB werden dem Nutzer mindestens 30 Tage vor Inkrafttreten schriftlich oder per E-Mail mitgeteilt. Stimmt der Nutzer den geänderten Bedingungen nicht zu, kann er den Vertrag fristgerecht kündigen.", it: "Le modifiche ai presenti Termini e Condizioni saranno comunicate all'utente almeno 30 giorni prima della loro entrata in vigore per iscritto o via email. Se l'utente non accetta le condizioni modificate, può risolvere il contratto nel rispetto dei termini di preavviso.", category: "legal" },
  { key: "legal.finalProvisions", de: "Schlussbestimmungen", it: "Disposizioni Finali", category: "legal" },
  { key: "legal.finalProvisionsText", de: "Soweit einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sind, bleibt der Rest des Vertrages wirksam. Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.", it: "Nel caso in cui singole disposizioni dei presenti Termini e Condizioni siano totalmente o parzialmente inefficaci, il resto del contratto resta valido. Si applica la legge della Repubblica Federale di Germania, con esclusione della Convenzione delle Nazioni Unite sulla vendita internazionale di merci.", category: "legal" },
  { key: "legal.termsContact", de: "Bei Fragen zu diesen AGB erreichen Sie uns unter", it: "Per domande sui presenti Termini e Condizioni, contattaci a", category: "legal" },
];

/* POST /api/translations/seed */
export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    let created = 0;
    let updated = 0;

    for (const item of TRANSLATIONS) {
      // German
      const de = await prisma.translation.upsert({
        where: { key_language: { key: item.key, language: "de" } },
        create: { key: item.key, language: "de", value: item.de, category: item.category },
        update: { value: item.de, category: item.category },
      });
      if (de.createdAt.getTime() === de.updatedAt.getTime()) created++; else updated++;

      // Italian
      const it = await prisma.translation.upsert({
        where: { key_language: { key: item.key, language: "it" } },
        create: { key: item.key, language: "it", value: item.it, category: item.category },
        update: { value: item.it, category: item.category },
      });
      if (it.createdAt.getTime() === it.updatedAt.getTime()) created++; else updated++;
    }

    return NextResponse.json({ success: true, created, updated, total: TRANSLATIONS.length * 2 });
  } catch (error) {
    console.error("Translations seed error:", error);
    return NextResponse.json({ error: "Fehler beim Seed" }, { status: 500 });
  }
}
