const SHEET_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

/* ================= ELEMENT ================= */
const video = document.getElementById("video");
const hasilFoto = document.getElementById("hasilFoto");
const fotoCanvas = document.getElementById("foto");
const lokasi = document.getElementById("lokasi");

/* ================= KAMERA ================= */
if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => video.srcObject = s)
    .catch(() => alert("❌ Kamera ditolak"));
}

function ambilFoto() {
  fotoCanvas.width = video.videoWidth;
  fotoCanvas.height = video.videoHeight;
  fotoCanvas.getContext("2d").drawImage(video, 0, 0);
  hasilFoto.src = fotoCanvas.toDataURL("image/jpeg", 0.6);
}

/* ================= GPS (AMAN LAPTOP) ================= */
function ambilLokasi() {
  if (!navigator.geolocation) {
    lokasi.value = "Lokasi tidak didukung";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    p => lokasi.value = p.coords.latitude + "," + p.coords.longitude,
    () => lokasi.value = "Lokasi gagal (ISP)"
  );
}

/* ================= TTD FINAL ================= */
const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");

ttd.width = Math.min(window.innerWidth * 0.9, 350);
ttd.height = 200;
ctx.lineWidth = 2;
ctx.lineCap = "round";

let draw = false, lx = 0, ly = 0;

function pos(e) {
  const r = ttd.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  return { x: p.clientX - r.left, y: p.clientY - r.top };
}

ttd.onmousedown = e => { draw = true; ({x:lx,y:ly}=pos(e)); };
ttd.onmousemove = e => {
  if(!draw) return;
  const p = pos(e);
  ctx.beginPath();
  ctx.moveTo(lx,ly);
  ctx.lineTo(p.x,p.y);
  ctx.stroke();
  lx=p.x; ly=p.y;
};
["mouseup","mouseleave"].forEach(e=>ttd.addEventListener(e,()=>draw=false));

ttd.ontouchstart = e => { e.preventDefault(); draw=true; ({x:lx,y:ly}=pos(e)); };
ttd.ontouchmove = e => {
  e.preventDefault();
  if(!draw) return;
  const p = pos(e);
  ctx.beginPath();
  ctx.moveTo(lx,ly);
  ctx.lineTo(p.x,p.y);
  ctx.stroke();
  lx=p.x; ly=p.y;
};
ttd.ontouchend = ()=>draw=false;

function hapusTTD(){
  ctx.clearRect(0,0,ttd.width,ttd.height);
}

/* ================= KIRIM ================= */
function kirim(btn){
  btn.disabled=true;
  btn.innerText="Mengirim...";

  const data={
    jenis:jenis.value,
    status_kepegawaian:status_kepegawaian.value,
    nip:nik.value,
    nama:nama.value,
    status:status.value,
    keterangan:keterangan.value,
    lokasi:lokasi.value,
    foto:hasilFoto.src,
    ttd:ttd.toDataURL()
  };

  fetch(SHEET_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(data)
  })
  .then(()=>{ alert("✅ Berhasil"); location.reload(); })
  .catch(()=>{ alert("❌ Gagal"); btn.disabled=false; });
}
