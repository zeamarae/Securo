@echo off
rem (2026-09-07) Use full MinGit path; git not in PATH on this machine
set GITEXE=%LOCALAPPDATA%\Programs\Git\cmd\git.exe
set msg=%*
if "%msg%"=="" set msg=Update Securo %date% %time%
echo [1/3] Staging changes...
"%GITEXE%" add .
echo [2/3] Committing with message: %msg%
rem (2026-07-13) Allow empty commits; was git commit failing on clean tree
"%GITEXE%" commit --allow-empty -m "%msg%"
echo [3/3] Pushing to https://github.com/zeamarae/Securo.git ...
"%GITEXE%" push origin main
