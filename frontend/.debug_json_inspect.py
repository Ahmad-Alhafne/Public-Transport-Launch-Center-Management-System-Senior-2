import json
from pathlib import Path
root = Path('.') / 'src'
with open(root / 'i18n' / 'en.json', encoding='utf-8') as f:
    en = json.load(f)
print(type(en['generated']))
print('generated count', len(en['generated']))
for k in ['pages_admin_ManageTrips_jsx_112_0d1a38cf','pages_admin_ManageUsers_jsx_111_a271bdfb','pages_admin_ManageUsersDetails_load_failed','common.save']:
    print('key', k, 'in generated?', k in en['generated'])
print('first generated keys:', list(en['generated'].keys())[:20])
print('common key direct?', 'save' in en['common'])
