require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const excelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const app = express();

// Serve static files (index.html, report.html, admin.html)
app.use(express.static(path.join(__dirname)));
app.use(cors());
app.use(express.json());

// ===== Connect MongoDB =====
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===== Schema =====
const attendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  checkin: String,
  checkout: String,
  distance: String,
  mode: { type: String, default: "GPS" },
  leaveType: { type: String, default: "-" },
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

// ===== Attendance API =====
app.post("/attendance", async (req, res) => {
  try {
    const record = new Attendance(req.body);
    await record.save();
    res.json({ success: true, message: "Attendance saved!", data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/attendance", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/attendance", async (req, res) => {
  try {
    await Attendance.deleteMany({});
    res.json({ success: true, message: "All records deleted!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Employees API =====
app.get("/employees", async (req, res) => {
  try {
    const employees = await Attendance.distinct("name");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Report API =====
app.get("/report", async (req, res) => {
  try {
    const { month, employee, mode, leaveType } = req.query;
    let query = {};

    if (month) query.date = { $regex: month }; // เช่น "2026-04"
    if (employee && employee !== "all") query.name = employee;
    if (mode && mode !== "all") query.mode = mode;
    if (leaveType && leaveType !== "all") query.leaveType = leaveType;

    const records = await Attendance.find(query);

    const summary = {
      workDays: records.filter(r => r.mode !== "Leave").length,
      leaveDays: records.filter(r => r.mode === "Leave").length,
      annual: records.filter(r => r.leaveType === "Annual Leave").length,
      private: records.filter(r => r.leaveType === "Private Leave").length,
      sick: records.filter(r => r.leaveType === "Sick Leave").length,
      other: records.filter(r => r.leaveType === "Other Leave").length
    };

    res.json({ summary, records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Export Excel API =====
app.get("/export-excel", async (req, res) => {
  try {
    const records = await Attendance.find();

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    worksheet.columns = [
      { header: "ID", key: "_id", width: 24 },
      { header: "Name", key: "name", width: 20 },
      { header: "Date", key: "date", width: 15 },
      { header: "Check-in", key: "checkin", width: 15 },
      { header: "Check-out", key: "checkout", width: 15 },
      { header: "Distance (m)", key: "distance", width: 15 },
      { header: "Mode", key: "mode", width: 15 },
      { header: "Leave Type", key: "leaveType", width: 20 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1976D2" }
    };

    records.forEach(r => worksheet.addRow(r.toObject()));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=AttendanceReport.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Admin API =====
app.post("/admin/reset", async (req, res) => {
  try {
    await Attendance.deleteMany({});
    res.json({ success: true, message: "Attendance reset complete!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/admin/backup", async (req, res) => {
  try {
    const records = await Attendance.find();
    fs.writeFileSync("backup.json", JSON.stringify(records, null, 2));
    res.json({ success: true, message: "Backup saved to backup.json" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/admin/restore", async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("backup.json"));
    await Attendance.insertMany(data);
    res.json({ success: true, message: "Restore complete!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

