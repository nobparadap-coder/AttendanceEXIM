// backup.js
const fs = require("fs");
const mongoose = require("mongoose");

// 1. เชื่อมต่อ MongoDB
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

async function backupData() {
  try {
    // 3. ดึงข้อมูลจาก MongoDB
    const employees = await Employee.find({});
    const attendance = await Attendance.find({});

    // 4. รวมข้อมูลเป็น object
    const backup = {
      employees,
      attendance
    };

    // 5. เขียนลงไฟล์ backup.json
    fs.writeFileSync("backup.json", JSON.stringify(backup, null, 2), "utf8");
    console.log("✅ Backup ข้อมูลลงไฟล์ backup.json เรียบร้อย");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Backup ล้มเหลว:", err);
    mongoose.connection.close();
  }
}

backupData();

