@echo off
echo ==============================================
echo  Starting Real Estate Frontend (Expo Web)
echo ==============================================
cd /d "%~dp0frontend"
set NODE_OPTIONS=--max-old-space-size=4096
call npx expo start --web --port 8081
pause
