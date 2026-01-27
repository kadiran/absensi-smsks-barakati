const ADMIN_PASSWORD = "12345";
const API_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

let allData = [];

// ================= LOGIN =================
function login(){
  if(document.getElementById("pass").value !== ADMIN_PASSWORD){
    alert("❌ Password salah");
    return;
  }
  document.getElementById("panel").style.display = "block";
  document.getElementById("loading").style.display = "block";
  initBulan();
  loadData();
}

// ================= BULAN =================
function initBulan(){
  const bulan = document.getElementById("bulan");
  const nama = ["Januari","Februari","Maret","April","Mei","Juni",
                "Juli","Agustus","September","Oktober","November","Desember"];
  bulan.innerHTML = "";
  nama.forEach((b,i)=>{
    bulan.innerHTML += `<option value="${i+1}">${b}</option>`;
  });
  bulan.value = new Date().getMonth()+1;
}

// ================= LOAD DATA =================
function loadData(){
  fetch(API_URL)
    .then(r=>r.json())
    .then(data=>{
      allData = data;
      isiFilterNama();
      filterData();
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
  filterData();
}

// ================= REFRESH =================
function refreshData(){
  document.getElementById("loading").style.display = "block";
  loadData();
}

// ================= FILTER DATA =================
function filterData(){
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
      (nama==="" || d.nama===nama)
    ){
      tbody.innerHTML += `
        <tr>
          <td>${no++}</td>
          <td>${t.toLocaleString("id-ID")}</td>
          <td>${d.nama}</td>
          <td>${d.status}</td>
          <td>${d.keterangan || "-"}</td>
        </tr>`;
    }
  });
}

// ================= CETAK PDF =================
function cetakPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("LAPORAN ABSENSI BULANAN",14,15);

  doc.autoTable({
    startY:20,
    head:[["No","Tanggal","Nama","Status","Keterangan"]],
    body:[...document.querySelectorAll("#data tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    )
  });

  doc.save("Absensi_Bulanan.pdf");
}
