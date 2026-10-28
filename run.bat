@echo off
echo ========================================================
echo  Launching Real Estate Platform (Backend + Frontend)
echo ========================================================
start "Real Estate - Backend" cmd /c "%~dp0run-backend.bat"
start "Real Estate - Frontend" cmd /c "%~dp0run-frontend.bat"
echo.
echo Both servers have been launched in separate terminal windows!
echo   - Backend:  http://127.0.0.1:8000 (API Docs: http://127.0.0.1:8000/docs)
echo   - Frontend: http://localhost:8081
echo.
pause
