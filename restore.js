// restore.js
const fs = require("fs");
const mongoose = require("mongoose");

// 1. เชื่อมต่อ MongoDB (ไม่ต้องมี options แล้ว)
mongoose.connect("mongodb://127.0.0.1:27017/attendanceDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// 2. สร้าง Schema สำหรับ employees และ attendance
const employeeSchema = new mongoose.Schema({
  name: String,
  role: String
});

const attendanceSchema = new mongoose.Schema({
  name: String,
  date: String,
  checkin: String,
  checkout: String,
  distance: String,
  mode: String,
  leaveType: String,
  leaveReason: String
});

const Employee = mongoose.model("Employee", employeeSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

async function restoreData() {
  try {
    // 3. อ่านไฟล์ backup.json
    const backup = JSON.parse(fs.readFileSync("backup.json", "utf8"));

    // backup.json ควรมีโครงสร้างแบบนี้:
    // {
    //   "employees": [ { "name": "...", "role": "..." }, ... ],
    //   "attendance": [ { "name": "...", "date": "...", ... }, ... ]
    // }

    // 4. ลบข้อมูลเดิมก่อน
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    console.log("✅ ลบข้อมูลเดิมเรียบร้อย");

    // 5. Insert ข้อมูลใหม่
    if (backup.employees && backup.employees.length > 0) {
      await Employee.insertMany(backup.employees);
      console.log("✅ Restore employees เรียบร้อย");
    }

    if (backup.attendance && backup.attendance.length > 0) {
      await Attendance.insertMany(backup.attendance);
      console.log("✅ Restore attendance เรียบร้อย");
    }

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Restore ล้มเหลว:", err);
    mongoose.connection.close();
  }
}

restoreData();

