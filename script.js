/*************************************************
 * KONFIGURASI
 *************************************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec";

/*************************************************
 * KAMERA
 *************************************************/
const video = document.getElementById("video");
const canvasFoto = document.getElementById("foto");
const hasilFoto = document.getElementById("hasilFoto");

if (navigator.mediaDevices && video) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(() => alert("Kamera tidak tersedia / ditolak"));
}

function ambilFoto() {
  if (!video.videoWidth) {
    alert("Kamera belum siap");
    return;
  }
  canvasFoto.width = video.videoWidth;
  canvasFoto.height = video.videoHeight;
  canvasFoto.getContext("2d").drawImage(video, 0, 0);
  hasilFoto.src = canvasFoto.toDataURL("image/png");
}

/*************************************************
 * TANDA TANGAN
 *************************************************/
const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");
let menggambar = false;

ttd.addEventListener("mousedown", e => {
  menggambar = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

ttd.addEventListener("mousemove", e => {
  if (!menggambar) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

ttd.addEventListener("mouseup", () => menggambar = false);
ttd.addEventListener("mouseleave", () => menggambar = false);

function hapusTTD() {
  ctx.clearRect(0, 0, ttd.width, ttd.height);
  ctx.beginPath();
}

function ttdKosong() {
  const kosong = document.createElement("canvas");
  kosong.width = ttd.width;
  kosong.height = ttd.height;
  return ttd.toDataURL() === kosong.toDataURL();
}

/*************************************************
 * LOKASI
 *************************************************/
function ambilLokasi() {
  if (!navigator.geolocation) {
    alert("GPS tidak didukung");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      lokasi.value = pos.coords.latitude + "," + pos.coords.longitude;
    },
    () => alert("Lokasi ditolak")
  );
}

/*************************************************
 * KIRIM DATA
 *************************************************/
function kirim(btn) {
  btn.disabled = true;
  btn.innerText = "⏳ Mengirim...";

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

  // =========================
  // VALIDASI WAJIB
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

  // =========================
  // KETERANGAN WAJIB JIKA SAKIT
  // =========================
  if (data.status === "Sakit" && !data.keterangan) {
    alert("❗ Keterangan wajib diisi jika status SAKIT");
    btn.disabled = false;
    btn.innerText = "✅ SIMPAN";
    return;
  }

  // =========================
  // KIRIM KE GOOGLE SHEET
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
