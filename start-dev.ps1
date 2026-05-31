param(
  [string]$BackendPath = "d:\learnsphere\backend",
  [string]$FrontendPath = "d:\learnsphere"
)

Write-Host "Starting LearnSphere backend and frontend..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$BackendPath'; npm start"
)

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$FrontendPath'; npm start"
)

Write-Host "Two terminals opened: backend on :5000 and frontend on :3000 (or next available port)." -ForegroundColor Green