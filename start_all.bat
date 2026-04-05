@echo off
:menu
cls
echo ================================
echo 🚀 AttendanceEXIM System Control
echo ================================
echo 1. 🌐 Start Server
echo 2. 🔄 Reset Attendance Records
echo 3. 💾 Backup Attendance Records
echo 4. ♻️ Restore Attendance Records
echo 5. 🚪 Exit
echo ================================
set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto reset
if "%choice%"=="3" goto backup
if "%choice%"=="4" goto restore
if "%choice%"=="5" goto end
goto menu

:start
echo Starting AttendanceEXIM Server...
cd /d %~dp0
npm install express mongoose cors exceljs dotenv
node server.js
pause
goto menu

:reset
echo Running Reset...
curl -X POST http://localhost:4000/admin/reset
pause
goto menu

:backup
echo Running Backup...
curl -X POST http://localhost:4000/admin/backup
pause
goto menu

:restore
echo Running Restore...
curl -X POST http://localhost:4000/admin/restore
pause
goto menu

:end
echo Exiting System Control...
exit

