import os
import re
import sys

BASE = '/opt/data/projects/nephroassist/src'

# Translation mapping: German text -> key
# We'll extract from the seed file and build a lookup

# First, read existing translations
existing = {}
with open(f'{BASE}/app/api/translations/seed/route.ts', 'r', encoding='utf-8') as f:
    seed = f.read()

cur_key = None
for line in seed.split('\n'):
    m = re.search(r'\{ key: "([^"]+)"', line)
    if m:
        cur_key = m.group(1)
    de_match = re.search(r'de: "([^"]+)"', line)
    if de_match and cur_key:
        existing[de_match.group(1)] = cur_key

print(f"Loaded {len(existing)} existing translations")

# German words that indicate UI text
german_indicators = ['Speichern', 'Abbrechen', 'Löschen', 'Hinzufügen', 'Bearbeiten',
    'Patienten', 'Einstellungen', 'Untersuchungen', 'Dokumente', 'Termine', 'Profil',
    'Passwort', 'Dashboard', 'Suchen', 'Filtern', 'Aktionen', 'Details', 'Erstellen',
    'Hochladen', 'Prüfen', 'Freigabe', 'Blocker', 'Warnung', 'Fehler', 'Erfolg',
    'Gespeichert', 'Gelöscht', 'Aktualisiert', 'Keine', 'Keiner', 'alle', 'von',
    'für', 'mit', 'und', 'oder', 'Nicht', 'Offen', 'Abgeschlossen', 'Aktiv',
    'Inaktiv', 'Anmelden', 'Abmelden', 'Registrieren', 'Willkommen', 'Benutzer',
    'Administration', 'Audit', 'Statistiken', 'Klinik', 'Arzt', 'Pflege',
    'Koordinator', 'Patient', 'Transplantation', 'Dialyse', 'Labor', 'Medikament',
    'Hausarzt', 'Überweisung', 'Verordnung', 'Bericht', 'Notizen', 'Beschreibung',
    'Name', 'E-Mail', 'Telefon', 'Adresse', 'Stadt', 'Status', 'Typ', 'Datum',
    'Zeit', 'Ort', 'Priorität', 'Kategorie', 'Verantwortliche', 'Gültigkeit',
    'Häufigkeit', 'Dauer', 'Zielgewicht', 'Ultrafiltration', 'Blutfluss',
    'Dialysatfluss', 'Dialysator', 'Kalium', 'Calcium', 'Natrium', 'Bicarbonat',
    'Antikoagulation', 'Medikamente', 'Überwachung', 'Labor-Kontrollen',
    'Notizen', 'Hämodialyse', 'Hämodiafiltration', 'Peritonealdialyse',
    'Testtyp', 'Wert', 'Einheit', 'Referenzbereich', 'Dosierung', 'Darreichungsform',
    'Filename', 'Hochgeladen', 'Neuer', 'Neue', 'Neues', 'Laden', 'Sitzung',
    'läuft', 'reibungslos', 'Bereitstellung', 'Betrieb', 'Datenverarbeitung',
    'Empfänger', 'Dritt', 'Sicherheitsmaßnahmen', 'Haftungsausschluss',
    'Gewährleistung', 'Vertragslaufzeit', 'Kündigung', 'Änderungen',
    'Datenschutz', 'Datensicherheit', 'Rechte', 'betroffenen', 'Person',
    'Verantwortlicher', 'Stand', 'August', 'Angaben', 'gemäß', 'Geltungsbereich',
    'Vertragsgegenstand', 'Pflichten', 'Nutzungsrechte', 'Lizenz',
    'Sicherheitsvorkehrungen', 'Datenübermittlung', 'Hosting', 'E-Mail-Versand',
    'Auftragsverarbeitung', 'DSGVO', 'BDSG', 'Gesundheitsdaten', 'EWR',
    'angemessener', 'Garantien', 'Nutzungsbedingungen', 'verbindlich',
    'Nutzer', 'verpflichtet', 'sorgfältig', 'umgehend', 'melden',
    'Sicherheitskopien', 'regelmäßig', 'Anforderungen', 'gesetzlichen',
    'Vorschriften', 'entsprechen', 'Haftung', 'Schäden', 'verursacht',
    'Vorsatz', 'grober', 'Fahrlässigkeit', 'unvorhersehbarer', 'Schäden',
    'Vertrag', 'unbefristet', 'Kündigungsfrist', 'Tage', 'schriftlich',
    'Änderungen', 'vorbehalten', 'Wirksamkeit', 'Mitteilung', 'Email',
    'Website', 'Unwirksamkeit', 'einzelner', 'Bestimmungen', 'Rechtswahl',
    'Gerichtsstand', 'Berlin', 'Recht', 'Bundesrepublik', 'Deutschland',
    'Kontakt', 'Impressum', 'AGB', 'geschützt', 'gesetzlichen',
    'Bestimmungen', 'Vervielfältigung', 'Verarbeitung', 'Verbreitung',
    'vorbehaltlich', 'Zustimmung', 'untersagt', 'Nutzung', 'Inhalte',
    'Dritte', 'gestattet', 'schriftlicher', 'Genehmigung', 'Urheberrechte',
    'Dritten', 'geschützt', 'Markenrechte', 'Verstoß', 'rechtliche',
    'Schritte', 'vorbehalten', 'Haftung', 'Inhalte', 'externer', 'Links',
    'Verantwortung', 'Betreiber', 'jeweiligen', 'Seiten', 'Nutzung',
    'eigenes', 'Risiko', 'Richtigkeit', 'Vollständigkeit', 'Aktualität',
    'Inhalte', 'Haftung', 'Schäden', 'Nutzung', 'möglich', 'Nutzer',
    'Inhalte', 'eigenen', 'Verantwortung', 'Nutzer', 'verpflichtet',
    ' rechtswidrige', 'Inhalte', 'Dritten', 'Rechte', 'Dritter',
    'verletzen', 'Sperrung', 'Zugang', 'vorbehalten', 'Nutzung',
    'entgeltlich', 'kostenlos', 'Nutzungsentgelt', 'fällig', 'Leistung',
    'Umfang', 'Beschreibung', 'Website', 'Nutzungsverhältnis', 'Vertrag',
    'Parteien', 'Widerruf', 'Widerrufsrecht', 'Verbraucher', 'Widerrufsbelehrung',
    'Widerrufsfrist', 'Monate', 'Leistung', 'Dienstleistung', 'vertrags',
    'Widerrufsrecht', 'Verbraucher', 'Widerrufsbelehrung', 'Widerrufsfrist',
    'Monate', 'Leistung', 'Dienstleistung', 'vertrags', 'Verbraucher',
    'Widerrufsrecht', 'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate',
    'Leistung', 'Dienstleistung', 'vertrags', 'Widerruf', 'Widerrufsrecht',
    'Verbraucher', 'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate',
    'Leistung', 'Dienstleistung', 'vertrags', 'Widerruf', 'Widerrufsrecht',
    'Verbraucher', 'Widerrufsbelehrung', 'Widerrufsfrist', 'Monate',
    'Leistung', 'Dienstleistung', 'vertrags']

def is_german_ui_text(text):
    """Check if text is a German UI string that should be translated."""
    text = text.strip()
    if len(text) < 2:
        return False
    if text.startswith('.') or text.startswith('#') or text.startswith('bg-'):
        return False
    if text in ['true', 'false', 'null', 'undefined', 'div', 'span', 'className', 'style']:
        return False
    if text.replace('.', '').replace(',', '').replace(' ', '').isdigit():
        return False
    # Must contain at least one German-specific thing
    has_german = bool(re.search(r'[äöüßÄÖÜ]', text))
    if not has_german:
        for word in german_indicators:
            if word in text:
                has_german = True
                break
    return has_german

def make_key(text):
    """Generate a translation key from German text."""
    # Check existing first
    if text in existing:
        return existing[text]
    
    key = re.sub(r'[^\w\s]', '', text.lower())
    key = re.sub(r'\s+', '.', key).strip('.')
    if len(key) > 50:
        key = key[:50]
    # Make it unique by adding hash if needed
    return key

def migrate_file(filepath):
    """Migrate a single file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already uses useTranslation
    if 'useTranslation' in content:
        return 0, "already migrated"
    
    # Skip if no German strings
    if not re.search(r'[äöüßÄÖÜ]', content):
        # Check for German words
        has_german = False
        for word in german_indicators:
            if word in content:
                has_german = True
                break
        if not has_german:
            return 0, "no german strings"
    
    # Find all German text strings in JSX
    replacements = []
    
    # Pattern 1: Text between JSX tags: >German text<
    def replace_jsx_text(match):
        text = match.group(1)
        if is_german_ui_text(text):
            key = make_key(text)
            return f'>{{t("{key}", "{text}")}}'
        return match.group(0)
    
    # Pattern 2: JSX attributes with German text
    def replace_attr(match):
        attr_name = match.group(1)
        text = match.group(2)
        if is_german_ui_text(text):
            key = make_key(text)
            return f'{attr_name}={{t("{key}", "{text}")}}'
        return match.group(0)
    
    # Apply replacements
    original = content
    
    # Replace JSX text nodes
    content = re.sub(r'>([^\n<>{}&]{2,})<', replace_jsx_text, content)
    
    # Replace JSX attributes (careful not to break existing JS expressions)
    # Only replace string literals in known attribute names
    for attr in ['title', 'placeholder', 'label', 'alt', 'aria-label', 'aria-labelledby']:
        pattern = rf'\b({attr})="([^"]+)"'
        content = re.sub(pattern, replace_attr, content)
    
    if content == original:
        return 0, "no replacements made"
    
    # Add import
    if '"use client"' in content:
        # Add import after "use client"
        content = content.replace('"use client";\n', '"use client";\n\nimport { useTranslation } from "@/components/i18n-provider";\n')
    else:
        # Add import at top
        lines = content.split('\n')
        import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                import_idx = i + 1
        lines.insert(import_idx, 'import { useTranslation } from "@/components/i18n-provider";')
        content = '\n'.join(lines)
    
    # Add const { t } = useTranslation();
    # Find the component function and add after first const/state
    # Simple approach: add after first line that starts with "export default" or "export function"
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.strip().startswith('export default function') or line.strip().startswith('export function'):
            # Insert after the opening brace line
            for j in range(i+1, min(i+10, len(lines))):
                if '{' in lines[j] and '}' not in lines[j]:
                    lines.insert(j+1, '  const { t } = useTranslation();')
                    break
            break
    
    content = '\n'.join(lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return len(replacements), "ok"

# Process files
results = {}
files_migrated = 0
files_skipped = 0

for filepath in files_with_german:
    count, status = migrate_file(filepath)
    results[os.path.basename(filepath)] = {'count': count, 'status': status}
    if status == "ok":
        files_migrated += 1
    else:
        files_skipped += 1

print(f"\nMigrated: {files_migrated}, Skipped: {files_skipped}")
print(f"\nResults:")
for name, res in results.items():
    if res['status'] == 'ok':
        print(f"  ✓ {name}: {res['count']} replacements")
    else:
        print(f"  ⊘ {name}: {res['status']}")
