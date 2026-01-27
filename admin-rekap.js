const ADMIN_PASSWORD = "12345";
const API_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

let allData = [];

function login() {
  if (document.getElementById("pass").value !== ADMIN_PASSWORD) {
    alert("❌ Password salah");
    return;
  }
  document.getElementById("panel").style.display = "block";
  initBulan();
  loadData();
}

function initBulan() {
  const bulan = document.getElementById("bulan");
  bulan.innerHTML = "";
  ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"].forEach((b,i)=>{
    bulan.innerHTML += `<option value="${i+1}">${b}</option>`;
  });
  bulan.value = new Date().getMonth() + 1;
}

function loadData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allData = data;
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
    const tgl = new Date(d.waktu); // ✅ FIX PENTING
    if (tgl.getMonth()+1 == bulan && tgl.getFullYear() == tahun) {
      if (!rekap[d.nama]) rekap[d.nama] = { Hadir:0, Sakit:0, Izin:0 };
      if (rekap[d.nama][d.status] !== undefined) rekap[d.nama][d.status]++;
    }
  });

  Object.keys(rekap).forEach(nama => {
    const r = rekap[nama];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nama}</td>
      <td>${r.Hadir}</td>
      <td>${r.Sakit}</td>
      <td>${r.Izin}</td>
      <td><b>${r.Hadir + r.Sakit + r.Izin}</b></td>
    `;
    tbody.appendChild(tr);
  });
}
