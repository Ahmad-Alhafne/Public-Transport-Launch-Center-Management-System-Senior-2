# coding: utf-8
import re
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src'
EN_JSON = Path(__file__).resolve().parent.parent / 'src' / 'i18n' / 'en.json'
AR_JSON = Path(__file__).resolve().parent.parent / 'src' / 'i18n' / 'ar.json'

def scan_jsx():
    js_files = sorted(ROOT.glob('**/*.jsx'))
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
                    results.append((f, i, 'TEXT', txt))
            for m in pattern_attr.finditer(line):
                val = m.group(2).strip()
                if not val or not re.search(r'[A-Za-z]', val):
                    continue
                if 't(' in line or 'i18n' in line:
                    continue
                results.append((f, i, m.group(1).upper(), val))
    return results

def make_key(path: Path, lineno: int, text: str):
    slug = re.sub(r'[^A-Za-z0-9_]+', '_', str(path.relative_to(ROOT))).strip('_')
    h = hashlib.sha1(text.encode('utf-8')).hexdigest()[:8]
    return f'generated.{slug}_{lineno}_{h}'

def apply_fixes():
    results = scan_jsx()
    if not results:
        print('no results')
        return
    # Load translations
    en = json.loads(EN_JSON.read_text(encoding='utf-8'))
    ar = json.loads(AR_JSON.read_text(encoding='utf-8'))
    if 'generated' not in en:
        en['generated'] = {}
    if 'generated' not in ar:
        ar['generated'] = {}

    # Group by file for efficient writes
    files = {}
    for f, lineno, kind, txt in results:
        files.setdefault(f, []).append((lineno, kind, txt))

    for f, items in files.items():
        path = f
        lines = path.read_text(encoding='utf-8').splitlines()
        changed = False
        for lineno, kind, txt in sorted(items, key=lambda x: x[0], reverse=False):
            key = make_key(path, lineno, txt)
            short = key.split('.', 1)[1]
            if short in en['generated']:
                # already added
                pass
            else:
                en['generated'][short] = txt
                ar['generated'][short] = txt
            # perform replacement on the specific line
            idx = lineno - 1
            if idx < 0 or idx >= len(lines):
                continue
            line = lines[idx]
            if kind == 'TEXT':
                # replace >...< occurrence
                pattern = re.escape(txt)
                new_fragment = '>{t(\'' + key + '\') }<'
                # Try safe replacement of > txt <
                replaced, n = re.subn(r'>\s*' + pattern + r'\s*<', new_fragment, line, count=1)
                if n == 0:
                    # fallback: replace plain text with {t('...')}
                    replaced = line.replace(txt, '{t(\'' + key + '\') }', 1)
                if replaced != line:
                    lines[idx] = replaced
                    changed = True
            else:
                # attribute replacement e.g., placeholder="..." -> placeholder={t('key')}
                attr = kind.lower()
                # match attr="value"
                replaced, n = re.subn(r'(' + attr + r')=\s*"' + re.escape(txt) + r'"', r"\1={t('" + key + "')}", line, count=1)
                if n == 0:
                    # try double quoted with single quotes inside
                    replaced = line
                if replaced != line:
                    lines[idx] = replaced
                    changed = True
        if changed:
            path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
            print('patched', path.relative_to(ROOT))

    # Write back JSON files
    EN_JSON.write_text(json.dumps(en, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    AR_JSON.write_text(json.dumps(ar, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('updated en/ar json with', len(en['generated']), 'keys')

if __name__ == '__main__':
    apply_fixes()
