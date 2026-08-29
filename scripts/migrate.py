import re
import os

BASE = "/opt/data/projects/nephroassist/src/app/dashboard"

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# ============================================================================
# 1. app/dashboard/page.tsx
# ============================================================================
path = os.path.join(BASE, "page.tsx")
content = read_file(path)

# Add import
if 'import { useTranslation }' not in content:
    content = content.replace(
        'import { PageHeader } from "@/components/page-header";',
        'import { PageHeader } from "@/components/page-header";\nimport { useTranslation } from "@/components/i18n-provider";'
    )

# Since this is an async server component, we can't use useTranslation directly in it.
# But looking at the file, it passes title/description to PageHeader which is a component.
# The actual German strings here are:
# title="Dashboard" description="Klinik-Dashboard"
# We need to make the PageHeader use t() or pass translated strings.
# Since this is a server component, let's see if we can just translate the strings inline
# Actually the rules say: Add `const { t } = useTranslation();` inside component.
# But this is an async server component — useTranslation is a client hook.
# We can't use hooks in async server components.
# Let me check what the parent expects... The task says to migrate these files.
# For the server component page.tsx, the German strings are only in PageHeader props.
# PageHeader already accepts title/description as strings. 
# Since this is a server component, we can still use the t function by making it 
# accept a translation function or by importing a server-side translation helper.
# However, looking at the existing pattern in the codebase, the simplest approach 
# for the server component is to NOT change it if it doesn't have client-side German text,
# OR we need to convert it to a client component pattern.
# 
# Actually wait — looking at the task rules again:
# "Add: const { t } = useTranslation(); inside component"
# For async server components, this is impossible. 
# But looking at the actual content, the only German strings in page.tsx are:
#   title="Dashboard" description="Klinik-Dashboard"
# These are passed to PageHeader. PageHeader is already a client component that uses useTranslation.
# Let me check PageHeader to see if it already translates title/description.

print("Checking PageHeader...")
