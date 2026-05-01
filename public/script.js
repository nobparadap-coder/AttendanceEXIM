// ===== Utility: Popup =====
function showPopup(type, message) {
  const popup = document.getElementById("popupBox");
  if (!popup) return;
  const icon = document.getElementById("popupIcon");
  const msg = document.getElementById("popupMessage");

  popup.className = `popup show ${type}`;
  msg.innerText = message;

  if (type === "success") icon.className = "fa-solid fa-check-circle";
  else if (type === "error") icon.className = "fa-solid fa-times-circle";
  else icon.className = "fa-solid fa-info-circle";

  setTimeout(() => popup.className = "popup", 3000);
}

// ===== Login Check =====
function checkLogin() {
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");
  if (!user || !role) {
    window.location.href = "login.html";
    return;
  }
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.innerText = `${user} (${role})`;
  if (role === "G5") {
    const adminMenu = document.getElementById("adminMenu");
    if (adminMenu) adminMenu.style.display = "block";
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

function goIndex() { window.location.href = "index.html"; }
function goAdmin() { window.location.href = "admin.html"; }

// ===== Attendance =====
async function checkInGPS() {
  const user = localStorage.getItem("user");
  const today = new Date().toISOString().split("T")[0];
  try {
    const res = await fetch("/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user, date: today, checkin: new Date().toLocaleTimeString(),
        mode: "GPS", month: today.slice(0,7)
      })
    });
    const data = await res.json();
    if (data.success) showPopup("success", "เช็คอินสำเร็จ!");
    else showPopup("error", data.error);
  } catch (err) { showPopup("error", "Server error"); }
}

async function checkOutGPS() {
  const user = localStorage.getItem("user");
  const today = new Date().toISOString().split("T")[0];
  try {
    const res = await fetch("/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user, date: today, checkout: new Date().toLocaleTimeString(),
        mode: "GPS", month: today.slice(0,7)
      })
    });
    const data = await res.json();
    if (data.success) showPopup("success", "เช็คเอาท์สำเร็จ!");
    else showPopup("error", data.error);
  } catch (err) { showPopup("error", "Server error"); }
}

async function submitManual() {
  const user = localStorage.getItem("user");
  const dateIn = document.getElementById("manualDateIn").value;
  const timeIn = document.getElementById("manualTimeIn").value;
  const dateOut = document.getElementById("manualDateOut").value;
  const timeOut = document.getElementById("manualTimeOut").value;
  try {
    const res = await fetch("/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user, date: dateIn, checkin: timeIn,
        checkout: timeOut, mode: "Manual", month: dateIn.slice(0,7)
      })
    });
    const data = await res.json();
    if (data.success) showPopup("success", "บันทึกเวลาเข้า-ออกสำเร็จ!");
    else showPopup("error", data.error);
  } catch (err) { showPopup("error", "Server error"); }
}

async function submitLeave() {
  const user = localStorage.getItem("user");
  const type = document.getElementById("leaveType").value;
  const reason = document.getElementById("leaveReason").value;
  const start = document.getElementById("leaveStartDate").value;
  const end = document.getElementById("leaveEndDate").value;
  const duration = document.getElementById("leaveDuration").value;
  try {
    const res = await fetch("/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user, date: start, leaveType: type, leaveReason: reason,
        mode: "Leave", month: start.slice(0,7), checkout: end, checkin: start, duration
      })
    });
    const data = await res.json();
    if (data.success) showPopup("success", "ส่งคำขอลาสำเร็จ!");
    else showPopup("error", data.error);
  } catch (err) { showPopup("error", "Server error"); }
}

// ===== Report =====
async function loadEmployees() {
  try {
    const res = await fetch("/employees/list");
    const data = await res.json();
    const sel = document.getElementById("filterEmployee");
    if (sel) {
      sel.innerHTML = `<option value="all">-- All Employees --</option>`;
      data.employees.forEach(e => {
        sel.innerHTML += `<option value="${e.name}">${e.name}</option>`;
      });
    }
  } catch (err) { showPopup("error", "โหลดรายชื่อพนักงานล้มเหลว"); }
}

async function loadReport() {
  const month = document.getElementById("filterMonth").value;
  const employee = document.getElementById("filterEmployee").value;
  const mode = document.getElementById("filterMode").value;
  const leaveType = document.getElementById("filterLeaveType").value;
  try {
    const res = await fetch(`/report?month=${month}&employee=${employee}&mode=${mode}&leaveType=${leaveType}`);
    const data = await res.json();
    const table = document.getElementById("reportTable");
    table.innerHTML = "";
    data.records.forEach(r => {
      table.innerHTML += `
        <tr>
          <td>${r.name}</td>
          <td>${r.date}</td>
          <td>${r.checkin || "-"}</td>
          <td>${r.checkout || "-"}</td>
          <td>${r.distance || "-"}</td>
          <td>${r.mode}</td>
          <td>${r.leaveType || ""} ${r.leaveReason || ""}</td>
          <td>${r.checkin && r.checkout ? "Full Day" : "-"}</td>
          <td>${r.mode === "Manual" ? "Admin" : "Employee"}</td>
        </tr>`;
    });
    // Summary
    const summaryBox = document.getElementById("summaryBox");
    summaryBox.innerHTML = `
      <div class="summary-item">Work Days: ${data.summary.workDays}</div>
      <div class="summary-item">Leave Days: ${data.summary.leaveDays}</div>
      <div class="summary-item">Annual: ${data.summary.annual}</div>
      <div class="summary-item">Private: ${data.summary.private}</div>
      <div class="summary-item">Sick: ${data.summary.sick}</div>
      <div class="summary-item">Other: ${data.summary.other}</div>
    `;
    // Chart
    const ctx = document.getElementById("leaveChart").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Annual","Private","Sick","Other"],
        datasets: [{ data: [data.summary.annual, data.summary.private, data.summary.sick, data.summary.other],
          backgroundColor: ["#42a5f5","#66bb6a","#ef5350","#8d6e63"] }]
      }
    });
  } catch (err) { showPopup("error", "โหลดรายงานล้มเหลว"); }
}

async function loadHrAttendance() {
  const month = document.getElementById("filterMonth").value;
  try {
    const res = await fetch(`/report?month=${month}`);
    const data = await res.json();
    const tableHead = document.querySelector("#hrAttendance thead tr");
    const tableBody = document.getElementById("hrAttendanceBody");
    tableHead.innerHTML = "<th>Name</th>";
    tableBody.innerHTML = "";
    // สร้างหัวตารางตามวันที่
    const days = [...new Set(data.records.map(r => r.date))];
    days.forEach(d => tableHead.innerHTML += `<th>${d}</th>`);
    // สร้างข้อมูล
    const employees = [...new Set(data.records.map(r => r.name))];
    employees.forEach(emp => {
      let row = `<tr><td>${emp}</td>`;
      days.forEach(d => {
        const rec = data.records.find(r => r.name === emp && r.date === d);
        if (rec) {
          let code = "-";
          if (rec.mode === "Leave") {
            if (rec.leaveType === "Annual Leave") code = "AN";
            else if (rec.leaveType === "Private Leave") code = "PR";
            else if (rec.leaveType === "Sick Leave") code = "S";
            else if (rec.leaveType === "Other Leave") code = "UPL";
          } else if (rec.mode === "GPS" || rec.mode === "Manual") {
            code = "WO";
          }
          row += `<td class="status-${code}">${code}</td>`;
        } else {
          row += `<td>-</td>`;
        }
      });
      row += "</tr>";
      tableBody.innerHTML += row;
    });
  } catch (err) { showPopup("error", "โหลด HR Attendance ล้มเหลว"); }
}

// ===== Export =====
function exportExcel() {
  window.location.href = "/export-excel";
}

function exportHrReport() {
  window.location.href = "/export-hr-report";
}

// ===== Admin =====
async function addEmployee() {
  const name = document.getElementById("empName").value;
  const role = document.getElementById("empRole").value;
  try {
    const res = await fetch("/employees/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role })
    });
    const data = await res.json();
    if (data.success) showPopup("success", "เพิ่มพนักงานสำเร็จ!");
    else showPopup("error", data.error);
  } catch (err) { showPopup("error", "Server error"); }
}

async function resetData() {
  try {
    const res = await fetch("/admin/reset", { method: "POST" });
    const data = await res.json();
    if (data.success) showPopup("success", "รีเซ็ตข้อมูลสำเร็จ!");
    else showPopup("error", data.error);
  } catch (err) { showPopup("error", "Server error"); }
}

function backupData() {
  window.location.href = "/admin/backup";
}

async function restoreData(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const backup = JSON.parse(reader.result);
      const res = await fetch("/admin/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backup)
      });
      const data = await res.json();
      if (data.success) showPopup("success", "Restore สำเร็จ!");
      else showPopup("error", data.error);
    } catch (err) { showPopup("error", "Restore ล้มเหลว"); }
  };
  reader.readAsText(file);
}

