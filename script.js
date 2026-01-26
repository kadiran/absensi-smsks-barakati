/*************************************************
 * KONFIGURASI
 *************************************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxsEEsNcmaXXIzZJN8z5Ztiva8GlHsYv_MhK2ac8YuQw13nN8KZKrsrg3hRJSHW71iu/exec";

/*************************************************
 * KAMERA (SELFIE)
 *************************************************/
const video = document.getElementById("video");
const canvasFoto = document.getElementById("foto");
const hasilFoto = document.getElementById("hasilFoto");

if (navigator.mediaDevices && video) {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 640 } }
  })
  .then(stream => video.srcObject = stream)
  .catch(() => alert("❌ Kamera tidak tersedia / ditolak"));
}

function ambilFoto() {
  if (!video.videoWidth) {
    alert("⏳ Kamera belum siap");
    return;
  }

  const maxWidth = 400;
  const scale = maxWidth / video.videoWidth;

  canvasFoto.width = maxWidth;
  canvasFoto.height = video.videoHeight * scale;

  canvasFoto.getContext("2d").drawImage(
    video, 0, 0, canvasFoto.width, canvasFoto.height
  );

  // 🔥 KOMPRESI FOTO
  hasilFoto.src = canvasFoto.toDataURL("image/jpeg", 0.5);
}

/*************************************************
 * TANDA TANGAN (MOUSE + TOUCH)
 *************************************************/
const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");
let menggambar = false;

ctx.lineWidth = 2;
ctx.lineCap = "round";

function posisi(e) {
  const rect = ttd.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return { x: e.offsetX, y: e.offsetY };
}

ttd.addEventListener("mousedown", e => {
  menggambar = true;
  const p = posisi(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});

ttd.addEventListener("mousemove", e => {
  if (!menggambar) return;
  const p = posisi(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
});

ttd.addEventListener("mouseup", () => menggambar = false);
ttd.addEventListener("mouseleave", () => menggambar = false);

ttd.addEventListener("touchstart", e => {
  e.preventDefault();
  menggambar = true;
  const p = posisi(e);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
});

ttd.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!menggambar) return;
  const p = posisi(e);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
});

ttd.addEventListener("touchend", () => menggambar = false);

function hapusTTD() {
  ctx.clearRect(0, 0, ttd.width, ttd.height);
}

function ttdKosong() {
  const kosong = document.createElement("canvas");
  kosong.width = ttd.width;
  kosong.height = ttd.height;
  return ttd.toDataURL() === kosong.toDataURL();
}

/*************************************************
 * LOKASI GPS (CEPAT & AMAN)
 *************************************************/
function ambilLokasi() {
  if (!navigator.geolocation) {
    alert("❌ GPS tidak didukung");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      lokasi.value =
        pos.coords.latitude.toFixed(6) + "," +
        pos.coords.longitude.toFixed(6);
    },
    err => {
      alert("❌ Lokasi gagal, pastikan GPS aktif");
    },
    {
      enableHighAccuracy: false, // 🔥 CEPAT
      timeout: 7000,
      maximumAge: 60000
    }
  );
}

/*************************************************
 * KIRIM DATA ABSENSI
 *************************************************/
function kirim(btn) {
  btn.disabled = true;
  btn.innerText = "⏳ Mengirim...";

  // 🔥 KOMPRES TTD
  const ttdKompres = ttd.toDataURL("image/jpeg", 0.4);

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
    ttd: ttdKompres
  };

  // =========================
  // VALIDASI
  // =========================
  if (
    !data.jenis ||
    !data.status_kepegawaian ||
    !data.nip ||
    !data.nama ||
    !data.status ||
    !data.foto ||
    !data.lokasi ||
    ttdKosong()
  ) {
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

  // =========================
  // KIRIM
  // =========================
  fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    alert("✅ Absensi berhasil disimpan");
    location.reload();
  })
  .catch(() => {
    alert("❌ Gagal mengirim data");
    btn.disabled = false;
    btn.innerText = "✅ SIMPAN";
  });
}
