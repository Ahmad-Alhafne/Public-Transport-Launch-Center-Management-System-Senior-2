from pathlib import Path
p=Path('PaymentService.Api/Controllers/PaymentsController.cs')
lines=p.read_text().splitlines()
for i,line in enumerate(lines, start=1):
    if 'ConfirmPaymentCommand(' in line:
        print(i, line)
        print([ord(ch) for ch in line])
        break
