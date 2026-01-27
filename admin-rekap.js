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
    .then(r => r.json())
    .then(d => {
      allData = d;
      filterData();
    });
}

function filterData() {
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const tbody = document.getElementById("rekapGuru");
  tbody.innerHTML = "";

  const rekap = {};

  allData.forEach(d => {
    const t = new Date(d.waktu);
    if (t.getMonth() + 1 == bulan && t.getFullYear() == tahun) {
      if (!rekap[d.nama]) rekap[d.nama] = { Hadir: 0, Sakit: 0, Izin: 0 };
      rekap[d.nama][d.status]++;
    }
  });

  Object.keys(rekap).forEach(n => {
    const r = rekap[n];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${n}</td>
      <td>${r.Hadir}</td>
      <td>${r.Sakit}</td>
      <td>${r.Izin}</td>
      <td><b>${r.Hadir + r.Sakit + r.Izin}</b></td>
    `;
    tbody.appendChild(tr);
  });
}
