@echo off
rem (2026-07-13) Git commit & push automation to https://github.com/zeamarae/Securo.git
set msg=%*
if "%msg%"=="" set msg=Update Securo %date% %time%
echo [1/3] Staging changes...
git add .
echo [2/3] Committing with message: %msg%
rem (2026-07-13) Allow empty commits; was git commit failing on clean tree
git commit --allow-empty -m "%msg%"
echo [3/3] Pushing to https://github.com/zeamarae/Securo.git ...
git push origin main
