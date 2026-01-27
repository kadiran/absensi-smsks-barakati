const API_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

let semuaData = [];

window.onload = () => {
  const bln = document.getElementById("bulan");
  ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]
    .forEach((b,i)=> bln.innerHTML += `<option value="${i+1}">${b}</option>`);
  bln.value = new Date().getMonth()+1;
  loadData();
};

function loadData(){
  fetch(API_URL)
    .then(r=>r.json())
    .then(d=>{
      semuaData = d;
      tampilkan();
    });
}

function tampilkan(){
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const tbody = document.getElementById("data");
  tbody.innerHTML = "";

  let no = 1;
  semuaData.forEach(d=>{
    const t = new Date(d.waktu);
    if(t.getMonth()+1==bulan && t.getFullYear()==tahun){
      tbody.innerHTML += `
        <tr>
          <td>${no++}</td>
          <td>${t.toLocaleString("id-ID")}</td>
          <td>${d.nama}</td>
          <td>${d.status}</td>
          <td>${d.keterangan||"-"}</td>
        </tr>`;
    }
  });
}

function refresh(){
  loadData();
}

// =======================
// CETAK PDF RESMI SEKOLAH
// =======================
function cetakPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  // LOGO
  doc.addImage("logo_kiri.png","PNG",15,10,25,25);
  doc.addImage("logo_kanan.png","PNG",170,10,25,25);

  // KOP
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("PEMERINTAH PROVINSI SULAWESI TENGGARA",105,15,{align:"center"});
  doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN",105,21,{align:"center"});
  doc.text("SEKOLAH MENENGAH KEJURUAN",105,27,{align:"center"});
  doc.setFontSize(14);
  doc.text("SMKS BARAKATI MUNA BARAT",105,33,{align:"center"});

  doc.setFont("times","normal");
  doc.setFontSize(10);
  doc.text(
    "Jl. Pendidikan Desa Bungkollo, Kecamatan Barangka, Kabupaten Muna Barat",
    105,39,{align:"center"}
  );
  doc.text(
    "Telp/HP: 0821 9613 6833  Email: smk.barakati@yahoo.com",
    105,44,{align:"center"}
  );

  doc.setLineWidth(0.8);
  doc.line(15,48,195,48);
  doc.line(15,50,195,50);

  // JUDUL
  doc.setFont("times","bold");
  doc.setFontSize(12);
  doc.text("REKAP ABSENSI BULANAN",105,60,{align:"center"});

  // TABEL
  doc.autoTable({
    startY: 65,
    html: "#tabel",
    styles:{font:"times",fontSize:10}
  });

  // TANGGAL CETAK
  const y = doc.lastAutoTable.finalY + 10;
  const tgl = new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
  doc.text(`Barakati, ${tgl}`,140,y);

  // JABATAN
  doc.text("Kepala Sekolah,",140,y+6);

  // TTD
  doc.addImage("ttd_kepsek.png","PNG",140,y+10,40,25);

  // NAMA
  doc.setFont("times","bold");
  doc.text("La Ode Hanuli, S.Pd",140,y+40);

  doc.save("Rekap_Absensi.pdf");
}
