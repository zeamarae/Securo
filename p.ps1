# (2026-07-13) Auto sync pull and push script; was missing ps1 script
Write-Host "[1/4] Staging local changes..." -ForegroundColor Cyan
git add -A
git diff-index --quiet HEAD --
if ($LASTEXITCODE -ne 0) {
    Write-Host "[2/4] Committing local changes..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Update Securo $timestamp"
} else {
    Write-Host "[2/4] No local changes to commit." -ForegroundColor Yellow
}
Write-Host "[3/4] Pulling latest changes from origin main..." -ForegroundColor Cyan
git pull --no-rebase origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Pull encountered conflicts. Please resolve before pushing." -ForegroundColor Red
    exit 1
}
Write-Host "[4/4] Pushing changes to origin main..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed." -ForegroundColor Red
    exit 1
}
Write-Host "Done! Changes safely pulled and pushed." -ForegroundColor Green
