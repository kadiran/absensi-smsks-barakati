alert("ADMIN JS FINAL PROFESIONAL AKTIF");

// ===============================
// LOGO BASE64 AMAN
// ===============================
const LOGO_KIRI_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABg..."; // Ganti sesuai Base64
const LOGO_KANAN_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAADa..."; // Ganti sesuai Base64

// ===============================
// KONFIGURASI API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbyvAOO76Gwf27nhF9mTJZ_H62VFiGC--ffeG8DHT2N2w2E11MF9NL4d21HeXU6KKfNp/exec";
let allData = [];

// ================= LOGIN =================
function login() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if(!user || !pass){
    alert("❗ Username & password wajib diisi");
    return;
  }

  document.getElementById("loading").style.display = "block";

  fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(r => r.json())
    .then(res => {
      if(res.status !== "ok"){
        alert("❌ Login admin gagal");
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

// ================= BULAN =================
function initBulan() {
  const bulan = document.getElementById("bulan");
  const namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  
  bulan.innerHTML = "";
  namaBulan.forEach((b,i)=>bulan.innerHTML += `<option value="${i+1}">${b}</option>`);
  bulan.value = new Date().getMonth()+1;
}

// ================= LOAD DATA =================
function loadData() {
  fetch(API_URL + "?action=admin")
    .then(r => r.json())
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

// ================= FILTER NAMA =================
function isiFilterNama() {
  const f = document.getElementById("filterNama");
  f.innerHTML = `<option value="">Semua</option>`;
  [...new Set(allData.map(d=>d.nama))].forEach(n=>f.innerHTML += `<option value="${n}">${n}</option>`);
}

// ================= TAMPILKAN =================
function tampilkan() {
  const bulan = parseInt(document.getElementById("bulan").value);
  const tahun = parseInt(document.getElementById("tahun").value);
  const nama = document.getElementById("filterNama").value;
  const tbody = document.getElementById("data");

  tbody.innerHTML = "";
  let no = 1;

  allData.forEach(d => {
    const t = new Date(d.waktu);
    if(t.getMonth()+1 === bulan && t.getFullYear() === tahun && (nama === "" || d.nama === nama)){
      tbody.innerHTML += `
        <tr>
          <td>${no++}</td>
          <td>${t.toLocaleDateString("id-ID")}</td>
          <td>${d.nama}</td>
          <td>${d.status}</td>
          <td>${d.keterangan || "-"}</td>
        </tr>`;
    }
  });
}

// ================= REFRESH =================
function refreshData() {
  document.getElementById("loading").style.display = "block";
  loadData();
}

// ================= HITUNG REKAP BULANAN =================
function hitungRekapBulanan() {
  const bulan = parseInt(document.getElementById("bulan").value);
  const tahun = parseInt(document.getElementById("tahun").value);
  const rekap = {};

  allData.forEach(d=>{
    const t = new Date(d.waktu);
    if(t.getMonth()+1 === bulan && t.getFullYear() === tahun){
      if(!rekap[d.nama]) rekap[d.nama] = {Hadir:0,Sakit:0,Izin:0,Alfa:0};
      if(d.status==="Hadir") rekap[d.nama].Hadir++;
      else if(d.status==="Sakit") rekap[d.nama].Sakit++;
      else if(d.status==="Izin") rekap[d.nama].Izin++;
      else rekap[d.nama].Alfa++;
    }
  });
  return rekap;
}

// ================= CETAK PDF RESMI =================
function cetakPDF() {
  if(document.querySelectorAll("#data tr").length===0){
    alert("❗ Data kosong, tidak bisa dicetak");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  // ===== LOGO =====
  doc.addImage(LOGO_KIRI_BASE64,"PNG",15,10,20,20);
  doc.addImage(LOGO_KANAN_BASE64,"PNG",175,10,20,20);

  // ===== KOP SEKOLAH =====
  doc.setFont("times","bold").setFontSize(12);
  doc.text("PEMERINTAH PROVINSI SULAWESI TENGGARA",105,15,{align:"center"});
  doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN",105,21,{align:"center"});
  doc.text("SEKOLAH MENENGAH KEJURUAN",105,27,{align:"center"});
  doc.setFontSize(14).text("SMKS BARAKATI MUNA BARAT",105,33,{align:"center"});

  doc.setFont("times","normal").setFontSize(9);
  doc.text("Jl. Pendidikan Desa Bungkolo, Kecamatan Barangka, Kabupaten Muna Barat\nTelp/Hp. 0821 9613 6833 | Email: smk.barakati@yahoo.com",105,40,{align:"center"});
  doc.line(15,45,195,45);

  // ===== JUDUL =====
  doc.setFont("times","bold").setFontSize(12);
  doc.text("REKAP ABSENSI BULANAN",105,55,{align:"center"});

  // ===== TABEL ABSENSI DETAIL =====
  doc.autoTable({
    startY:60,
    head:[["No","Tanggal","Nama","Status","Keterangan"]],
    body:[...document.querySelectorAll("#data tr")].map(tr => [...tr.children].map(td => td.innerText)),
    styles:{fontSize:9}
  });

  // ===== TABEL REKAP KEHADIRAN =====
  const rekap = hitungRekapBulanan();
  const bodyRekap = Object.keys(rekap).map((nama,idx)=>[idx+1,nama,rekap[nama].Hadir,rekap[nama].Sakit,rekap[nama].Izin,rekap[nama].Alfa]);

  const yRekap = doc.lastAutoTable.finalY + 10;
  doc.setFont("times","bold").setFontSize(11);
  doc.text("Rekap Jumlah Kehadiran per Bulan",105,yRekap,{align:"center"});

  doc.autoTable({
    startY: yRekap+5,
    head:[["No","Nama","Hadir","Sakit","Izin","Alfa"]],
    body:bodyRekap,
    styles:{fontSize:9}
  });

  // ===== TTD =====
  const yTTD = doc.lastAutoTable.finalY + 10;
  const bulan = parseInt(document.getElementById("bulan").value);
  const tahun = parseInt(document.getElementById("tahun").value);
  doc.setFont("times","normal").setFontSize(10);
  doc.text(`Bungkolo, ${tanggalFormat(bulan,tahun)}`,140,yTTD);
  doc.text("Mengetahui,",140,yTTD+6);
  doc.text("Kepala Sekolah,",140,yTTD+12);
  doc.text("Muhammad Ali",140,yTTD+24);
  doc.text("NIP: 1234567890",140,yTTD+30);

  doc.save("Rekap_Absensi_SMKS_Barakati.pdf");
}

// ================= HELPER =================
function tanggalFormat(bulan,tahun){
  const namaBulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  return `${namaBulan[bulan-1]} ${tahun}`;
}
