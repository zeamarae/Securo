@echo off
rem (2026-07-13) Safe pull from GitHub; was commit and push script
if /i "%~1"=="push" goto do_push

set HAS_CHANGES=0
for /f "tokens=*" %%i in ('git status --porcelain') do set HAS_CHANGES=1

if "%HAS_CHANGES%"=="1" (
    echo [1/3] Stashing local changes...
    git stash --include-untracked
) else (
    echo [1/3] Working tree clean, no stash needed.
)

echo [2/3] Pulling new changes from GitHub...
git pull origin main

if "%HAS_CHANGES%"=="1" (
    echo [3/3] Restoring local changes...
    git stash pop
) else (
    echo [3/3] Safe pull complete.
)
exit /b 0

:do_push
shift
set msg=%*
if "%msg%"=="" set msg=Update Securo %date% %time%
echo [1/3] Staging changes...
git add .
echo [2/3] Committing with message: %msg%
git commit --allow-empty -m "%msg%"
echo [3/3] Pushing to https://github.com/zeamarae/Securo.git ...
git push origin main
exit /b 0
