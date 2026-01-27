const ADMIN_PASSWORD = "12345";
const API_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

let allData = [];

function login() {
  if (document.getElementById("pass").value !== ADMIN_PASSWORD) {
    alert("❌ Password salah");
    return;
  }
  document.getElementById("panel").style.display = "block";
  loadData();
}

function loadData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allData = data;
      tampilkanData();
    })
    .catch(() => alert("❌ Gagal ambil data"));
}

function tampilkanData() {
  const tbody = document.getElementById("data");
  tbody.innerHTML = "";

  allData.forEach((d, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${new Date(d.waktu).toLocaleString("id-ID")}</td>
      <td>${d.nama}</td>
      <td>${d.status}</td>
      <td>${d.keterangan || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}
