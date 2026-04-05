const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // สามารถเพิ่มฟังก์ชัน custom ได้ เช่น เรียก API ของ server.js
});
