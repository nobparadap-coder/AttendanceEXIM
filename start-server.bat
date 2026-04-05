@echo off
REM เข้าไปที่โฟลเดอร์โปรเจกต์
cd /d C:\Users\Pattanan\AttendanceEXIM

REM ตั้งค่า environment variables
set PORT=3000
set MONGO_URI=mongodb://localhost:27017/attendanceexim

REM รัน server
node server.js

REM รอจนกว่าจะกดปิดหน้าต่าง
pause
