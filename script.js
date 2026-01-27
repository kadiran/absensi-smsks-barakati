// ===============================
// KONFIGURASI
// ===============================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxxXF1xKxY3YhCESLBLB3-02WFsi-rnAmYKDgDEVHQJAAvNP3AqefApnQHm5ORyexfW/exec"; // Ganti dengan Web App URL baru

// ELEMENTS
const jenis = document.getElementById("jenis");
const status_kepegawaian = document.getElementById("status_kepegawaian");
const nik = document.getElementById("nik");
const nama = document.getElementById("nama");
const status = document.getElementById("status");
const keterangan = document.getElementById("keterangan");
const lokasi = document.getElementById("lokasi");
const hasilFoto = document.getElementById("hasilFoto");
const video = document.getElementById("video");
const fotoCanvas = document.getElementById("foto");
const ttd = document.getElementById("ttd");
const ctxTTD = ttd.getContext("2d");

// ===============================
// CAMERA & FOTO SELFIE (RESIZE + COMPRESS)
navigator.mediaDevices.getUserMedia({video:true})
.then(stream => video.srcObject = stream)
.catch(err => console.error("Tidak bisa akses kamera:", err));

function ambilFoto(){
  const max = 400;
  let w = video.videoWidth;
  let h = video.videoHeight;
  if(w>h && w>max){h=h*max/w; w=max;}
  if(h>w && h>max){w=w*max/h; h=max;}
  fotoCanvas.width=w; fotoCanvas.height=h;
  fotoCanvas.getContext("2d").drawImage(video,0,0,w,h);
  hasilFoto.src=fotoCanvas.toDataURL("image/png",0.7);
}

// ===============================
// GPS
function ambilLokasi(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>lokasi.value=pos.coords.latitude+","+pos.coords.longitude,
      err=>{alert("❌ Tidak bisa ambil lokasi"); console.error(err);});
  }else alert("❌ Browser tidak mendukung GPS");
}

// ===============================
// TTD (PC & HP)
let menggambar=false, lastX=0,lastY=0;
function resizeTTD(){
  const ratio = Math.min(window.innerWidth*0.9,400);
  ttd.width=ratio; ttd.height=ratio*2/3;
  ctxTTD.lineWidth=2; ctxTTD.lineCap="round"; ctxTTD.strokeStyle="#000";
  ctxTTD.clearRect(0,0,ttd.width,ttd.height);
}
window.addEventListener("resize",resizeTTD); resizeTTD();

function getPos(e){const r=ttd.getBoundingClientRect(); return e.touches?{x:e.touches[0].clientX-r.left,y:e.touches[0].clientY-r.top}:{x:e.clientX-r.left,y:e.clientY-r.top};}
function mulaiTTD(e){menggambar=true; const p=getPos(e); lastX=p.x; lastY=p.y;}
function gambarTTD(e){if(!menggambar)return; const p=getPos(e); ctxTTD.beginPath(); ctxTTD.moveTo(lastX,lastY); ctxTTD.lineTo(p.x,p.y); ctxTTD.stroke(); lastX=p.x; lastY=p.y;}
function selesaiTTD(){menggambar=false;}
function hapusTTD(){ctxTTD.clearRect(0,0,ttd.width,ttd.height);}

// EVENT PC & TOUCH
ttd.addEventListener("mousedown",mulaiTTD); ttd.addEventListener("mousemove",gambarTTD); ttd.addEventListener("mouseup",selesaiTTD); ttd.addEventListener("mouseout",selesaiTTD);
ttd.addEventListener("touchstart",e=>{e.preventDefault();mulaiTTD(e);});
ttd.addEventListener("touchmove",e=>{e.preventDefault();gambarTTD(e);});
ttd.addEventListener("touchend",e=>{e.preventDefault();selesaiTTD();});

// ===============================
// KIRIM DATA
function kirim(btn){
  btn.disabled=true; btn.innerText="⏳ Mengirim...";
  document.activeElement.blur();

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

  if(!data.jenis||!data.status_kepegawaian||!data.nip||!data.nama||!data.status||!data.foto||!data.lokasi){
    alert("❗ Semua data wajib diisi"); btn.disabled=false; btn.innerText="✅ SIMPAN"; return;
  }
  if((data.status==="Sakit"||data.status==="Izin")&&!data.keterangan){
    alert("❗ Keterangan wajib diisi"); btn.disabled=false; btn.innerText="✅ SIMPAN"; return;
  }

  fetch(SHEET_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  })
  .then(res=>res.json())
  .then(()=>{alert("✅ Absensi berhasil disimpan"); location.reload();})
  .catch(err=>{alert("❌ Gagal mengirim data: "+err); console.error(err); btn.disabled=false; btn.innerText="✅ SIMPAN";});
}
