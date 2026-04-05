@echo off
:menu
cls
echo ================================
echo ⚙️ AttendanceEXIM Admin Tools
echo ================================
echo 1. 🔄 Reset Attendance Records
echo 2. 💾 Backup Attendance Records
echo 3. ♻️ Restore Attendance Records
echo 4. 🚪 Exit
echo ================================
set /p choice=Enter your choice (1-4): 

if "%choice%"=="1" goto reset
if "%choice%"=="2" goto backup
if "%choice%"=="3" goto restore
if "%choice%"=="4" goto end
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
echo Exiting Admin Tools...
exit

