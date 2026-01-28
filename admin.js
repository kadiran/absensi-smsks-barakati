alert("ADMIN JS PROFESIONAL AKTIF");

// ===============================
// KONFIGURASI API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbyvAOO76Gwf27nhF9mTJZ_H62VFiGC--ffeG8DHT2N2w2E11MF9NL4d21HeXU6KKfNp/exec";

let allData = [];

// ===============================
// LOGIN ADMIN
// ===============================
function login(){
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if(!user || !pass){
    alert("❗ Username dan password wajib diisi");
    return;
  }

  document.getElementById("loading").style.display = "block";

  fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(res => res.json())
    .then(data => {
      if(data.status !== "ok"){
        alert("❌ Login gagal");
        document.getElementById("loading").style.display = "none";
        return;
      }

      document.getElementById("panel").style.display = "block";
      initBulan();
      loadData();
    })
    .catch(() => {
      alert("❌ Tidak dapat terhubung ke server");
      document.getElementById("loading").style.display = "none";
    });
}

// ===============================
// BULAN
// ===============================
function initBulan(){
  const bulan = document.getElementById("bulan");
  const namaBulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  bulan.innerHTML = "";
  namaBulan.forEach((b,i)=>{
    bulan.innerHTML += `<option value="${i+1}">${b}</option>`;
  });

  bulan.value = new Date().getMonth() + 1;
}

// ===============================
// LOAD DATA ADMIN
// ===============================
function loadData(){
  fetch(API_URL + "?action=admin")
    .then(res => res.json())
    .then(data => {
      allData = data;
      isiFilterNama();
      tampilkan();
      document.getElementById("loading").style.display = "none";
    })
    .catch(() => {
      alert("❌ Gagal memuat data");
      document.getElementById("loading").style.display = "none";
    });
}

// ===============================
// FILTER NAMA
// ===============================
function isiFilterNama(){
  const filter = document.getElementById("filterNama");
  filter.innerHTML = `<option value="">Semua</option>`;

  [...new Set(allData.map(d => d.nama))].forEach(nama => {
    filter.innerHTML += `<option value="${nama}">${nama}</option>`;
  });
}

// ===============================
// TAMPILKAN DATA
// ===============================
function tampilkan(){
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const nama = document.getElementById("filterNama").value;
  const tbody = document.getElementById("data");

  tbody.innerHTML = "";
  let no = 1;

  allData.forEach(d => {
    const tgl = new Date(d.waktu);

    if(
      (tgl.getMonth()+1 == bulan) &&
      (tgl.getFullYear() == tahun) &&
      (nama === "" || d.nama === nama)
    ){
      tbody.innerHTML += `
        <tr>
          <td>${no++}</td>
          <td>${tgl.toLocaleDateString("id-ID")}</td>
          <td>${d.nama}</td>
          <td>${d.status}</td>
          <td>${d.keterangan || "-"}</td>
        </tr>
      `;
    }
  });
}

// ===============================
// LOAD GAMBAR (LOGO)
// ===============================
function loadImage(src){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject("Logo tidak ditemukan");
    img.src = src;
  });
}

// ===============================
// CETAK PDF RESMI SEKOLAH
// ===============================
async function cetakPDF(){
  const rows = document.querySelectorAll("#data tr");
  if(rows.length === 0){
    alert("❗ Data kosong, tidak bisa dicetak");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  // ================= LOGO (BASE64 - AMAN)
  doc.addImage(LOGO_KIRI_BASE64, "PNG", 15, 10, 20, 20);
  doc.addImage(LOGO_KANAN_BASE64, "PNG", 175, 10, 20, 20);

  // ================= KOP SEKOLAH
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("PEMERINTAH PROVINSI SULAWESI TENGGARA",105,15,{align:"center"});
  doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN",105,21,{align:"center"});
  doc.text("SEKOLAH MENENGAH KEJURUAN",105,27,{align:"center"});
  doc.setFontSize(14);
  doc.text("SMKS BARAKATI MUNA BARAT",105,33,{align:"center"});

  doc.setFont("times","normal");
  doc.setFontSize(9);
  doc.text(
    "Jl. Pendidikan Desa Bungkolo, Kecamatan Barangka, Kabupaten Muna Barat\n" +
    "Telp/Hp. 0821 9613 6833 | Email: smk.barakati@yahoo.com",
    105,40,{align:"center"}
  );

  doc.line(15,45,195,45);

  // ================= JUDUL
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("REKAP ABSENSI BULANAN",105,55,{align:"center"});

  // ================= TABEL
  doc.autoTable({
    startY: 60,
    head: [["No","Tanggal","Nama","Status","Keterangan"]],
    body: [...rows].map(tr =>
      [...tr.children].map(td => td.innerText)
    ),
    styles:{ fontSize:9 }
  });

  // ================= TANGGAL OTOMATIS SESUAI FILTER
  const bulanNama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;

  const tanggalCetak = `Bungkolo, 29 ${bulanNama[bulan-1]} ${tahun}`;

  // ================= TANDA TANGAN (KANAN)
  const y = doc.lastAutoTable.finalY + 12;

  doc.setFont("times","normal");
  doc.setFontSize(10);
  doc.text(tanggalCetak, 140, y);
  doc.text("Mengetahui,", 140, y + 5);
  doc.text("Kepala Sekolah", 140, y + 10);

  // gambar tanda tangan
  try{
    doc.addImage("ttd_kepsek.png","PNG",138, y + 13, 40, 18);
  }catch(e){
    alert("❗ Gambar tanda tangan tidak ditemukan");
  }

  doc.text("Muhammad Ali", 140, y + 35);
  doc.text("NIP. 1978xxxxxxxxxxxx", 140, y + 40);

  // ================= SIMPAN
  doc.save("Rekap_Absensi_SMKS_Barakati.pdf");
}








