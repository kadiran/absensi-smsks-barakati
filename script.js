// ===============================
// KONFIGURASI
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

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

// FOTO
const inputFoto = document.getElementById("foto");
const fotoBase64 = document.getElementById("fotoBase64");
const previewFoto = document.getElementById("previewFoto");

// TTD
const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");

// ===============================
// MODE DEVICE
// ===============================
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

// ===============================
// FOTO (HP & LAPTOP)
// ===============================
inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("❌ File harus foto");
    inputFoto.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    fotoBase64.value = e.target.result;
    previewFoto.src = e.target.result;
    previewFoto.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ===============================
// LOKASI (HP & LAPTOP)
// ===============================
function ambilLokasi() {
  if (!navigator.geolocation) {
    alert("❌ Browser tidak mendukung GPS");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      lokasi.value = pos.coords.latitude + "," + pos.coords.longitude;
    },
    err => {
      alert("❌ Lokasi gagal diambil\nGunakan HP jika laptop tidak support");
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// ===============================
// TTD (HP & LAPTOP)
// ===============================
let drawing = false, lastX = 0, lastY = 0;

function resizeTTD() {
  const w = Math.min(window.innerWidth * 0.9, 400);
  ttd.width = w;
  ttd.height = w * 0.6;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
}
resizeTTD();
window.addEventListener("resize", resizeTTD);

function pos(e) {
  const r = ttd.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - r.left,
      y: e.touches[0].clientY - r.top
    };
  }
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top
  };
}

function start(e) {
  drawing = true;
  const p = pos(e);
  lastX = p.x; lastY = p.y;
}

function draw(e) {
  if (!drawing) return;
  const p = pos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  lastX = p.x; lastY = p.y;
}

function stop() { drawing = false; }
function clearTTD() { ctx.clearRect(0, 0, ttd.width, ttd.height); }

// EVENT
ttd.addEventListener("mousedown", start);
ttd.addEventListener("mousemove", draw);
ttd.addEventListener("mouseup", stop);
ttd.addEventListener("mouseout", stop);

ttd.addEventListener("touchstart", e => { e.preventDefault(); start(e); });
ttd.addEventListener("touchmove", e => { e.preventDefault(); draw(e); });
ttd.addEventListener("touchend", stop);

// ===============================
// KIRIM DATA
// ===============================
function kirim(btn) {
  btn.disabled = true;
  btn.innerText = "⏳ Mengirim...";

  const data = {
    jenis: jenis.value.trim(),
    status_kepegawaian: status_kepegawaian.value.trim(),
    nip: nik.value.trim(),
    nama: nama.value.trim(),
    status: status.value.trim(),
    keterangan: keterangan.value.trim(),
    lokasi: lokasi.value.trim(),
    foto: fotoBase64.value,
    ttd: ttd.toDataURL()
  };

  if (!data.jenis || !data.status_kepegawaian || !data.nip ||
      !data.nama || !data.status || !data.lokasi || !data.foto) {
    alert("❗ Semua data wajib diisi");
    btn.disabled = false;
    btn.innerText = "✅ SIMPAN";
    return;
  }

  if ((data.status === "Sakit" || data.status === "Izin") && !data.keterangan) {
    alert("❗ Keterangan wajib diisi");
    btn.disabled = false;
    btn.innerText = "✅ SIMPAN";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(() => {
      alert("✅ Absensi berhasil");
      location.reload();
    })
    .catch(err => {
      alert("❌ Gagal mengirim");
      console.error(err);
      btn.disabled = false;
      btn.innerText = "✅ SIMPAN";
    });
}
