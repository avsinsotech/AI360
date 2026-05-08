# TushGPT Auto-Publish Script

# 1. Setup Folders
$root = Get-Location
$publishDir = "$root\publish"
if (Test-Path $publishDir) { Remove-Item -Recurse -Force $publishDir }
New-Item -ItemType Directory -Path "$publishDir\backend"
New-Item -ItemType Directory -Path "$publishDir\frontend"

Write-Host "--- 1. Backend: Building and Publishing ---" -ForegroundColor Cyan
cd "$root\backend"
# Kill existing backend to avoid file locks
taskkill /IM TushGptBackend.exe /F 2>$null
dotnet publish -c Release -o "$publishDir\backend"

Write-Host "--- 2. Frontend: Building ---" -ForegroundColor Cyan
cd $root
npm run build

Write-Host "--- 3. Organizing Files ---" -ForegroundColor Cyan
Copy-Item -Path "$root\dist\*" -Destination "$publishDir\frontend" -Recurse

Write-Host "`n--- PUBLISH COMPLETE! ---" -ForegroundColor Green
Write-Host "Backend: $publishDir\backend"
Write-Host "Frontend: $publishDir\frontend"
cd $root
