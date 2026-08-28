import markdown
import weasyprint
import os

base_dir = "/opt/data/projects/nephroassist/marketing"
pitch_md = os.path.join(base_dir, "nephroassist-pitch-deck.md")
memo_md = os.path.join(base_dir, "nephroassist-investor-memo.md")
pitch_pdf = os.path.join(base_dir, "nephroassist-pitch-deck.pdf")
memo_pdf = os.path.join(base_dir, "nephroassist-investor-memo.pdf")

css = """
@page { size: A4; margin: 2.5cm 2cm; @bottom-center { content: "NephroAssist — Vertraulich | August 2026"; font-size: 8pt; color: #666; } }
body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.6; color: #222; }
h1 { font-size: 22pt; color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 0.3em; margin-top: 1.5em; page-break-before: always; }
h1:first-of-type { page-break-before: auto; }
h2 { font-size: 14pt; color: #2c5282; margin-top: 1.2em; margin-bottom: 0.5em; }
h3 { font-size: 11pt; color: #2d3748; margin-top: 1em; margin-bottom: 0.4em; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 9.5pt; }
th, td { border: 1px solid #cbd5e0; padding: 6px 8px; text-align: left; vertical-align: top; }
th { background-color: #edf2f7; font-weight: 600; color: #1a202c; }
tr:nth-child(even) { background-color: #f7fafc; }
blockquote { border-left: 4px solid #2c5282; margin: 1em 0; padding: 0.5em 1em; background-color: #f7fafc; color: #4a5568; font-style: italic; }
code { background-color: #edf2f7; padding: 2px 5px; border-radius: 3px; font-family: "Courier New", monospace; font-size: 9pt; }
pre { background-color: #edf2f7; padding: 1em; border-radius: 4px; overflow-x: auto; font-size: 9pt; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
p { margin: 0.6em 0; }
ul, ol { margin: 0.6em 0; padding-left: 1.5em; }
li { margin: 0.3em 0; }
strong { color: #1a202c; }
"""

def md_to_pdf(md_path, pdf_path):
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()
    html_body = markdown.markdown(md_text, extensions=["tables", "fenced_code"])
    html_doc = f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<style>{css}</style>
</head>
<body>
{html_body}
</body>
</html>"""
    weasyprint.HTML(string=html_doc).write_pdf(pdf_path)
    print(f"Generated PDF: {pdf_path}")

md_to_pdf(pitch_md, pitch_pdf)
md_to_pdf(memo_md, memo_pdf)
print("PDF generation complete.")
