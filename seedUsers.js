const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";

// ===== Users Schema =====
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const User = mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGO_URI);

  // ล้างข้อมูลเก่า
  await User.deleteMany({});

  // เพิ่มผู้ใช้ใหม่
  await User.insertMany([
    { username: "Pattanan", password: "1234", role: "G5" }, // Admin
    { username: "Saruta", password: "1234", role: "G4" }    // User ปกติ
  ]);

  console.log("✅ Users seeded successfully!");
  process.exit();
}

seed();

