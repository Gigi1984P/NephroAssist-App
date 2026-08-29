#!/usr/bin/env python3
"""
Safe i18n migration - only replaces specific safe patterns.
NEVER touches inline elements or complex expressions.
"""
import os
import re

BASE = '/opt/data/projects/nephroassist/src'

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
    'Details': 'common.details', 'Anmelden': 'auth.login', 'Abmelden': 'auth.logout',
    'Registrieren': 'auth.register', 'Admin': 'admin.admin', 'Koordinator': 'admin.coordinator',
    'Arzt': 'admin.physician', 'Pflege': 'admin.nurse', 'Patient': 'admin.patient',
    'Angehöriger': 'admin.caregiver', 'Aktiv': 'admin.active', 'Inaktiv': 'admin.inactive',
    'NephroAssist': 'app.title', 'Benutzer': 'common.user',
}

def has_inline_elements(content):
    """Check for inline elements that would break with auto-replacement."""
    inline_pattern = re.compile(r'<(strong|em|b|i|span)\b[^\n]*?>[^\n]*?</\1>')
    return bool(inline_pattern.search(content))

def has_complex_patterns(content):
    """Check for patterns that are hard to auto-migrate."""
    # Ternary in JSX text: {condition ? "Text" : "Other"}
    if re.search(r'>\s*\{[^}]*\?\s*"[^"]*"\s*:\s*"[^"]*"\s*\}\s*<', content):
        return True
    # Nested JSX expressions
    if content.count('<') > 50:  # Very complex file
        return True
    return False

def add_import_and_hook(content):
    """Add useTranslation import and hook."""
    if 'useTranslation' in content:
        return content
    
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
                    # Check next line - if it's a useState, insert after
                    if j+1 < len(lines) and 'useState' in lines[j+1]:
                        lines.insert(j+1, '  const { t } = useTranslation();')
                    else:
                        lines.insert(j+1, '  const { t } = useTranslation();')
                    break
            break
    content = '\n'.join(lines)
    
    return content

def safe_replace(content):
    """Replace only safe patterns."""
    original = content
    changes = []
    
    # Pattern 1: title="German text" (PageHeader prop)
    def replace_title(match):
        text = match.group(1)
        if re.search(r'[äöüßÄÖÜ]', text):
            key = COMMON_MAP.get(text, None)
            if key:
                return f'title={{t("{key}", "{text}")}}'
        return match.group(0)
    content = re.sub(r'title="([^"]+)"', replace_title, content)
    
    # Pattern 2: description="German text" (PageHeader prop)
    def replace_desc(match):
        text = match.group(1)
        if re.search(r'[äöüßÄÖÜ]', text):
            # Generate a simple key
            key = re.sub(r'[^\w\s]', '', text.lower())
            key = re.sub(r'\s+', '.', key).strip('.')
            return f'description={{t("{key}", "{text}")}}'
        return match.group(0)
    content = re.sub(r'description="([^"]+)"', replace_desc, content)
    
    # Pattern 3: placeholder="German text"
    def replace_placeholder(match):
        text = match.group(1)
        if re.search(r'[äöüßÄÖÜ]', text):
            key = re.sub(r'[^\w\s]', '', text.lower())
            key = re.sub(r'\s+', '.', key).strip('.')
            return f'placeholder={{t("{key}", "{text}")}}'
        return match.group(0)
    content = re.sub(r'placeholder="([^"]+)"', replace_placeholder, content)
    
    # Pattern 4: table headers <th>LABEL</th>
    def replace_th(match):
        text = match.group(1)
        if re.search(r'[äöüßÄÖÜ]', text):
            key = COMMON_MAP.get(text, None)
            if key:
                return f'<th>{{t("{key}", "{text}")}}' + ('</th>' if match.group(0).endswith('</th>') else '')
        return match.group(0)
    content = re.sub(r'<th>([^\n<>{}&]+?)</th>', replace_th, content)
    
    # Pattern 5: loading state <div>Laden...</div>
    def replace_loading(match):
        text = match.group(1)
        if text.strip() == 'Laden...':
            return '<div className="p-4 text-center text-muted">{t("loading.title", "Laden...")}</div>'
        return match.group(0)
    content = re.sub(r'<div className="p-4 text-center text-muted">Laden\.\.\.\s*</div>', replace_loading, content)
    
    # Pattern 6: select options with German text (but not variables)
    def replace_option(match):
        text = match.group(1)
        if re.search(r'[äöüßÄÖÜ]', text) and not re.search(r'[{}<]', text):
            key = COMMON_MAP.get(text, None)
            if key:
                return f'<option value="[^"]*"\s*\u003e{{t("{key}", "{text}")}}'
        return match.group(0)
    # This is tricky - we need to match option text only
    
    # Pattern 7: simple button text
    def replace_button(match):
        text = match.group(1)
        if re.search(r'[äöüßÄÖÜ]', text) and not re.search(r'[{}<]', text):
            key = COMMON_MAP.get(text, None)
            if key:
                return f'>{{t("{key}", "{text}")}}'
        return match.group(0)
    content = re.sub(r'>([^\n<>{}&]{2,40})</button>', replace_button, content)
    
    if content != original:
        return content, True
    return content, False

def migrate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'useTranslation' in content:
        return 0, "already migrated"
    
    if has_inline_elements(content):
        return 0, "has inline elements"
    
    if has_complex_patterns(content):
        return 0, "has complex patterns"
    
    new_content, changed = safe_replace(content)
    if not changed:
        return 0, "no german strings"
    
    new_content = add_import_and_hook(new_content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return 1, "ok"

# Process files
files_to_check = [
    'app/dashboard/reports/page.tsx',
    'app/dashboard/admin/page.tsx',
    'app/dashboard/admin/reports/page.tsx',
    'app/dashboard/admin/audit/page.tsx',
    'app/dashboard/admin/settings/page.tsx',
    'app/dashboard/calendar/page.tsx',
    'app/dashboard/help-requests/page.tsx',
    'app/dashboard/requirements/page.tsx',
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
]

migrated = 0
skipped = 0
for rel_path in files_to_check:
    filepath = os.path.join(BASE, rel_path)
    if not os.path.exists(filepath):
        continue
    count, status = migrate_file(filepath)
    if status == "ok":
        migrated += 1
        print(f"✓ {rel_path}")
    else:
        skipped += 1
        print(f"⊘ {rel_path}: {status}")

print(f"\nMigrated: {migrated}, Skipped: {skipped}")
print("Run: npm run build")
