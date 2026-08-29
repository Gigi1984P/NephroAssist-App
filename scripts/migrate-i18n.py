#!/usr/bin/env python3
"""
Auto-migrate German strings to useTranslation in NephroAssist.
"""
import os
import re
import sys

BASE = '/opt/data/projects/nephroassist/src'

# Read existing translations
with open(f'{BASE}/app/api/translations/seed/route.ts', 'r', encoding='utf-8') as f:
    seed = f.read()

existing = {}
cur_key = None
for line in seed.split('\n'):
    m = re.search(r'\{ key: "([^"]+)"', line)
    if m:
        cur_key = m.group(1)
    de_match = re.search(r'de: "([^"]+)"', line)
    if de_match and cur_key:
        existing[de_match.group(1)] = cur_key

print(f"Loaded {len(existing)} existing translations")

# Common German UI strings and their keys
COMMON_MAP = {
    'Dashboard': 'nav.dashboard',
    'Patienten': 'nav.patients',
    'Einstellungen': 'nav.settings',
    'Administration': 'nav.admin',
    'Untersuchungen': 'sidebar.requirements',
    'Dokumente': 'sidebar.documents',
    'Termine': 'sidebar.appointments',
    'Benutzer': 'admin.users',
    'Audit Log': 'sidebar.auditLog',
    'Statistiken': 'sidebar.statistics',
    'Speichern': 'nav.save',
    'Abbrechen': 'nav.cancel',
    'Bearbeiten': 'nav.edit',
    'Löschen': 'nav.delete',
    'Erstellen': 'nav.create',
    'Suchen': 'nav.search',
    'Filtern': 'nav.filter',
    'Aktionen': 'nav.actions',
    'Profil': 'nav.settings',
    'Passwort': 'auth.password',
    'Name': 'common.name',
    'E-Mail': 'common.email',
    'Telefon': 'common.phone',
    'Adresse': 'common.address',
    'Stadt': 'common.city',
    'Notizen': 'common.notes',
    'Datum': 'common.date',
    'Status': 'common.status',
    'Typ': 'common.type',
    'Beschreibung': 'common.description',
    'Ja': 'common.yes',
    'Nein': 'common.no',
    'OK': 'common.ok',
    'Schließen': 'common.close',
    'Bestätigen': 'common.confirm',
    'Absenden': 'common.submit',
    'Weiter': 'common.next',
    'Zurück': 'nav.back',
    'Keiner': 'common.none',
    'Keine': 'common.none',
    'Bitte wählen...': 'common.select',
    'Laden...': 'loading.title',
    'Patientendaten werden geladen...': 'loading.patient',
    'Ein Fehler ist aufgetreten': 'error.generic',
    'Netzwerkfehler': 'error.network',
    'Nicht gefunden': 'error.notFound',
    'Nicht autorisiert': 'error.unauthorized',
    'Zugriff verweigert': 'error.forbidden',
    'Gespeichert': 'success.saved',
    'Erstellt': 'success.created',
    'Aktualisiert': 'success.updated',
    'Gelöscht': 'success.deleted',
    'Anmelden': 'auth.login',
    'Abmelden': 'auth.logout',
    'E-Mail-Adresse': 'auth.email',
    'Passwort vergessen?': 'auth.forgotPassword',
    'Registrieren': 'auth.register',
    'Admin': 'admin.admin',
    'Koordinator': 'admin.coordinator',
    'Arzt': 'admin.physician',
    'Pflege': 'admin.nurse',
    'Patient': 'admin.patient',
    'Angehöriger': 'admin.caregiver',
    'Dialyse-Personal': 'admin.dialysisStaff',
    'Aktiv': 'admin.active',
    'Inaktiv': 'admin.inactive',
    'Letzter Login': 'admin.lastLogin',
    'System-Einstellungen': 'admin.settings',
    'NephroAssist': 'app.title',
}

def get_key(text):
    """Get translation key for a German string."""
    text = text.strip()
    if text in existing:
        return existing[text]
    if text in COMMON_MAP:
        return COMMON_MAP[text]
    # Generate a key from the text
    key = re.sub(r'[^\w\s]', '', text.lower())
    key = re.sub(r'\s+', '.', key).strip('.')
    if len(key) > 50:
        key = key[:50]
    return key

def should_translate(text):
    """Determine if a text node should be translated."""
    text = text.strip()
    if len(text) < 2:
        return False
    # Skip CSS classes, IDs, etc.
    if text.startswith('.') or text.startswith('#') or text.startswith('bg-'):
        return False
    if text in ['true', 'false', 'null', 'undefined', 'div', 'span', 'className', 'style', 'src', 'href']:
        return False
    # Skip if just numbers
    if text.replace('.', '').replace(',', '').replace(' ', '').replace('-', '').isdigit():
        return False
    # Must have some German-specific indicator
    has_german = bool(re.search(r'[äöüßÄÖÜ]', text))
    if not has_german:
        german_words = ['der', 'die', 'das', 'und', 'für', 'von', 'mit', 'ist', 'sind',
            'Speichern', 'Abbrechen', 'Löschen', 'Hinzufügen', 'Bearbeiten',
            'Patienten', 'Einstellungen', 'Untersuchungen', 'Dokumente',
            'Termine', 'Profil', 'Passwort', 'Dashboard', 'Suchen', 'Filtern',
            'Aktionen', 'Details', 'Erstellen', 'Hochladen', 'Prüfen', 'Freigabe',
            'Blocker', 'Warnung', 'Fehler', 'Erfolg', 'Gespeichert', 'Gelöscht',
            'Aktualisiert', 'Keine', 'Keiner', 'alle', 'von', 'für', 'mit', 'und', 'oder',
            'Nicht', 'Offen', 'Abgeschlossen', 'Aktiv', 'Inaktiv', 'Anmelden',
            'Abmelden', 'Registrieren', 'Willkommen', 'Benutzer', 'Administration',
            'Audit', 'Statistiken', 'Klinik', 'Arzt', 'Pflege', 'Koordinator',
            'Patient', 'Transplantation', 'Dialyse', 'Labor', 'Medikament',
            'Hausarzt', 'Überweisung', 'Verordnung', 'Bericht', 'Termin',
            'Notizen', 'Beschreibung', 'Name', 'E-Mail', 'Telefon', 'Adresse',
            'Stadt', 'Status', 'Typ', 'Datum', 'Zeit', 'Ort', 'Priorität',
            'Kategorie', 'Verantwortliche', 'Gültigkeit', 'Häufigkeit', 'Dauer',
            'Zielgewicht', 'Ultrafiltration', 'Blutfluss', 'Dialysatfluss',
            'Dialysator', 'Kalium', 'Calcium', 'Natrium', 'Bicarbonat',
            'Antikoagulation', 'Medikamente', 'Überwachung', 'Labor-Kontrollen',
            'Hämodialyse', 'Hämodiafiltration', 'Peritonealdialyse', 'Testtyp',
            'Wert', 'Einheit', 'Referenzbereich', 'Dosierung', 'Darreichungsform',
            'Filename', 'Hochgeladen', 'Neuer', 'Neue', 'Neues', 'Laden',
            'Sitzung', 'läuft', 'reibungslos', 'Bereitstellung', 'Betrieb',
            'Datenverarbeitung', 'Empfänger', 'Dritt', 'Sicherheitsmaßnahmen',
            'Haftungsausschluss', 'Gewährleistung', 'Vertragslaufzeit',
            'Kündigung', 'Änderungen', 'Datenschutz', 'Datensicherheit',
            'Rechte', 'betroffenen', 'Person', 'Verantwortlicher', 'Stand',
            'Angaben', 'gemäß', 'Geltungsbereich', 'Vertragsgegenstand',
            'Pflichten', 'Nutzungsrechte', 'Lizenz', 'Sicherheitsvorkehrungen',
            'Datenübermittlung', 'Hosting', 'E-Mail-Versand', 'Auftragsverarbeitung',
            'DSGVO', 'BDSG', 'Gesundheitsdaten', 'EWR', 'angemessener',
            'Garantien', 'Nutzungsbedingungen', 'verbindlich', 'Nutzer',
            'verpflichtet', 'sorgfältig', 'umgehend', 'melden', 'Sicherheitskopien',
            'regelmäßig', 'Anforderungen', 'gesetzlichen', 'Vorschriften',
            'entsprechen', 'Haftung', 'Schäden', 'verursacht', 'Vorsatz',
            'grober', 'Fahrlässigkeit', 'unvorhersehbarer', 'Schäden',
            'Vertrag', 'unbefristet', 'Kündigungsfrist', 'Tage', 'schriftlich',
            'Wirksamkeit', 'Mitteilung', 'Email', 'Website', 'Unwirksamkeit',
            'einzelner', 'Bestimmungen', 'Rechtswahl', 'Gerichtsstand',
            'Berlin', 'Recht', 'Bundesrepublik', 'Deutschland', 'Kontakt',
            'Impressum', 'AGB', 'geschützt', 'gesetzlichen', 'Vervielfältigung',
            'Verarbeitung', 'Verbreitung', 'vorbehaltlich', 'Zustimmung',
            'untersagt', 'Nutzung', 'Inhalte', 'Dritte', 'gestattet',
            'schriftlicher', 'Genehmigung', 'Urheberrechte', 'Dritten',
            'geschützt', 'Markenrechte', 'Verstoß', 'rechtliche', 'Schritte',
            'vorbehalten', 'Haftung', 'Inhalte', 'externer', 'Links',
            'Verantwortung', 'Betreiber', 'jeweiligen', 'Seiten', 'Nutzung',
            'eigenes', 'Risiko', 'Richtigkeit', 'Vollständigkeit', 'Aktualität',
            'Inhalte', 'Haftung', 'Schäden', 'Nutzung', 'möglich', 'Nutzer',
            'Inhalte', 'eigenen', 'Verantwortung', 'Nutzer', 'verpflichtet',
            'rechtswidrige', 'Inhalte', 'Dritten', 'Rechte', 'Dritter',
            'verletzen', 'Sperrung', 'Zugang', 'vorbehalten', 'Nutzung',
            'entgeltlich', 'kostenlos', 'Nutzungsentgelt', 'fällig', 'Leistung',
            'Umfang', 'Beschreibung', 'Website', 'Nutzungsverhältnis', 'Vertrag',
            'Parteien', 'Widerruf', 'Widerrufsrecht', 'Verbraucher',
            'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate', 'Leistung',
            'Dienstleistung', 'vertrags', 'Verbraucher', 'Widerrufsrecht',
            'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate', 'Leistung',
            'Dienstleistung', 'vertrags', 'Verbraucher', 'Widerrufsrecht',
            'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate', 'Leistung',
            'Dienstleistung', 'vertrags', 'Widerruf', 'Widerrufsrecht',
            'Verbraucher', 'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate',
            'Leistung', 'Dienstleistung', 'vertrags', 'Widerruf', 'Widerrufsrecht',
            'Verbraucher', 'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate',
            'Leistung', 'Dienstleistung', 'vertrags']
        for word in german_words:
            if word in text:
                has_german = True
                break
    return has_german

# Files to process
files_to_process = [
    'app/dashboard/page.tsx',
    'app/dashboard/tasks/page.tsx',
    'app/dashboard/requirements/page.tsx',
    'app/dashboard/documents/page.tsx',
    'app/dashboard/blockers/page.tsx',
    'app/dashboard/appointments/page.tsx',
    'app/dashboard/calendar/page.tsx',
    'app/dashboard/reports/page.tsx',
    'app/dashboard/help-requests/page.tsx',
    'app/dashboard/admin/settings/page.tsx',
    'app/dashboard/admin/reports/page.tsx',
    'app/dashboard/admin/audit/page.tsx',
    'app/dashboard/patients/[id]/page.tsx',
    'app/dashboard/patients/[id]/timeline/page.tsx',
    'app/dashboard/tasks/[id]/page.tsx',
    'app/dashboard/tasks/new/page.tsx',
    'app/dashboard/examinations/templates/page.tsx',
    'components/user-nav.tsx',
    'components/admin-panel.tsx',
    'components/patient-search.tsx',
    'components/document-upload.tsx',
    'components/patient-progress-card.tsx',
    'components/patient-requirements-table.tsx',
    'components/medication-plan.tsx',
    'components/assign-template-set.tsx',
    'components/inline-assign-requirement.tsx',
    'components/patient-comment-box.tsx',
    'components/dialysis-regime.tsx',
    'components/toast-provider.tsx',
    'components/nprogress.tsx',
    'app/register/page.tsx',
    'app/forgot-password/page.tsx',
    'app/reset-password/[token]/page.tsx',
    'app/verify-email/[token]/page.tsx',
    'app/legal/privacy-policy/page.tsx',
    'app/legal/terms-of-service/page.tsx',
    'app/legal/impressum/page.tsx',
    'app/passport/[token]/page.tsx',
    'app/upload/[token]/page.tsx',
]

migrated = 0
skipped = 0
errors = []

for rel_path in files_to_process:
    filepath = os.path.join(BASE, rel_path)
    if not os.path.exists(filepath):
        skipped += 1
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already migrated
    if 'useTranslation' in content:
        skipped += 1
        continue
    
    original = content
    
    # Replace JSX text nodes: >German text<
    def replace_text(match):
        text = match.group(1)
        if should_translate(text):
            key = get_key(text)
            return f'>{{t("{key}", "{text}")}}'
        return match.group(0)
    
    # Simple replacement for text between JSX tags
    # Be careful: don't replace inside JS expressions
    # Pattern: >TEXT< where TEXT is not inside {}
    content = re.sub(r'>([^\n<>{}&]{2,})<', replace_text, content)
    
    # Replace JSX attributes
    for attr in ['title', 'placeholder', 'label', 'alt']:
        def replace_attr(match):
            attr_name = match.group(1)
            text = match.group(2)
            if should_translate(text):
                key = get_key(text)
                return f'{attr_name}={{t("{key}", "{text}")}}'
            return match.group(0)
        pattern = rf'\b({attr})="([^"]+)"'
        content = re.sub(pattern, replace_attr, content)
    
    if content == original:
        skipped += 1
        continue
    
    # Add import
    if '"use client"' in content:
        content = content.replace('"use client";\n', '"use client";\n\nimport { useTranslation } from "@/components/i18n-provider";\n')
    else:
        lines = content.split('\n')
        import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                import_idx = i + 1
        lines.insert(import_idx, 'import { useTranslation } from "@/components/i18n-provider";')
        content = '\n'.join(lines)
    
    # Add const { t } = useTranslation();
    lines = content.split('\n')
    inserted = False
    for i, line in enumerate(lines):
        if re.search(r'^\s*(export\s+(default\s+)?function|const\s+\w+\s*=)', line):
            # Find the opening brace
            for j in range(i+1, min(i+15, len(lines))):
                if '{' in lines[j] and not inserted:
                    # Check if there's already a const declaration
                    if j+1 < len(lines) and 'const' not in lines[j+1]:
                        lines.insert(j+1, '  const { t } = useTranslation();')
                        inserted = True
                        break
            break
    
    if not inserted:
        # Fallback: add after first line with {
        for i, line in enumerate(lines):
            if '{' in line and '}' not in line and not inserted:
                lines.insert(i+1, '  const { t } = useTranslation();')
                inserted = True
                break
    
    content = '\n'.join(lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    migrated += 1
    print(f"✓ Migrated: {rel_path}")

print(f"\n=== SUMMARY ===")
print(f"Migrated: {migrated}")
print(f"Skipped: {skipped}")
if errors:
    print(f"Errors: {len(errors)}")
    for e in errors:
        print(f"  {e}")
