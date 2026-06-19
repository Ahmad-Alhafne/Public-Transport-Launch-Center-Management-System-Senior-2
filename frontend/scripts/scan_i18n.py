# coding: utf-8
import re
from pathlib import Path
root = Path(__file__).resolve().parent.parent / 'src'
js_files = sorted(root.glob('**/*.jsx'))
pattern_text = re.compile(r'>\s*([^<>{}\n]+?)\s*<')
pattern_attr = re.compile(r'(placeholder|title|aria-label|alt)=\s*"([^"]*?)"')
ignore = {'', ' ', '\n'}
results = []
for f in js_files:
    text = f.read_text(encoding='utf-8')
    for i, line in enumerate(text.splitlines(), start=1):
        for m in pattern_text.finditer(line):
            txt = m.group(1).strip()
            if not txt or txt in ignore:
                continue
            if txt.startswith('{') or txt.endswith('}'):
                continue
            if 't(' in line or 'i18n' in line:
                continue
            if len(txt) > 2 and re.search(r'[A-Za-z]', txt) and not re.search(r'^(?:\d+|[⏱📏💺🚗📧/.?:!@#$%^&*()_+=\-\[\]{};\\|]+)$', txt):
                results.append((str(f.relative_to(root)), i, 'TEXT', txt))
        for m in pattern_attr.finditer(line):
            val = m.group(2).strip()
            if not val or not re.search(r'[A-Za-z]', val):
                continue
            if 't(' in line or 'i18n' in line:
                continue
            results.append((str(f.relative_to(root)), i, m.group(1).upper(), val))
print('count', len(results))
for r in results:
    print(r)
