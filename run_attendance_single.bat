@echo off
REM ================================
REM Start MongoDB + Attendance System
REM ================================

echo Starting MongoDB...
mongod --dbpath "C:\data\db" --port 27017

echo.
echo MongoDB started successfully!
echo Starting Attendance System...

cd /d C:\Users\Pattanan\AttendanceEXIM
node server.js

pause

