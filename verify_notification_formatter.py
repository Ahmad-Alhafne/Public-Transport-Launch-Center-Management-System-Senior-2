import re
import json
import os

base = os.path.dirname(__file__)
with open(os.path.join(base, 'frontend', 'src', 'i18n', 'ar.json'), encoding='utf-8') as f:
    ar = json.load(f)

def t(key, default=None):
    parts = key.split('.')
    v = ar
    for p in parts:
        if isinstance(v, dict) and p in v:
            v = v[p]
        else:
            return default if default is not None else key
    return v

samples = [
    ('Trip Update: 1234123', 'Trip 1234123 (da813d6b-f1a9-4e95-b780-c53872260162) status changed to Started. Departure: 2026-07-09 09:28:00Z.'),
    ('Emergency Status Updated: Medical', 'Trip 2000 (8041d916-ae85-4211-94f9-0b625af379cc) emergency status changed to InProgress.'),
    ('New Trip Assigned: 2000', 'You have been assigned to trip 2000 (8041d916-ae85-4211-94f9-0b625af379cc). Departure: 2026-07-09 14:33:00Z.'),
    ('Payment Successful', 'Your payment of USD 5 has been successfully completed. Thank you.'),
    ('Payment Successful', 'تم إكمال دفعتك بقيمة 5.00 بنجاح. شكراً لك.'),
]

for title, msg in samples:
    combined = title + '\n' + msg
    print('===', title)
    m = re.search(r'status\s*(?:is now|changed to)\s*([^\.\n,]+)', combined, re.I)
    if not m:
        m = re.search(r'تم تغيير حالتها إلى\s*([^\.\n,]+)', combined)
    if not m:
        m = re.search(r'changed to\s*([^\.\n,]+)', combined, re.I)
    status = m.group(1).strip() if m else ''
    print('status raw:', status)
    print('translated status:', t(f'notifications.tripStatuses.{status}', ''))

    s2 = re.search(r'حالة الطوارئ الآن\s+([^\.\n,]+)', combined)
    if not s2:
        s2 = re.search(r'emergency status(?:\s+is)?(?:\s+now)?\s+([^\.\n,]+)', combined, re.I)
    if not s2:
        s2 = re.search(r'emergency status changed to\s+([^\.\n,]+)', combined, re.I)
    estatus = s2.group(1).strip() if s2 else ''
    print('emergency raw:', estatus)
    print('translated emergency:', t(f'notifications.emergencyStatuses.{estatus}', '') or t(f'emergency.status.{estatus}', ''))

    am = re.search(r'(?:payment of|of)\s+([A-Z]{3})\s+([\d]+(?:[.,]\d+)?)', combined, re.I)
    if not am:
        am = re.search(r'بقيمة\s+([\d]+(?:[.,]\d+)?)', combined)
    if not am:
        am = re.search(r'payment of\s+([\d]+(?:[.,]\d+)?)', combined, re.I)
    if not am:
        am = re.search(r'(?:amount[:\s]*|قيمة[:\s]*)(?:[A-Z]{3}\s*)?([\d]+(?:[.,]\d+)?)', combined, re.I)
    if not am:
        am = re.search(r'([\d]+(?:[.,]\d+)?)\s+(?:USD|SYP|EUR|GBP|AED)', combined, re.I)
    amount = am.group(1).replace(',', '.') if am else '0.00'
    print('amount:', amount)
