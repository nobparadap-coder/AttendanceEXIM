const express = require("express");
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ===== เชื่อมต่อ MongoDB =====
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
  leaveReason: String,
  month: String
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

const employeeSchema = new mongoose.Schema({
  name: String,
  role: String
});
const Employee = mongoose.model("Employee", employeeSchema);

// ===== Helper Functions =====
function getDuration(checkin, checkout) {
  if (!checkin || !checkout) return "-";
  const inTime = new Date(`1970-01-01T${checkin}`);
  const outTime = new Date(`1970-01-01T${checkout}`);
  const diffHours = (outTime - inTime) / (1000 * 60 * 60);
  if (diffHours >= 7.5) return "Full Day";
  if (diffHours >= 3.5) return "Half Day";
  return "Short";
}

function getRecordedBy(mode) {
  if (mode === "Manual") return "Admin";
  if (mode === "GPS" || mode === "WO") return "Employee";
  if (mode === "Leave") return "System/HR";
  return "-";
}

// ===== Serve Static Files =====
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== API: Save Attendance =====
app.post("/attendance", async (req, res) => {
  try {
    const record = new Attendance(req.body);
    await record.save();
    res.json({ success: true, message: "Attendance saved", record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== API: Employees =====
app.post("/employees/add", async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    res.json({ success: true, message: "Employee added", emp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/employees/list", async (req, res) => {
  try {
    const employees = await Employee.find().lean();
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== API: Report =====
app.get("/report", async (req, res) => {
  const { month, employee, mode, leaveType } = req.query;
  try {
    let query = {};
    if (month) query.month = month;
    if (employee && employee !== "all") query.name = employee;
    if (mode && mode !== "all") query.mode = mode;
    if (leaveType && leaveType !== "all") query.leaveType = leaveType;

    const records = await Attendance.find(query).lean();

    const summary = {
      workDays: records.filter(r => ["WO","GPS","Manual"].includes(r.mode)).length,
      leaveDays: records.filter(r => r.mode === "Leave").length,
      annual: records.filter(r => r.leaveType === "Annual Leave").length,
      private: records.filter(r => r.leaveType === "Private Leave").length,
      sick: records.filter(r => r.leaveType === "Sick Leave").length,
      other: records.filter(r => r.leaveType === "Other Leave").length
    };

    res.json({ success: true, records, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== API: Export Excel =====
app.get("/export-excel", async (req, res) => {
  try {
    const records = await Attendance.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    worksheet.columns = [
      { header: "ID", key: "_id", width: 24 },
      { header: "Name", key: "name", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Check-in", key: "checkin", width: 15 },
      { header: "Check-out", key: "checkout", width: 15 },
      { header: "Distance (m)", key: "distance", width: 15 },
      { header: "Mode", key: "mode", width: 15 },
      { header: "Leave Type", key: "leaveType", width: 20 },
      { header: "Leave Reason", key: "leaveReason", width: 30 },
      { header: "Duration", key: "duration", width: 15 },
      { header: "Recorded By", key: "recordedBy", width: 15 }
    ];

    records.forEach(r => {
      worksheet.addRow({
        ...r,
        duration: getDuration(r.checkin, r.checkout),
        recordedBy: getRecordedBy(r.mode)
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== API: Export HR Report =====
app.get("/export-hr-report", async (req, res) => {
  try {
    const records = await Attendance.find().lean();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("HR Report");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Work Order (WO)", key: "mode", width: 15 },
      { header: "Leave Code", key: "leaveType", width: 20 },
      { header: "Leave Reason", key: "leaveReason", width: 30 },
      { header: "Duration", key: "duration", width: 15 },
      { header: "Recorded By", key: "recordedBy", width: 15 }
    ];

    records.forEach(r => {
      worksheet.addRow({
        name: r.name,
        date: r.date,
        mode: r.mode,
        leaveType: r.leaveType,
        leaveReason: r.leaveReason,
        duration: getDuration(r.checkin, r.checkout),
        recordedBy: getRecordedBy(r.mode)
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=hr_report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Admin: Reset Data =====
app.post("/admin/reset", async (req, res) => {
  try {
    await Attendance.deleteMany({});
    await Employee.deleteMany({});
    res.json({ success: true, message: "All data reset" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Admin: Backup Data =====
app.get("/admin/backup", async (req, res) => {
  try {
    const records = await Attendance.find().lean();
    const employees = await Employee.find().lean();
    const backup = { records, employees };
    res.setHeader("Content-Disposition", "attachment; filename=backup.json");
    res.json(backup);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Admin: Restore Data =====
app.post("/admin/restore", async (req, res) => {
  try {
    const { records, employees } = req.body;
    if (records) {
      await Attendance.deleteMany({});
      await Attendance.insertMany(records);
    }
    if (employees) {
      await Employee.deleteMany({});
      await Employee.insertMany(employees);
    }
    res.json({ success: true, message: "Restore completed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Auto Backup ทุกวันตอนเที่ยงคืน =====
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("⏰ เริ่ม Auto-Backup...");
    const records = await Attendance.find().lean();
    const employees = await Employee.find().lean();
    const backup = {
      timestamp: new Date().toISOString(),
      records,
      employees
    };

    fs.writeFileSync("backup.json", JSON.stringify(backup, null, 2), "utf8");
    fs.appendFileSync("history.log", `[${new Date().toISOString()}] Auto-Backup: สำเร็จ\n`, "utf8");

    console.log("✅ Auto-Backup เสร็จเรียบร้อย");
  } catch (err) {
    fs.appendFileSync("history.log", `[${new Date().toISOString()}] Auto-Backup: ล้มเหลว\n`, "utf8");
    console.error("❌ Auto-Backup ล้มเหลว:", err);
  }
});

// ===== Start Server =====
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


