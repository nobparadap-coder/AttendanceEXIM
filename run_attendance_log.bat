@echo off
REM ================================
REM Start MongoDB with log
REM ================================
echo Starting MongoDB...
mkdir C:\data\db 2>nul
mkdir C:\data\log 2>nul
start cmd /k "mongod --dbpath C:\data\db --port 27017 --logpath C:\data\log\mongo.log --logappend"

REM ================================
REM Start Attendance System with log
REM ================================
echo Starting Attendance System...
cd /d C:\Users\Pattanan\AttendanceEXIM
start cmd /k "node server.js >> server.log 2>&1"

echo All services started with logging enabled!
pause



