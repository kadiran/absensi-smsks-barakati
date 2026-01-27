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
      tampilkan();
      document.getElementById("loading").style.display = "none";
    })
    .catch(()=>{
      alert("❌ Gagal memuat data");
      document.getElementById("loading").style.display = "none";
    });
}

// ================= TAMPILKAN =================
function tampilkan(){
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const tbody = document.getElementById("rekap");
  tbody.innerHTML = "";

  const rekap = {};

  allData.forEach(d=>{
    const t = new Date(d.waktu);
    if(t.getMonth()+1 == bulan && t.getFullYear() == tahun){
      if(!rekap[d.nama]){
        rekap[d.nama] = {Hadir:0,Sakit:0,Izin:0};
      }
      if(rekap[d.nama][d.status] !== undefined){
        rekap[d.nama][d.status]++;
      }
    }
  });

  Object.keys(rekap).forEach(nama=>{
    const r = rekap[nama];
    tbody.innerHTML += `
      <tr>
        <td>${nama}</td>
        <td>${r.Hadir}</td>
        <td>${r.Sakit}</td>
        <td>${r.Izin}</td>
        <td><b>${r.Hadir + r.Sakit + r.Izin}</b></td>
      </tr>`;
  });
}

// ================= REFRESH =================
function refreshData(){
  document.getElementById("loading").style.display = "block";
  loadData();
}

// ================= CETAK PDF =================
function cetakPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("REKAP ABSENSI BULANAN",14,15);

  doc.autoTable({
    startY:20,
    head:[["Nama","Hadir","Sakit","Izin","Total"]],
    body:[...document.querySelectorAll("#rekap tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    )
  });

  doc.save("Rekap_Absensi_Bulanan.pdf");
}
