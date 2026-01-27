// ===============================
// KONFIGURASI
// ===============================
const ADMIN_PASSWORD = "12345"; 
const API_URL = "https://script.google.com/macros/s/AKfycbxk8qvZrQSbtHBhE1jEKBBhYk8E8dG4FlEB_pn8BiX-BIGsVetsAEmqRJa2KtSAs-SU/exec";

// ===============================
let allData = [];

// ===============================
// LOGIN
// ===============================
function login() {
  const pass = document.getElementById("pass").value;
  if (pass !== ADMIN_PASSWORD) {
    alert("❌ Password salah");
    return;
  }

  document.getElementById("panel").style.display = "block";
  document.getElementById("loading").style.display = "block";

  initBulan();
  loadData();
}

// ===============================
// INISIAL BULAN
// ===============================
function initBulan() {
  const bulan = document.getElementById("bulan");
  const namaBulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  bulan.innerHTML = "";
  namaBulan.forEach((b, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = b;
    bulan.appendChild(opt);
  });

  bulan.value = new Date().getMonth() + 1;
  bulan.disabled = false;
  document.getElementById("tahun").disabled = false;
}

// ===============================
// LOAD DATA
// ===============================
function loadData() {
  document.getElementById("loading").style.display = "block";

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      allData = data;
      isiFilterNama();
      filterData();
      document.getElementById("btnCetak").disabled = false;
      document.getElementById("loading").style.display = "none";
    })
    .catch(err => {
      alert("❌ Gagal memuat data");
      console.error(err);
    });
}

// ===============================
// ISI FILTER NAMA
// ===============================
function isiFilterNama() {
  const select = document.getElementById("filterNama");
  select.innerHTML = `<option value="">Semua</option>`;

  const namaUnik = [...new Set(allData.map(d => d.nama))];
  namaUnik.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    select.appendChild(opt);
  });
}

// ===============================
// FILTER & REKAP DATA
// ===============================
function filterData() {
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const namaFilter = document.getElementById("filterNama").value;

  const rekap = {};

  allData.forEach(d => {
    const tgl = new Date(d.tanggal);
    if (
      tgl.getMonth() + 1 == bulan &&
      tgl.getFullYear() == tahun &&
      (namaFilter === "" || d.nama === namaFilter)
    ) {
      if (!rekap[d.nama]) {
        rekap[d.nama] = { Hadir: 0, Sakit: 0, Izin: 0 };
      }
      if (rekap[d.nama][d.status] !== undefined) {
        rekap[d.nama][d.status]++;
      }
    }
  });

  const tbody = document.getElementById("rekapGuru");
  tbody.innerHTML = "";

  Object.keys(rekap).forEach(nama => {
    const r = rekap[nama];
    const total = r.Hadir + r.Sakit + r.Izin;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nama}</td>
      <td>${r.Hadir}</td>
      <td>${r.Sakit}</td>
      <td>${r.Izin}</td>
      <td><b>${total}</b></td>
    `;
    tbody.appendChild(tr);
  });
}

// ===============================
// CETAK PDF REKAP
// ===============================
function cetakPDFRekap() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("REKAP ABSENSI BULANAN", 14, 15);

  doc.autoTable({
    startY: 20,
    head: [["Nama","Hadir","Sakit","Izin","Total"]],
    body: [...document.querySelectorAll("#rekapGuru tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    )
  });

  doc.save("Rekap_Absensi.pdf");
}
