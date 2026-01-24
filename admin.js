/*************************************************
 * ADMIN ABSENSI SMSKS
 *************************************************/

// ================================
// GANTI DI SINI DENGAN URL WEB APP
// ================================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyx8Ig_nb0TBW871KU4aDEsYEE-owzTzC0BfSjVHXCKgjjo0vP7cEi_51wgDQ_yQKF0/exec";

// Password admin
const ADMIN_PASS = "admin123";

// Variabel global
let dataAbsensi = [];
let filteredData = [];

// ===== LOGIN ADMIN =====
function login() {
  const pass = document.getElementById("pass").value;
  if (pass !== ADMIN_PASS) {
    alert("Password salah");
    return;
  }
  document.getElementById("panel").style.display = "block";
  loadData();
}

// ===== LOAD DATA DARI SHEETS =====
function loadData() {
  document.getElementById("loading").innerText = "⏳ Memuat data...";
  fetch(SHEET_URL + "?action=getAll")
    .then(res => res.json())
    .then(json => {
      dataAbsensi = json;
      filteredData = json;
      renderRekap();
      document.getElementById("loading").innerText = "";
      document.getElementById("btnCetak").disabled = false;

      // Isi dropdown nama
      const namaDropdown = document.getElementById("filterNama");
      const namaSet = new Set(json.map(d => d.nama));
      namaDropdown.innerHTML = '<option value="">Semua</option>';
      namaSet.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n; opt.text = n;
        namaDropdown.appendChild(opt);
      });
    })
    .catch(err => {
      alert("❌ Gagal load data: " + err);
      document.getElementById("loading").innerText = "";
    });
}

// ===== RENDER REKAP KE TABEL =====
function renderRekap() {
  const rekap = {};
  filteredData.forEach(d => {
    if (!rekap[d.nama]) rekap[d.nama] = { Hadir: 0, Sakit: 0, Izin: 0 };
    rekap[d.nama][d.status]++;
  });
  const tbody = document.getElementById("rekapGuru");
  tbody.innerHTML = "";
  Object.keys(rekap).forEach(nama => {
    const total = rekap[nama].Hadir + rekap[nama].Sakit + rekap[nama].Izin;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${nama}</td>
                    <td>${rekap[nama].Hadir}</td>
                    <td>${rekap[nama].Sakit}</td>
                    <td>${rekap[nama].Izin}</td>
                    <td>${total}</td>`;
    tbody.appendChild(tr);
  });
}

// ===== FILTER DATA BERDASARKAN NAMA =====
function filterData() {
  const nama = document.getElementById("filterNama").value;
  filteredData = nama ? dataAbsensi.filter(d => d.nama === nama) : dataAbsensi;
  renderRekap();
}

// ===== CETAK PDF REKAP =====
function cetakPDFRekap() {
  const doc = new jspdf.jsPDF();
  doc.text("Rekap Absensi Bulanan", 14, 10);

  const rows = [];
  const rekap = {};
  filteredData.forEach(d => {
    if (!rekap[d.nama]) rekap[d.nama] = { Hadir: 0, Sakit: 0, Izin: 0 };
    rekap[d.nama][d.status]++;
  });
  Object.keys(rekap).forEach(nama => {
    const total = rekap[nama].Hadir + rekap[nama].Sakit + rekap[nama].Izin;
    rows.push([nama, rekap[nama].Hadir, rekap[nama].Sakit, rekap[nama].Izin, total]);
  });

  doc.autoTable({
    head: [["Nama", "Hadir", "Sakit", "Izin", "Total"]],
    body: rows
  });

  // ===== TTD Kepala Sekolah + Tanggal =====
  const ttdImg = new Image();
  ttdImg.src = "ttd_kepsek.png"; // pastikan ada di folder
  doc.addImage(ttdImg, "PNG", 140, doc.lastAutoTable.finalY + 10, 40, 20);

  const tgl = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  doc.text(`Muna Barat, ${tgl}`, 140, doc.lastAutoTable.finalY + 35);
  doc.text("Kepala Sekolah,", 140, doc.lastAutoTable.finalY + 42);
  doc.text("Muhammad Ali", 140, doc.lastAutoTable.finalY + 65);

  doc.save("Rekap_Absensi_Bulanan.pdf");
}
