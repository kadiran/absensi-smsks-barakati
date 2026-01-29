alert("ADMIN JS FINAL AKTIF");

// ===============================
// KONFIGURASI
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbwIsnsQIdCDHgOW6cglp3gY-Y901xjFRZ1ICY6FUcK-EpdBEjeJVdlyHUPe5_UQozou/exec";

let roleUser = "";
let allData = [];

// ===============================
// LOGIN
// ===============================
function login() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if (!user || !pass) {
    alert("❗ Username dan password wajib diisi");
    return;
  }

  document.getElementById("loading").style.display = "block";

  fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(r => r.json())
    .then(res => {
      if (res.status !== "ok") {
        alert("❌ Username atau password salah");
        document.getElementById("loading").style.display = "none";
        return;
      }

      roleUser = res.role;

      document.getElementById("panel").style.display = "block";

      // Info role
      if (document.getElementById("roleInfo")) {
        document.getElementById("roleInfo").innerText =
          roleUser === "admin"
            ? "MODE ADMIN (Akses Penuh)"
            : "MODE KEPALA SEKOLAH (Read Only)";
      }

      initBulan();
      loadData();
    })
    .catch(() => {
      alert("❌ Tidak dapat terhubung ke server");
      document.getElementById("loading").style.display = "none";
    });
}

// ===============================
// INIT BULAN
// ===============================
function initBulan() {
  const bulan = document.getElementById("bulan");
  const nama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  bulan.innerHTML = "";
  nama.forEach((b, i) => {
    bulan.innerHTML += `<option value="${i + 1}">${b}</option>`;
  });

  bulan.value = new Date().getMonth() + 1;
}

// ===============================
// LOAD DATA
// ===============================
function loadData() {
  fetch(`${API_URL}?action=data`)
    .then(r => r.json())
    .then(data => {
      allData = data;
      tampilkan();
      document.getElementById("loading").style.display = "none";
    })
    .catch(() => {
      alert("❌ Gagal memuat data");
      document.getElementById("loading").style.display = "none";
    });
}

function refreshData() {
  loadData();
}

// ===============================
// TAMPILKAN DATA
// ===============================
function tampilkan() {
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const tbody = document.getElementById("data");

  tbody.innerHTML = "";
  let no = 1;

  allData.forEach(d => {
    const t = new Date(d.waktu);

    if (t.getMonth() + 1 == bulan && t.getFullYear() == tahun) {
      tbody.innerHTML += `
        <tr>
          <td>${no++}</td>
          <td>${t.toLocaleDateString("id-ID")}</td>
          <td>${d.nama}</td>
          <td>${d.status}</td>
          <td>${d.keterangan || "-"}</td>
        </tr>
      `;
    }
  });
}

// ===============================
// CETAK PDF DINAS RESMI
// ===============================
function cetakPDF() {
  if (document.querySelectorAll("#data tr").length === 0) {
    alert("❗ Data kosong, tidak bisa dicetak");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  // Judul
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text("REKAP ABSENSI BULANAN", 105, 20, { align: "center" });

  // Tabel
  doc.autoTable({
    startY: 30,
    head: [["No", "Tanggal", "Nama", "Status", "Keterangan"]],
    body: [...document.querySelectorAll("#data tr")]
      .map(tr => [...tr.children].map(td => td.innerText)),
    styles: {
      font: "times",
      fontSize: 10
    }
  });

  // ===== FORMAT TANGGAL RESMI =====
  const bulanNama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  const now = new Date();
  const tanggalResmi =
    now.getDate() + " " +
    bulanNama[now.getMonth()] + " " +
    now.getFullYear();

  const y = doc.lastAutoTable.finalY + 15;

  // TTD
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("Bungkolo, " + tanggalResmi, 140, y);
  doc.text("Mengetahui,", 140, y + 6);
  doc.text("Kepala Sekolah", 140, y + 12);

  // spasi khusus tanda tangan
  doc.text(" ", 140, y + 22);

  doc.text("Muhammad Ali", 140, y + 30);
  doc.text("NIP. 196xxxxxxxxxxxx", 140, y + 36);

  doc.save("Rekap_Absensi_Dinas_SMKS_Barakati.pdf");
}
