// ===============================
// KONFIGURASI
// ===============================
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

// ===============================
// ELEMENT
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
// CAMERA
// ===============================
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then(stream => video.srcObject = stream)
  .catch(() => alert("❌ Kamera tidak diizinkan"));

function ambilFoto() {
  fotoCanvas.width = video.videoWidth;
  fotoCanvas.height = video.videoHeight;
  fotoCanvas.getContext("2d").drawImage(video, 0, 0);
  hasilFoto.src = fotoCanvas.toDataURL("image/jpeg", 0.6);
}

// ===============================
// GPS
// ===============================
function ambilLokasi() {
  navigator.geolocation.getCurrentPosition(
    pos => lokasi.value = pos.coords.latitude + "," + pos.coords.longitude,
    () => alert("❌ Lokasi tidak aktif")
  );
}

// ===============================
// TTD HP & PC
// ===============================
let draw = false, x = 0, y = 0;

function resizeTTD() {
  ttd.width = Math.min(window.innerWidth * 0.9, 400);
  ttd.height = 200;
  ctxTTD.lineWidth = 2;
  ctxTTD.lineCap = "round";
}
resizeTTD();

function pos(e) {
  const r = ttd.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  return { x: p.clientX - r.left, y: p.clientY - r.top };
}

ttd.addEventListener("mousedown", e => { draw = true; ({ x, y } = pos(e)); });
ttd.addEventListener("mousemove", e => {
  if (!draw) return;
  const p = pos(e);
  ctxTTD.beginPath();
  ctxTTD.moveTo(x, y);
  ctxTTD.lineTo(p.x, p.y);
  ctxTTD.stroke();
  x = p.x; y = p.y;
});
["mouseup","mouseout"].forEach(e => ttd.addEventListener(e, () => draw = false));

ttd.addEventListener("touchstart", e => { e.preventDefault(); draw = true; ({ x, y } = pos(e)); });
ttd.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!draw) return;
  const p = pos(e);
  ctxTTD.beginPath();
  ctxTTD.moveTo(x, y);
  ctxTTD.lineTo(p.x, p.y);
  ctxTTD.stroke();
  x = p.x; y = p.y;
});
ttd.addEventListener("touchend", () => draw = false);

// ===============================
// KIRIM DATA (ANTI FAILED FETCH)
// ===============================
function kirim(btn) {
  btn.disabled = true;
  btn.innerText = "Mengirim...";

  const data = {
    jenis: jenis.value,
    status_kepegawaian: status_kepegawaian.value,
    nip: nik.value,
    nama: nama.value,
    status: status.value,
    keterangan: keterangan.value,
    lokasi: lokasi.value,
    foto: hasilFoto.src,
    ttd: ttd.toDataURL()
  };

  if (!data.jenis || !data.nip || !data.nama || !data.status || !data.foto || !data.lokasi) {
    alert("❗ Semua data wajib diisi");
    btn.disabled = false;
    btn.innerText = "SIMPAN";
    return;
  }

  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(data)
  })
  .then(() => {
    alert("✅ Absensi berhasil");
    location.reload();
  })
  .catch(() => {
    alert("❌ Gagal mengirim data");
    btn.disabled = false;
    btn.innerText = "SIMPAN";
  });
}
