@echo off
cd C:\Users\Pattanan\AttendanceEXIM

:: ขอข้อความ commit จากผู้ใช้
set /p commitmsg=Enter commit message: 

:: เพิ่มไฟล์ทั้งหมดเข้า staging
git add .

:: Commit ด้วยข้อความที่ผู้ใช้ใส่
git commit -m "%commitmsg%"

:: ตั้ง branch เป็น main (ถ้ายังไม่ได้ตั้ง)
git branch -M main

:: เชื่อมกับ GitHub repo (แก้ USERNAME เป็นชื่อ GitHub ของคุณจริง ๆ)
git remote set-url origin https://github.com/USERNAME/AttendanceEXIM.git

:: Push ขึ้น GitHub
git push -u origin main

pause



