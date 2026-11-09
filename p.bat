@echo off
rem (2026-07-13) Auto sync with no-edit pull & merge cleanup; was plain pull
if exist ".git\MERGE_HEAD" git merge --abort
call npm run build
echo [1/4] Staging local changes...
git add -A
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo [2/4] Committing local changes...
    git commit -m "Update Securo %DATE% %TIME%"
) else (
    echo [2/4] No local changes to commit.
)
echo [3/4] Pulling latest changes from origin main...
git pull --no-rebase --no-edit origin main
if errorlevel 1 (
    echo Pull encountered conflicts. Please resolve them before pushing.
    exit /b 1
)
echo [4/4] Pushing changes to origin main...
git push origin main
if errorlevel 1 (
    echo Push failed.
    exit /b 1
)
echo Done! Changes safely pulled and pushed.
