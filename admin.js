alert("ADMIN JS FINAL AKTIF");

// ================= KONFIGURASI =================
const API_URL = "https://script.google.com/macros/s/AKfycbxvWolIELHtmISm1rNbzxSnDxK1A6aT6i2A7oDCL4kSQp2u0LbK41fXX7BcILL7DxmI/exec"; // WAJIB diganti

let allData = [];
let roleUser = "";

// ================= LOGIN =================
function login(){
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  if(!user || !pass){
    alert("❗ Username & Password wajib diisi");
    return;
  }

  document.getElementById("loading").style.display = "block";

  fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(r => r.json())
    .then(res => {
      document.getElementById("loading").style.display = "none";

      if(res.status !== "ok"){
        alert("❌ Username atau password salah");
        return;
      }

      roleUser = res.role || "";

      document.getElementById("loginBox").style.display = "none";
      document.getElementById("panel").style.display = "block";

      // Hak akses
      if(roleUser === "kepsek"){
        const btnHapus = document.getElementById("btnHapus");
        if(btnHapus) btnHapus.style.display = "none";
      }

      initBulan();
      initTahun();
      loadData();
    })
    .catch(err => {
      console.error(err);
      document.getElementById("loading").style.display = "none";
      alert("❌ Server tidak dapat diakses");
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
  nama.forEach((b,i)=>bulan.innerHTML += `<option value="${i+1}">${b}</option>`);
  bulan.value = new Date().getMonth()+1;
}

// ================= TAHUN =================
function initTahun(){
  const tahun = document.getElementById("tahun");
  const now = new Date().getFullYear();
  tahun.innerHTML = "";
  for(let i=now-3;i<=now+1;i++){
    tahun.innerHTML += `<option value="${i}">${i}</option>`;
  }
  tahun.value = now;
}

// ================= LOAD DATA =================
function loadData(){
  fetch(`${API_URL}?action=admin`)
    .then(r=>r.json())
    .then(data=>{
      allData = Array.isArray(data) ? data : [];
      isiFilterNama();
      tampilkan();
    })
    .catch(()=>alert("❌ Gagal memuat data"));
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
      t.getMonth()+1==bulan &&
      t.getFullYear()==tahun &&
      (nama==="" || d.nama===nama)
    ){
      tbody.innerHTML += `
        <tr>
          <td>${no++}</td>
          <td>${t.toLocaleDateString("id-ID")}</td>
          <td>${d.nama}</td>
          <td>${d.status}</td>
          <td>${d.keterangan||"-"}</td>
        </tr>`;
    }
  });
}
