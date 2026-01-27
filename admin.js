// ===============================
// KONFIGURASI
// ===============================
const ADMIN_PASSWORD = "12345"; // 🔴 GANTI PASSWORD ADMIN
const API_URL = "https://script.google.com/macros/s/AKfycbxk8qvZrQSbtHBhE1jEKBBhYk8E8dG4FlEB_pn8BiX-BIGsVetsAEmqRJa2KtSAs-SU/exec";

// ===============================
let allData = [];

// ===============================
// LOGIN ADMIN
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
// INISIAL BULAN (0–11)
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
    opt.value = i; // 0–11
    opt.textContent = b;
    bulan.appendChild(opt);
  });

  bulan.value = new Date().getMonth();
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
// FILTER NAMA
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
// FILTER DATA
// ===============================
function filterData() {
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const nama = document.getElementById("filterNama").value;

  const tbody = document.getElementById("data");
  tbody.innerHTML = "";

  let no = 1;
  const hasil = allData.filter(d => {
    const tgl = new Date(d.waktu); // ✅ BENAR
    return (
      tgl.getMonth() == bulan &&
      tgl.getFullYear() == tahun &&
      (nama === "" || d.nama === nama)
    );
  });

  hasil.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${no++}</td>
      <td>${new Date(d.waktu).toLocaleDateString("id-ID")}</td>
      <td>${d.nama}</td>
      <td>${d.status}</td>
      <td>${d.keterangan || "-"}</td>
    `;
    tbody.appendChild(tr);
  });

  rekapData(hasil);
}

// ===============================
// REKAP PER NAMA
// ===============================
function rekapData(data) {
  const rekap = {};
  data.forEach(d => {
    if (!rekap[d.nama]) {
      rekap[d.nama] = { Hadir: 0, Sakit: 0, Izin: 0 };
    }
    if (rekap[d.nama][d.status] !== undefined) {
      rekap[d.nama][d.status]++;
    }
  });

  const tbody = document.getElementById("rekapGuru");
  tbody.innerHTML = "";

  Object.keys(rekap).forEach(nama => {
    const r = rekap[nama];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nama}</td>
      <td>${r.Hadir}</td>
      <td>${r.Sakit}</td>
      <td>${r.Izin}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===============================
// CETAK PDF BULANAN
// ===============================
function cetakPDFBulanan() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("LAPORAN ABSENSI BULANAN", 14, 15);
  doc.text("SMSKS Barakati Muna Barat", 14, 22);

  doc.autoTable({
    startY: 30,
    head: [["No","Tanggal","Nama","Status","Keterangan"]],
    body: [...document.querySelectorAll("#data tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    )
  });

  doc.save("Laporan_Absensi_Bulanan.pdf");
}
