alert("ADMIN JS SUPER FINAL AKTIF");

// ===============================
// LOGO BASE64 (WAJIB ADA)
// ===============================
const LOGO_KIRI_BASE64 =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABgCAIAAAAbwFLkAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAEA9SURB...";

const LOGO_KANAN_BASE64 =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAADaCAYAAACsGw7eAAAQAElEQVR4Aez9B7xl2XXeB/73iTffl3PlHLuqK3VVp2pU5wYaQBOBQaREi+KMZM/II0sz47E9...";

// ===============================
// KONFIGURASI API (JANGAN DIUBAH)
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbyvAOO76Gwf27nhF9mTJZ_H62VFiGC--ffeG8DHT2N2w2E11MF9NL4d21HeXU6KKfNp/exec";

let allData = [];

// ===============================
// LOGIN (ANTI ERROR)
// ===============================
function login(){
  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");

  if(!userEl || !passEl){
    alert("❌ Elemen login tidak ditemukan");
    return;
  }

  const user = userEl.value.trim();
  const pass = passEl.value.trim();

  if(!user || !pass){
    alert("❗ Username & password wajib diisi");
    return;
  }

  const loading = document.getElementById("loading");
  if(loading) loading.style.display = "block";

  fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(r => r.json())
    .then(res => {
      if(res.status !== "ok"){
        alert("❌ Login admin gagal");
        if(loading) loading.style.display = "none";
        return;
      }

      const loginBox = document.getElementById("loginBox");
      if(loginBox) loginBox.style.display = "none";

      const panel = document.getElementById("panel");
      if(panel) panel.style.display = "block";

      initBulan();
      initTahun();
      loadData();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Tidak dapat terhubung ke server");
      if(loading) loading.style.display = "none";
    });
}

// ===============================
// BULAN
// ===============================
function initBulan(){
  const bulan = document.getElementById("bulan");
  if(!bulan) return;

  const nama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  bulan.innerHTML = "";
  nama.forEach((b,i)=>{
    bulan.innerHTML += `<option value="${i+1}">${b}</option>`;
  });
  bulan.value = new Date().getMonth() + 1;
}

// ===============================
// TAHUN
// ===============================
function initTahun(){
  const tahun = document.getElementById("tahun");
  if(!tahun) return;

  const now = new Date().getFullYear();
  tahun.innerHTML = "";
  for(let i = now - 3; i <= now + 1; i++){
    tahun.innerHTML += `<option value="${i}">${i}</option>`;
  }
  tahun.value = now;
}

// ===============================
// LOAD DATA
// ===============================
function loadData(){
  fetch(API_URL + "?action=admin")
    .then(r => r.json())
    .then(data => {
      allData = Array.isArray(data) ? data : [];
      isiFilterNama();
      tampilkan();
      const loading = document.getElementById("loading");
      if(loading) loading.style.display = "none";
    })
    .catch(err => {
      console.error(err);
      alert("❌ Gagal memuat data");
      const loading = document.getElementById("loading");
      if(loading) loading.style.display = "none";
    });
}

// ===============================
// FILTER NAMA
// ===============================
function isiFilterNama(){
  const f = document.getElementById("filterNama");
  if(!f) return;

  f.innerHTML = `<option value="">Semua</option>`;
  [...new Set(allData.map(d => d.nama))].forEach(n => {
    f.innerHTML += `<option value="${n}">${n}</option>`;
  });
}

// ===============================
// TAMPILKAN DATA
// ===============================
function tampilkan(){
  const bulan = document.getElementById("bulan")?.value;
  const tahun = document.getElementById("tahun")?.value;
  const nama = document.getElementById("filterNama")?.value;
  const tbody = document.getElementById("data");
  if(!tbody) return;

  tbody.innerHTML = "";
  let no = 1;

  allData.forEach(d => {
    const t = new Date(d.waktu);
    if(
      t.getMonth()+1 == bulan &&
      t.getFullYear() == tahun &&
      (nama === "" || d.nama === nama)
    ){
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

// ===============================
// CETAK PDF DINAS (FIX BOLD)
// ===============================
function cetakPDF(){
  if(document.querySelectorAll("#data tr").length === 0){
    alert("❗ Data kosong");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  // LOGO
  doc.addImage(LOGO_KIRI_BASE64,"PNG",15,10,20,20);
  doc.addImage(LOGO_KANAN_BASE64,"PNG",175,10,20,20);

  // KOP
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

  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("REKAP ABSENSI BULANAN",105,55,{align:"center"});

  doc.autoTable({
    startY: 60,
    head: [["No","Tanggal","Nama","Status","Keterangan"]],
    body: [...document.querySelectorAll("#data tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    ),
    styles: { fontSize: 9 }
  });

  // RESET FONT TOTAL (KUNCI)
  doc.setFont("times");
  doc.setFont(undefined,"normal");
  doc.setFontSize(11);

  const y = doc.lastAutoTable.finalY + 12;

  const bulanNama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  const now = new Date();
  const tanggalResmi = now.getDate()+" "+bulanNama[now.getMonth()]+" "+now.getFullYear();

  doc.text("Bungkolo, " + tanggalResmi, 140, y);
  doc.text("Mengetahui,", 140, y + 6);
  doc.text("Kepala Sekolah", 140, y + 12);
  doc.text(" ", 140, y + 22);
  doc.text("Muhammad Ali", 140, y + 30);
  doc.text("NIP. 196xxxxxxxxxxxx", 140, y + 36);

  doc.save("Rekap_Absensi_SMKS_Barakati.pdf");
}
