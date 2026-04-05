@echo off
REM ================================
REM Start MongoDB Server
REM ================================
echo Starting MongoDB...
start cmd /k "mongod --dbpath C:\data\db"

REM ================================
REM Start Attendance System (Node.js)
REM ================================
echo Starting Attendance System...
cd /d C:\Users\Pattanan\AttendanceEXIM
start cmd /k "node server.js"

echo All services started!
pause
