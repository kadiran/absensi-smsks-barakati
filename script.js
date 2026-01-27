// ===============================
// KONFIGURASI
// ===============================
const API_URL = "https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

// ===============================
// DETEKSI DEVICE
// ===============================
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===============================
// LOKASI
// ===============================
function ambilLokasi() {
  if (!navigator.geolocation) {
    document.getElementById("lokasi").value = "Tidak didukung";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      document.getElementById("lokasi").value =
        pos.coords.latitude + "," + pos.coords.longitude;
    },
    () => {
      document.getElementById("lokasi").value =
        isMobile ? "Aktifkan GPS HP" : "Izinkan lokasi browser";
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

// ===============================
// TTD CANVAS
// ===============================
const ttd = document.getElementById("ttd");
const ctxTTD = ttd.getContext("2d");

let menggambar = false;
let lastX = 0;
let lastY = 0;

// Mouse
ttd.addEventListener("mousedown", e => {
  menggambar = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});
ttd.addEventListener("mousemove", e => {
  if (!menggambar) return;
  ctxTTD.beginPath();
  ctxTTD.moveTo(lastX, lastY);
  ctxTTD.lineTo(e.offsetX, e.offsetY);
  ctxTTD.stroke();
  lastX = e.offsetX;
  lastY = e.offsetY;
});
ttd.addEventListener("mouseup", () => menggambar = false);
ttd.addEventListener("mouseleave", () => menggambar = false);

// Touch (HP)
ttd.addEventListener("touchstart", e => {
  e.preventDefault();
  menggambar = true;
  const t = e.touches[0];
  const r = ttd.getBoundingClientRect();
  lastX = t.clientX - r.left;
  lastY = t.clientY - r.top;
});
ttd.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!menggambar) return;
  const t = e.touches[0];
  const r = ttd.getBoundingClientRect();
  const x = t.clientX - r.left;
  const y = t.clientY - r.top;

  ctxTTD.beginPath();
  ctxTTD.moveTo(lastX, lastY);
  ctxTTD.lineTo(x, y);
  ctxTTD.stroke();

  lastX = x;
  lastY = y;
});
ttd.addEventListener("touchend", e => {
  e.preventDefault();
  menggambar = false;
});

// ===============================
// HAPUS TTD (SOLUSI FINAL HP)
// ===============================
function hapusTTD() {
  menggambar = false;
  ctxTTD.setTransform(1, 0, 0, 1, 0, 0);
  ctxTTD.clearRect(0, 0, ttd.width, ttd.height);

  lastX = 0;
  lastY = 0;

  // 🔥 force stop touch HP
  ttd.style.pointerEvents = "none";
  setTimeout(() => {
    ttd.style.pointerEvents = "auto";
  }, 50);
}

// ===============================
// KIRIM DATA
// ===============================
function kirimAbsensi() {
  const data = {
    jenis: document.getElementById("jenis").value,
    status_kepegawaian: document.getElementById("status_kepegawaian").value,
    nip: document.getElementById("nip").value,
    nama: document.getElementById("nama").value,
    status: document.getElementById("status").value,
    keterangan: document.getElementById("keterangan").value,
    lokasi: document.getElementById("lokasi").value,
    foto: document.getElementById("foto").value,
    ttd: ttd.toDataURL()
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Absensi berhasil dikirim");
      hapusTTD();
    })
    .catch(() => alert("❌ Gagal mengirim data"));
}
