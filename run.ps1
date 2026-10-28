Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Launching Real Estate Platform (Backend + Frontend)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Start frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; `$env:NODE_OPTIONS='--max-old-space-size=4096'; npx expo start --web --port 8081"

Write-Host ""
Write-Host "Both servers have been launched in separate terminal windows!" -ForegroundColor Green
Write-Host "  Backend API:  http://127.0.0.1:8000 (Docs: http://127.0.0.1:8000/docs)" -ForegroundColor Yellow
Write-Host "  Frontend Web: http://localhost:8081" -ForegroundColor Yellow
Write-Host ""
