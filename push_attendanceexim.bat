@echo off
cd C:\Users\Pattanan\AttendanceEXIM

:: เพิ่มไฟล์ทั้งหมดเข้า staging
git add .

:: Commit พร้อมข้อความ (แก้ไขข้อความ commit ได้ตามต้องการ)
git commit -m "Update AttendanceEXIM"

:: ตั้ง branch เป็น main (ถ้ายังไม่ได้ตั้ง)
git branch -M main

:: เชื่อมกับ GitHub repo (ใส่ USERNAME ของคุณจริง ๆ)
git remote set-url origin https://github.com/USERNAME/AttendanceEXIM.git

:: Push ขึ้น GitHub
git push -u origin main

pause


