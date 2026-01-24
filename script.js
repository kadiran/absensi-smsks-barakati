const SHEET_URL="https://script.google.com/macros/s/AKfycbycIs4AiE9q4Zujzi-pjGrsomigWMQGmN6UmW9cTQ5aqjvzjUy2LH15KIRCbB0vWmrd/exec";

const video=document.getElementById("video");
const canvasFoto=document.getElementById("foto");
const hasilFoto=document.getElementById("hasilFoto");
const ttd=document.getElementById("ttd");
const ctx=ttd.getContext("2d");

const jenis=document.getElementById("jenis");
const status_kepegawaian=document.getElementById("status_kepegawaian");
const nik=document.getElementById("nik");
const nama=document.getElementById("nama");
const status=document.getElementById("status");
const keterangan=document.getElementById("keterangan");
const lokasi=document.getElementById("lokasi");
const btnKirim=document.getElementById("btnKirim");

// Kamera
navigator.mediaDevices.getUserMedia({video:true}).then(s=>video.srcObject=s).catch(()=>alert("Kamera tidak tersedia"));

// Ambil foto
function ambilFoto(){
  if(video.readyState<2){alert("⏳ Kamera belum siap");return;}
  canvasFoto.width=video.videoWidth;
  canvasFoto.height=video.videoHeight;
  canvasFoto.getContext("2d").drawImage(video,0,0);
  hasilFoto.src=canvasFoto.toDataURL("image/png");
}

// TTD
let menggambar=false;
ttd.addEventListener("mousedown", e=>{ menggambar=true; ctx.beginPath(); ctx.moveTo(e.offsetX,e.offsetY); });
ttd.addEventListener("mousemove", e=>{ if(menggambar){ ctx.lineTo(e.offsetX,e.offsetY); ctx.stroke(); }});
ttd.addEventListener("mouseup", ()=> menggambar=false);
ttd.addEventListener("mouseleave", ()=> menggambar=false);
function hapusTTD(){ ctx.clearRect(0,0,ttd.width,ttd.height); ctx.beginPath(); }

// Cek TTD kosong
function ttdKosong(){ const kosong=document.createElement("canvas"); kosong.width=ttd.width; kosong.height=ttd.height; return ttd.toDataURL()===kosong.toDataURL(); }

// Lokasi
function ambilLokasi(){
  navigator.geolocation.getCurrentPosition(p=>lokasi.value=p.coords.latitude+","+p.coords.longitude,()=>alert("Lokasi ditolak"));
}

// Kirim data
function kirim(btn){
  btn.disabled=true; btn.innerText="⏳ Mengirim...";
  const data={
    waktu:new Date().toISOString(),
    jenis:jenis.value.trim(),
    status_kepegawaian:status_kepegawaian.value.trim(),
    nip:nik.value.trim(),
    nama:nama.value.trim(),
    status:status.value.trim(),
    keterangan:keterangan.value.trim(),
    lokasi:lokasi.value.trim(),
    foto:hasilFoto.src||"",
    ttd:ttd.toDataURL()
  };
  if(!data.jenis||!data.status_kepegawaian||!data.nip||!data.nama||!data.status||!data.foto||!data.lokasi||ttdKosong()){
    alert("❗ Semua field wajib diisi"); btn.disabled=false; btn.innerText="✅ SIMPAN"; return;
  }
  if(data.status==="Sakit" && !data.keterangan){alert("❗ Keterangan wajib jika Sakit"); btn.disabled=false; btn.innerText="✅ SIMPAN"; return;}
  fetch(SHEET_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
  .then(()=>{alert("✅ Absensi berhasil disimpan"); location.reload();})
  .catch(()=>{alert("❌ Gagal kirim data"); btn.disabled=false; btn.innerText="✅ SIMPAN";});
}
