alert("ADMIN JS PROFESIONAL AKTIF");

// ===============================
// LOGO BASE64 (AMAN)
// ===============================
const LOGO_KIRI_BASE64 =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF4AAABgCAIAAAAbwFLkAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAEA9SURB..."; 
// ⬆️ POTONGAN, JANGAN DIUBAH

const LOGO_KANAN_BASE64 =
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAADaCAYAAACsGw7eAAAQAElEQVR4Aez9B7xl2XXeB/73iTffl3PlHLuqK3VVp2pU5wYaQBOBQaREi+KMZM/II0sz47E9...";
// ⬆️ POTONGAN, JANGAN DIUBAH

// ===============================
// KONFIGURASI API
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbyvAOO76Gwf27nhF9mTJZ_H62VFiGC--ffeG8DHT2N2w2E11MF9NL4d21HeXU6KKfNp/exec";

let allData = [];

// ================= LOGIN =================
function login(){
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
function initBulan(){
  const bulan = document.getElementById("bulan");
  const nama = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  bulan.innerHTML = "";
  nama.forEach((b,i)=>{
    bulan.innerHTML += `<option value="${i+1}">${b}</option>`;
  });

  bulan.value = new Date().getMonth()+1;
}

// ================= LOAD DATA =================
function loadData(){
  fetch(API_URL + "?action=admin")
    .then(r=>r.json())
    .then(data=>{
      allData = data;
      isiFilterNama();
      tampilkan();
      document.getElementById("loading").style.display = "none";
    })
    .catch(()=>{
      alert("❌ Gagal memuat data");
      document.getElementById("loading").style.display = "none";
    });
}

// ================= FILTER NAMA =================
function isiFilterNama(){
  const f = document.getElementById("filterNama");
  f.innerHTML = `<option value="">Semua</option>`;

  [...new Set(allData.map(d=>d.nama))].forEach(n=>{
    f.innerHTML += `<option value="${n}">${n}</option>`;
  });
}

// ================= TAMPILKAN =================
function tampilkan(){
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const nama = document.getElementById("filterNama").value;
  const tbody = document.getElementById("data");

  tbody.innerHTML = "";
  let no = 1;

  allData.forEach(d=>{
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
        </tr>
      `;
    }
  });
}

// ================= CETAK PDF RESMI =================
function loadImage(url){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject("Logo gagal dimuat");
    img.src = url;
  });
}

async function cetakPDF(){
  if(document.querySelectorAll("#data tr").length === 0){
    alert("❗ Data kosong, tidak bisa dicetak");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  try{
    const logoKiri = await loadImage("logo_kiri.png");
    const logoKanan = await loadImage("logo_kanan.png");

    doc.addImage(logoKiri, "PNG", 15, 10, 20, 20);
    doc.addImage(logoKanan, "PNG", 175, 10, 20, 20);
  }catch(e){
    alert("❌ Logo tidak ditemukan");
    return;
  }

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
    styles:{ fontSize:9 }
  });

  const y = doc.lastAutoTable.finalY + 15;
  const tgl = new Date().toLocaleDateString("id-ID");

  doc.text("Muna Barat, " + tgl, 140, y);
  doc.text("Kepala Sekolah,", 140, y+10);
  doc.setFont("times","bold");
  doc.text("Muhammad Ali", 140, y+30);

  doc.save("Rekap_Absensi_SMKS_Barakati.pdf");
}
