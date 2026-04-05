// ===== Global Variables =====
let attendanceData = JSON.parse(localStorage.getItem("attendanceData")) || [];

// ===== Save Attendance =====
function submitAttendance(record) {
  attendanceData.push(record);
  localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  showPopup("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
}

// ===== Load Attendance =====
function loadAttendance() {
  const tableBody = document.querySelector("#reportTable tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";
  let workDays = 0, leaveDays = 0;

  attendanceData.forEach(rec => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rec.name}</td>
      <td>${rec.date}</td>
      <td>${rec.checkin}</td>
      <td>${rec.checkout}</td>
      <td>${rec.mode}</td>
      <td>${rec.leaveType}</td>
    `;
    tableBody.appendChild(row);

    if (rec.mode === "Leave") leaveDays++;
    else workDays++;
  });

  const summary = document.getElementById("summaryText");
  if (summary) {
    summary.innerText = `Work Days: ${workDays} | Leave Days: ${leaveDays} | Total Records: ${attendanceData.length}`;
  }
}

// ===== Popup =====
function showPopup(message, type="info") {
  const popup = document.getElementById("popupBox");
  const icon = document.getElementById("popupIcon");
  const msg = document.getElementById("popupMessage");

  msg.innerText = message;
  popup.className = `popup show ${type}`;

  // icon ตามประเภท
  if (type === "success") icon.className = "fa-solid fa-check-circle";
  else if (type === "error") icon.className = "fa-solid fa-times-circle";
  else icon.className = "fa-solid fa-info-circle";

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

// ===== Export to Excel (Mock) =====
function exportExcel() {
  showPopup("Export to Excel สำเร็จ", "success");
  // TODO: ใช้ XLSX.js หรือ SheetJS สำหรับ export จริง
}

// ===== Admin Functions =====
function resetData() {
  if (confirm("คุณแน่ใจว่าจะลบข้อมูลทั้งหมด?")) {
    attendanceData = [];
    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
    loadAttendance();
    showPopup("รีเซ็ตข้อมูลเรียบร้อยแล้ว", "success");
  }
}

function addUser() {
  showPopup("Add User function ยังไม่ implement", "info");
}

function editQuota() {
  showPopup("Edit Quota function ยังไม่ implement", "info");
}

