// ===============================
// KONFIGURASI
// ===============================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwlGNNrhZOQPm3njNm032MTOjDjoKGaTbZ6RyigihU2HI0vT00zXLNrWeYH4gWT_tWC/exec";

// ===============================
// ELEMENTS
// ===============================
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
// ===============================
navigator.mediaDevices.getUserMedia({video:true})
.then(stream => video.srcObject = stream)
.catch(err => console.error("Tidak bisa akses kamera:", err));

function ambilFoto(){
  const maxWidth = 400;
  const maxHeight = 400;
  let w = video.videoWidth;
  let h = video.videoHeight;

  if(w>h && w>maxWidth){h = h*maxWidth/w; w = maxWidth;}
  else if(h>w && h>maxHeight){w = w*maxHeight/h; h = maxHeight;}

  fotoCanvas.width = w;
  fotoCanvas.height = h;
  const ctx = fotoCanvas.getContext("2d");
  ctx.drawImage(video,0,0,w,h);
  // kompres jadi PNG 0.7
  hasilFoto.src = fotoCanvas.toDataURL("image/png",0.7);
}

// ===============================
// GPS
// ===============================
function ambilLokasi(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      lokasi.value = pos.coords.latitude + "," + pos.coords.longitude;
    }, err=>{
      alert("❌ Tidak bisa ambil lokasi"); console.error(err);
    });
  } else {
    alert("❌ Browser tidak mendukung GPS");
  }
}

// ===============================
// TTD DIGITAL (PC & HP)
// ===============================
let menggambar=false, lastX=0, lastY=0;

// resize canvas responsive
function resizeCanvasTTD(){
  const ratio = Math.min(window.innerWidth*0.9,400);
  ttd.width = ratio;
  ttd.height = ratio*2/3;
  ctxTTD.lineWidth = 2;
  ctxTTD.lineCap = "round";
  ctxTTD.strokeStyle = "#000";
  ctxTTD.clearRect(0,0,ttd.width,ttd.height);
}
window.addEventListener("resize", resizeCanvasTTD);
resizeCanvasTTD();

// ambil posisi mouse/touch
function getPos(e){
  const rect = ttd.getBoundingClientRect();
  let x,y;
  if(e.touches){
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  }else{
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  return {x,y};
}

function mulaiTTD(e){menggambar=true; const p=getPos(e); lastX=p.x; lastY=p.y;}
function gambarTTD(e){if(!menggambar)return; const p=getPos(e); ctxTTD.beginPath(); ctxTTD.moveTo(lastX,lastY); ctxTTD.lineTo(p.x,p.y); ctxTTD.stroke(); lastX=p.x; lastY=p.y;}
function selesaiTTD(){menggambar=false;}
function hapusTTD(){ctxTTD.clearRect(0,0,ttd.width,ttd.height);}

// EVENT PC
ttd.addEventListener("mousedown",mulaiTTD);
ttd.addEventListener("mousemove",gambarTTD);
ttd.addEventListener("mouseup",selesaiTTD);
ttd.addEventListener("mouseout",selesaiTTD);

// EVENT HP/TOUCH
ttd.addEventListener("touchstart",e=>{e.preventDefault();mulaiTTD(e);});
ttd.addEventListener("touchmove",e=>{e.preventDefault();gambarTTD(e);});
ttd.addEventListener("touchend",e=>{e.preventDefault();selesaiTTD();});

// ===============================
// KIRIM DATA KE SHEET
// ===============================
function kirim(btn){
  btn.disabled=true;
  btn.innerText="⏳ Mengirim...";

  // hilangkan fokus supaya touch/keyboard tidak ganggu fetch
  document.activeElement.blur();

  const data = {
    waktu:new Date().toISOString(),
    jenis:jenis.value.trim(),
    status_kepegawaian:status_kepegawaian.value.trim(),
    nip:nik.value.trim(),
    nama:nama.value.trim(),
    status:status.value.trim(),
    keterangan:keterangan.value.trim(),
    lokasi:lokasi.value.trim(),
    foto:hasilFoto.src || "",
    ttd:ttd.toDataURL()
  };

  // VALIDASI
  if(!data.jenis || !data.status_kepegawaian || !data.nip || !data.nama || !data.status || !data.foto || !data.lokasi){
    alert("❗ Semua data wajib diisi");
    btn.disabled=false; btn.innerText="✅ SIMPAN";
    return;
  }
  if((data.status==="Sakit"||data.status==="Izin") && !data.keterangan){
    alert("❗ Keterangan wajib diisi");
    btn.disabled=false; btn.innerText="✅ SIMPAN";
    return;
  }

  fetch(SHEET_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  })
  .then(res=>{
    if(!res.ok) throw new Error("HTTP "+res.status);
    return res.json();
  })
  .then(()=>{
    alert("✅ Absensi berhasil disimpan");
    location.reload();
  })
  .catch(err=>{
    alert("❌ Gagal mengirim data: "+err);
    console.error(err);
    btn.disabled=false;
    btn.innerText="✅ SIMPAN";
  });
}

