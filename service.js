const Service = require("node-windows").Service;

// กำหนด Service
const svc = new Service({
  name: "AttendanceEXIM Server",
  description: "Attendance System + Auto-Backup รันเป็น Windows Service",
  script: "C:\\Users\\Pattanan\\AttendanceEXIM\\server.js", // ตรวจสอบว่าไฟล์ server.js อยู่ตรงนี้จริง
  nodeOptions: ["--harmony", "--max_old_space_size=4096"]
});

// Event log
svc.on("install", () => {
  console.log("✅ Service ติดตั้งเรียบร้อย");
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("⚠️ Service ถูกติดตั้งแล้ว");
});

svc.on("start", () => {
  console.log("🚀 Service เริ่มทำงานแล้ว (AttendanceEXIM)");
});

svc.on("stop", () => {
  console.log("🛑 Service หยุดทำงานแล้ว");
});

svc.on("uninstall", () => {
  console.log("❌ Service ถูกลบออกแล้ว");
});

// เลือกโหมดจาก argument
const mode = process.argv[2]; // install หรือ uninstall

if (mode === "install") {
  svc.install();
} else if (mode === "uninstall") {
  svc.uninstall();
} else {
  console.log("⚠️ ใช้งาน: node service.js install หรือ node service.js uninstall");
}

