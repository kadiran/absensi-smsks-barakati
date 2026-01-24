/*************************************************
 * KONFIGURASI
 *************************************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec";

/*************************************************
 * ELEMENT
 *************************************************/
const video = document.getElementById("video");
const canvasFoto = document.getElementById("foto");
const hasilFoto = document.getElementById("hasilFoto");
const btnFoto = document.getElementById("btnFoto");
const btnKirim = document.getElementById("btnKirim");

const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");

const jenis = document.getElementById("jenis");
const status_kepegawaian = document.getElementById("status_kepegawaian");
const nik = document.getElementById("nik");
const nama = document.getElementById("nama");
const status = document.getElementById("status");
const keterangan = document.getElementById("keterangan");
const lokasi = document.getElementById("lokasi");

/*************************************************
 * KAMERA
 *************************************************/
navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
    cekFieldWajib();
  };
})
.catch(err => {
  alert("Kamera ditolak atau tidak tersedia");
  console.error(err);
});

function ambilFoto(){
  if(video.readyState < 2){
    alert("⏳ Kamera masih memuat, tunggu sebentar...");
    return;
  }
  canvasFoto.width = video.videoWidth;
  canvasFoto.height = video.videoHeight;
  canvasFoto.getContext("2d").drawImage(video,0,0);
  hasilFoto.src = canvasFoto.toDataURL("image/png");
  cekFieldWajib();
}

/*************************************************
 * TANDA TANGAN
 *************************************************/
let menggambar = false;
ttd.addEventListener("mousedown", e => { menggambar=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); });
ttd.addEventListener("mousemove", e => { if(menggambar){ ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }});
ttd.addEventListener("mouseup", ()=> menggambar=false);
ttd.addEventListener("mouseleave", ()=> menggambar=false);

function hapusTTD(){ ctx.clearRect(0,0,ttd.width,ttd.height); ctx.beginPath(); cekFieldWajib(); }
function ttdKosong(){ const kosong=document.createElement("canvas"); kosong.width=ttd.width; kosong.height=ttd.height; return ttd.toDataURL()===kosong.toDataURL(); }

/*************************************************
 * LOKASI
 *************************************************/
function ambilLokasi(){
  if(!navigator.geolocation){ alert("GPS tidak didukung"); return; }
  navigator.geolocation.getCurrentPosition(
    pos => { lokasi.value = pos.coords.latitude+","+pos.coords.longitude; cekFieldWajib(); },
    () => alert("Lokasi ditolak")
  );
}

/*************************************************
 * CEK FIELD WAJIB
 *************************************************/
function cekFieldWajib(){
  const semuaWajib = jenis.value && status_kepegawaian.value && nik.value && nama.value && status.value && hasilFoto.src && lokasi.value && !ttdKosong();
  btnFoto.disabled = !semuaWajib;
  btnKirim.disabled = !semuaWajib;
  return semuaWajib;
}

// Panggil setiap ada perubahan
[jenis, status_kepegawaian, nik, nama, status].forEach(el=>{
  el.addEventListener("input", cekFieldWajib);
  el.addEventListener("change", cekFieldWajib);
});

/*************************************************
 * KIRIM DATA
 *************************************************/
function kirim(btn){
  btn.disabled=true; btn.innerText="⏳ Mengirim...";
  const data = {
    waktu: new Date().toISOString(),
    jenis: jenis.value.trim(),
    status_kepegawaian: status_kepegawaian.value.trim(),
    nip: nik.value.trim(),
    nama: nama.value.trim(),
    status: status.value.trim(),
    keterangan: keterangan.value.trim(),
    lokasi: lokasi.value.trim(),
    foto: hasilFoto.src || "",
    ttd: ttd.toDataURL()
  };

  // VALIDASI KETERANGAN JIKA SAKIT
  if(data.status==="Sakit" && !data.keterangan){
    alert("❗ Keterangan wajib diisi jika status Sakit");
    btn.disabled=false; btn.innerText="✅ SIMPAN ABSENSI";
    return;
  }

  fetch(SHEET_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  })
  .then(()=>{ alert("✅ Absensi berhasil disimpan"); location.reload(); })
  .catch(()=>{ alert("❌ Gagal mengirim data"); btn.disabled=false; btn.innerText="✅ SIMPAN ABSENSI"; });
}
