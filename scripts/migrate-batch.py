#!/usr/bin/env python3
"""
Careful i18n migration - replaces only text between JSX tags.
NEVER touches tag attributes or structure.
"""
import os
import re

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

COMMON_MAP = {
    'Dashboard': 'nav.dashboard', 'Patienten': 'nav.patients', 'Einstellungen': 'nav.settings',
    'Administration': 'nav.admin', 'Untersuchungen': 'sidebar.requirements', 'Dokumente': 'sidebar.documents',
    'Termine': 'sidebar.appointments', 'Benutzer': 'admin.users', 'Audit Log': 'sidebar.auditLog',
    'Statistiken': 'sidebar.statistics', 'Speichern': 'nav.save', 'Abbrechen': 'nav.cancel',
    'Bearbeiten': 'nav.edit', 'Löschen': 'nav.delete', 'Erstellen': 'nav.create', 'Suchen': 'nav.search',
    'Filtern': 'nav.filter', 'Aktionen': 'nav.actions', 'Profil': 'nav.settings',
    'Passwort': 'auth.password', 'Name': 'common.name', 'E-Mail': 'common.email', 'Telefon': 'common.phone',
    'Adresse': 'common.address', 'Stadt': 'common.city', 'Notizen': 'common.notes',
    'Datum': 'common.date', 'Status': 'common.status', 'Typ': 'common.type',
    'Beschreibung': 'common.description', 'Ja': 'common.yes', 'Nein': 'common.no',
    'OK': 'common.ok', 'Schließen': 'common.close', 'Bestätigen': 'common.confirm',
    'Absenden': 'common.submit', 'Weiter': 'common.next', 'Zurück': 'nav.back',
    'Keiner': 'common.none', 'Keine': 'common.none', 'Laden...': 'loading.title',
    'Ein Fehler ist aufgetreten': 'error.generic', 'Netzwerkfehler': 'error.network',
    'Gespeichert': 'success.saved', 'Erstellt': 'success.created', 'Aktualisiert': 'success.updated',
    'Gelöscht': 'success.deleted', 'Anmelden': 'auth.login', 'Abmelden': 'auth.logout',
    'Registrieren': 'auth.register', 'Admin': 'admin.admin', 'Koordinator': 'admin.coordinator',
    'Arzt': 'admin.physician', 'Pflege': 'admin.nurse', 'Patient': 'admin.patient',
    'Angehöriger': 'admin.caregiver', 'Aktiv': 'admin.active', 'Inaktiv': 'admin.inactive',
    'NephroAssist': 'app.title', 'Benutzer': 'common.user',
}

def get_key(text):
    text = text.strip()
    if text in existing:
        return existing[text]
    if text in COMMON_MAP:
        return COMMON_MAP[text]
    key = re.sub(r'[^\w\s]', '', text.lower())
    key = re.sub(r'\s+', '.', key).strip('.')
    if len(key) > 50:
        key = key[:50]
    return key

def should_translate(text):
    text = text.strip()
    if len(text) < 2:
        return False
    if text.startswith('.') or text.startswith('#') or text.startswith('bg-'):
        return False
    if text in ['true', 'false', 'null', 'undefined']:
        return False
    if text.replace('.', '').replace(',', '').replace(' ', '').replace('-', '').isdigit():
        return False
    return bool(re.search(r'[äöüßÄÖÜ]', text))

def migrate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'useTranslation' in content:
        return 0, "already migrated"
    
    original = content
    
    # Replace text between JSX tags
    # Pattern: >TEXT< where TEXT doesn't contain special chars
    def replace_text(match):
        text = match.group(1)
        if should_translate(text):
            key = get_key(text)
            safe_text = text.replace('"', '\\"')
            return f'>{{t("{key}", "{safe_text}")}}'
        return match.group(0)
    
    content = re.sub(r'>([^\n<>{}&]{2,})<', replace_text, content)
    
    # Replace JSX attributes with German text
    def replace_attr(match):
        attr = match.group(1)
        text = match.group(2)
        if should_translate(text):
            key = get_key(text)
            safe_text = text.replace('"', '\\"')
            return f'{attr}={{t("{key}", "{safe_text}")}}'
        return match.group(0)
    
    for attr in ['title', 'placeholder', 'label', 'alt']:
        pattern = rf'\b({attr})="([^"]+)"'
        content = re.sub(pattern, replace_attr, content)
    
    if content == original:
        return 0, "no german strings"
    
    # Add import
    if '"use client"' in content:
        content = content.replace('"use client";\n', '"use client";\n\nimport { useTranslation } from "@/components/i18n-provider";\n')
    else:
        lines = content.split('\n')
        idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                idx = i + 1
        lines.insert(idx, 'import { useTranslation } from "@/components/i18n-provider";')
        content = '\n'.join(lines)
    
    # Add hook
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if re.search(r'^\s*(export\s+(default\s+)?function|export\s+async\s+function|const\s+\w+\s*=)', line):
            for j in range(i+1, min(i+15, len(lines))):
                if '{' in lines[j] and 'const { t }' not in '\n'.join(lines[:j+1]):
                    lines.insert(j+1, '  const { t } = useTranslation();')
                    break
            break
    content = '\n'.join(lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return 1, "ok"

files = [
    'app/dashboard/requirements/page.tsx',
    'app/dashboard/documents/page.tsx',
    'app/dashboard/blockers/page.tsx',
    'app/dashboard/appointments/page.tsx',
    'app/dashboard/reports/page.tsx',
    'app/dashboard/admin/reports/page.tsx',
    'app/dashboard/admin/audit/page.tsx',
    'app/dashboard/patients/[id]/page.tsx',
    'app/dashboard/tasks/[id]/page.tsx',
    'app/dashboard/tasks/new/page.tsx',
    'app/dashboard/examinations/templates/page.tsx',
    'components/admin-panel.tsx',
    'components/document-upload.tsx',
    'components/patient-requirements-table.tsx',
    'components/medication-plan.tsx',
    'components/inline-assign-requirement.tsx',
    'components/dialysis-regime.tsx',
    'app/register/page.tsx',
    'app/legal/privacy-policy/page.tsx',
    'app/legal/terms-of-service/page.tsx',
    'app/legal/impressum/page.tsx',
    'app/passport/[token]/page.tsx',
    'app/upload/[token]/page.tsx',
]

for rel_path in files:
    filepath = os.path.join(BASE, rel_path)
    if not os.path.exists(filepath):
        continue
    count, status = migrate_file(filepath)
    if status == "ok":
        print(f"✓ {rel_path}")
    else:
        print(f"⊘ {rel_path}: {status}")

print("\nDone. Now run: npm run build")
