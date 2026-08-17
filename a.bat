@echo off
rem (2026-07-13) Working build script for Android Capacitor APK; was com.faiora target
echo [1/3] Building web assets...
call npm run build
echo [2/3] Syncing Capacitor Android project...
call npx cap sync android
echo [3/3] Assembling Debug APK...
cd android
call gradlew.bat assembleDebug
cd ..
echo Build complete.
if exist "%~dp0android\app\build\outputs\apk\debug\app-debug.apk" (
    explorer.exe /select,"%~dp0android\app\build\outputs\apk\debug\app-debug.apk"
) else (
    explorer.exe "%~dp0android\app\build\outputs\apk\debug"
)

