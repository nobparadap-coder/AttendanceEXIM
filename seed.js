const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/attendanceDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ===== Schema =====
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
const Attendance = mongoose.model("Attendance", attendanceSchema);

const employeeSchema = new mongoose.Schema({
  name: String,
  role: String
});
const Employee = mongoose.model("Employee", employeeSchema);

// ===== Sample Data =====
const employees = [
  { name: "Yanisa Rostip", role: "G5" },
  { name: "Pattanan Prachon", role: "G5" },
  { name: "Saruta Somma", role: "G4" },
  { name: "Benchawan Nookhao", role: "G4" },
  { name: "Kuntarat Laemmukda", role: "G4" },
  { name: "Kusuma Kongkunna", role: "G4" },
  { name: "Pakamas Maneerat", role: "G4" },
  { name: "Sarimon Tongkam", role: "G4" }
];

const attendanceRecords = [
  { name: "Yanisa Rostip", date: "2026-04-01", checkin: "09:00", checkout: "18:00", mode: "GPS", distance: "50" },
  { name: "Pattanan Prachon", date: "2026-04-01", checkin: "09:05", checkout: "18:10", mode: "GPS", distance: "30" },
  { name: "Saruta Somma", date: "2026-04-02", checkin: "08:55", checkout: "17:50", mode: "Manual" },
  { name: "Benchawan Nookhao", date: "2026-04-03", mode: "Leave", leaveType: "Annual Leave", leaveReason: "พักร้อน" },
  { name: "Kuntarat Laemmukda", date: "2026-04-03", mode: "Leave", leaveType: "Sick Leave", leaveReason: "ป่วย" },
  { name: "Kusuma Kongkunna", date: "2026-04-04", checkin: "09:10", checkout: "18:00", mode: "GPS", distance: "70" },
  { name: "Pakamas Maneerat", date: "2026-04-04", mode: "Leave", leaveType: "Private Leave", leaveReason: "ธุระส่วนตัว" },
  { name: "Sarimon Tongkam", date: "2026-04-05", checkin: "09:00", checkout: "18:00", mode: "GPS", distance: "40" }
];

// ===== Insert Data =====
async function seedData() {
  try {
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Employee.insertMany(employees);
    await Attendance.insertMany(attendanceRecords);
    console.log("✅ Sample data inserted successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error inserting sample data:", err);
    process.exit(1);
  }
}

seedData();

