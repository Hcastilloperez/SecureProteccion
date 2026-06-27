Write-Host "=== Probando Rate Limiting (6 intentos rapidos de login) ==="
for($i=1; $i -le 6; $i++) {
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@soter.com","password":"wrong"}' 2>&1
        if($r.success) {
            Write-Host "Intento $i : success=true" -ForegroundColor Red
        } else {
            Write-Host "Intento $i : success=false" -ForegroundColor Green
        }
    } catch {
        $msg = $_.Exception.Message
        if($msg -match "429") {
            Write-Host "Intento $i : BLOQUEADO POR RATE LIMIT (429)" -ForegroundColor Yellow
        } else {
            Write-Host "Intento $i : Error - $($msg.Split(':')[1].Trim())" -ForegroundColor Magenta
        }
    }
    Start-Sleep -Milliseconds 200
}
Write-Host ""
Write-Host "=== Prueba completada ==="
