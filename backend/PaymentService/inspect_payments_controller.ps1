Set-Location 'c:/Users/ahmad/Downloads/Ahmad-Alhafne-Public-Transport-Launch-Center-Management-System-main/backend/PaymentService'
$lines = Get-Content 'PaymentService.Api/Controllers/PaymentsController.cs'
for ($i = 35; $i -le 45; $i++) {
    Write-Host ($i.ToString() + ': ' + $lines[$i-1])
}
$lines | Select-String 'ConfirmPaymentCommand\(' | ForEach-Object { Write-Host ($_.LineNumber.ToString() + ': ' + $_.Line) }
