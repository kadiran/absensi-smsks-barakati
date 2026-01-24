const SHEET_URL = "https://script.google.com/macros/s/AKfycbyx8Ig_nb0TBW871KU4aDEsYEE-owzTzC0BfSjVHXCKgjjo0vP7cEi_51wgDQ_yQKF0/exec";

const video = document.getElementById("video");
const canvasFoto = document.getElementById("foto");
const hasilFoto = document.getElementById("hasilFoto");

if(navigator.mediaDevices && video){
  navigator.mediaDevices.getUserMedia({video:true})
    .then(stream => video.srcObject = stream)
    .catch(()=>alert("Kamera tidak tersedia / ditolak"));
}

function ambilFoto(){
  if(!video.videoWidth){ alert("Kamera belum siap"); return; }
  canvasFoto.width = video.videoWidth;
  canvasFoto.height = video.videoHeight;
  canvasFoto.getContext("2d").drawImage(video,0,0);
  hasilFoto.src = canvasFoto.toDataURL("image/png");
}

const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");
let menggambar = false;

ttd.addEventListener("mousedown", e => { menggambar = true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); });
ttd.addEventListener("mousemove", e => { if(!menggambar) return; ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); });
ttd.addEventListener("mouseup", ()=> menggambar=false);
ttd.addEventListener("mouseleave", ()=> menggambar=false);

function hapusTTD(){ ctx.clearRect(0,0,ttd.width,ttd.height); ctx.beginPath(); }
function ttdKosong(){ const kosong=document.createElement("canvas"); kosong.width=ttd.width; kosong.height=ttd.height; return ttd.toDataURL()===kosong.toDataURL(); }

function ambilLokasi(){
  if(!navigator.geolocation){ alert("GPS tidak didukung"); return; }
  navigator.geolocation.getCurrentPosition(p => { lokasi.value = p.coords.latitude+","+p.coords.longitude; },
                                         ()=>alert("Lokasi ditolak"));
}

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

  if(!data.jenis || !data.status_kepegawaian || !data.nip || !data.nama || !data.status || !data.foto || !data.lokasi || ttdKosong()){
    alert("❗ Semua data wajib diisi (kecuali keterangan jika hadir)");
    btn.disabled=false; btn.innerText="✅ SIMPAN"; return;
  }

  if((data.status==="Sakit" || data.status==="Izin") && !data.keterangan){
    alert("❗ Keterangan wajib diisi jika status SAKIT/IZIN");
    btn.disabled=false; btn.innerText="✅ SIMPAN"; return;
  }

  fetch(SHEET_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  }).then(()=>{
    alert("✅ Absensi berhasil disimpan");
    location.reload();
  }).catch(()=>{
    alert("❌ Gagal mengirim data");
    btn.disabled=false; btn.innerText="✅ SIMPAN";
  });
}
