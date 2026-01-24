/*************************************************
 * KONFIGURASI
 *************************************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec"; // wajib diganti
const NAMA_KEPSEK = "Muhammad Ali";
const NAMA_SEKOLAH = "SMSKS Barakati Muna Barat";

/*************************************************
 * AMBIL DATA ABSENSI
 *************************************************/
async function loadData(){
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;

  if(!bulan || !tahun){
    alert("Pilih bulan dan tahun");
    return;
  }

  const res = await fetch(`${SHEET_URL}?mode=admin`);
  const data = await res.json();

  const tbody = document.querySelector("#tabel tbody");
  tbody.innerHTML = "";

  const filter = data.filter(r=>{
    const tgl = new Date(r.waktu);
    return (tgl.getMonth()+1)==bulan && tgl.getFullYear()==tahun;
  });

  filter.forEach((r,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${formatTanggal(r.waktu)}</td>
      <td>${r.jenis}</td>
      <td>${r.nip}</td>
      <td>${r.nama}</td>
      <td>${r.status}</td>
      <td>${r.keterangan||"-"}</td>
      <td>${r.lokasi}</td>
    `;
    tbody.appendChild(tr);
  });
}

/*************************************************
 * FORMAT TANGGAL
 *************************************************/
function formatTanggal(w){
  return new Date(w).toLocaleDateString("id-ID",{
    day:"2-digit",month:"2-digit",year:"numeric"
  });
}

/*************************************************
 * CETAK PDF + TTD KEPSEK
 *************************************************/
function cetakPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  let y = 15;

  // LOGO
  doc.addImage("logo.png","PNG",15,y,20,20);

  // JUDUL
  doc.setFontSize(14);
  doc.text("LAPORAN ABSENSI BULANAN",105,y+8,{align:"center"});
  doc.setFontSize(11);
  doc.text(NAMA_SEKOLAH,105,y+15,{align:"center"});

  y += 30;

  // DATA TABEL
  const rows = [];
  document.querySelectorAll("#tabel tbody tr").forEach(tr=>{
    const cols = [...tr.children].map(td=>td.innerText);
    rows.push(cols);
  });

  doc.autoTable({
    startY: y,
    head: [[
      "No","Tanggal","Jenis","NIP/NIK",
      "Nama","Status","Ket","Lokasi"
    ]],
    body: rows,
    styles:{fontSize:8},
    headStyles:{fillColor:[11,94,215]}
  });

  y = doc.lastAutoTable.finalY + 10;

  // ===============================
  // TTD KEPALA SEKOLAH (FINAL)
  // ===============================
  const ttd = new Image();
  ttd.src = "ttd_kepsek.png";

  doc.addImage(ttd,"PNG",140,y,40,20);

  const tgl = new Date().toLocaleDateString("id-ID",{
    day:"numeric",month:"long",year:"numeric"
  });

  doc.text(`Muna Barat, ${tgl}`,140,y+30);
  doc.text("Kepala Sekolah,",140,y+38);
  doc.text(NAMA_KEPSEK,140,y+55);

  // SIMPAN
  doc.save("Laporan_Absensi_Bulanan.pdf");
}
