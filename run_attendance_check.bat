@echo off
REM ================================
REM Check if MongoDB is already running
REM ================================
echo Checking MongoDB service...

REM ใช้ netstat ตรวจสอบว่ามี process ฟังอยู่ที่ port 27017 หรือไม่
netstat -ano | findstr :27017 >nul
if %errorlevel%==0 (
    echo ✅ MongoDB is already running on port 27017
) else (
    echo Starting MongoDB...
    start cmd /k "mongod --dbpath C:\data\db --port 27017"
    timeout /t 5 >nul
)

REM ================================
REM Start Attendance System (Node.js)
REM ================================
echo Starting Attendance System...
cd /d C:\Users\Pattanan\AttendanceEXIM
node server.js

pause

