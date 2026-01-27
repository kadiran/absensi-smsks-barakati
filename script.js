/* ======================================================
   KONFIGURASI
====================================================== */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxk8qvZrQSbtHBhE1jEKBBhYk8E8dG4FlEB_pn8BiX-BIGsVetsAEmqRJa2KtSAs-SU/exec";

let stream;
let fotoBase64 = "";

/* ======================================================
   AKSES KAMERA
====================================================== */
navigator.mediaDevices.getUserMedia({ video: true })
.then(s => {
  stream = s;
  document.getElementById("video").srcObject = stream;
})
.catch(() => alert("❌ Kamera tidak dapat diakses"));

/* ======================================================
   AMBIL FOTO
====================================================== */
function ambilFoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("foto");
  const img = document.getElementById("hasilFoto");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  fotoBase64 = canvas.toDataURL("image/png");
  img.src = fotoBase64;
}

/* ======================================================
   TANDA TANGAN
====================================================== */
const ttdCanvas = document.getElementById("ttd");
const ttdCtx = ttdCanvas.getContext("2d");
let menggambar = false;

ttdCanvas.addEventListener("mousedown", () => menggambar = true);
ttdCanvas.addEventListener("mouseup", () => {
  menggambar = false;
  ttdCtx.beginPath();
});
ttdCanvas.addEventListener("mousemove", e => {
  if (!menggambar) return;
  ttdCtx.lineWidth = 2;
  ttdCtx.lineCap = "round";
  ttdCtx.strokeStyle = "#000";
  ttdCtx.lineTo(e.offsetX, e.offsetY);
  ttdCtx.stroke();
  ttdCtx.beginPath();
  ttdCtx.moveTo(e.offsetX, e.offsetY);
});

function hapusTTD() {
  ttdCtx.clearRect(0, 0, ttdCanvas.width, ttdCanvas.height);
}

/* ======================================================
   AMBIL LOKASI GPS
====================================================== */
function ambilLokasi() {
  navigator.geolocation.getCurrentPosition(
    pos => {
      document.getElementById("lokasi").value =
        pos.coords.latitude + ", " + pos.coords.longitude;
    },
    () => alert("❌ Lokasi tidak dapat diakses")
  );
}

/* ======================================================
   KIRIM ABSENSI
====================================================== */
function kirim(btn) {

  const jenis = document.getElementById("jenis").value.trim();
  const statusKepeg = document.getElementById("status_kepegawaian").value.trim();
  const nip = document.getElementById("nik").value.trim();
  const nama = document.getElementById("nama").value.trim();
  const status = document.getElementById("status").value.trim();
  const keterangan = document.getElementById("keterangan").value.trim();
  const lokasi = document.getElementById("lokasi").value.trim();
  const foto = document.getElementById("hasilFoto").src || "";

  /* ===== VALIDASI ===== */
  if (!jenis || !statusKepeg || !nip || !nama || !status) {
    alert("❗ Semua field bertanda * wajib diisi");
    return;
  }

  if ((status === "Sakit" || status === "Izin") && !keterangan) {
    alert("❗ Keterangan wajib diisi jika Sakit / Izin");
    return;
  }

  if (!foto) {
    alert("❗ Foto selfie belum diambil");
    return;
  }

  const ttdKosong = ttdCtx
    .getImageData(0, 0, ttdCanvas.width, ttdCanvas.height)
    .data.every(v => v === 0);

  if (ttdKosong) {
    alert("❗ Tanda tangan belum diisi");
    return;
  }

  if (!lokasi) {
    alert("❗ Lokasi belum diambil");
    return;
  }

  /* ===== KIRIM DATA ===== */
  btn.disabled = true;
  btn.innerText = "⏳ Mengirim...";

  const data = {
    waktu: new Date().toISOString(),
    jenis,
    status_kepegawaian: statusKepeg,
    nip,
    nama,
    status,
    keterangan,
    lokasi,
    foto,
    ttd: ttdCanvas.toDataURL("image/png")
  };

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
    btn.innerText = "✅ SIMPAN ABSENSI";
  });
}
