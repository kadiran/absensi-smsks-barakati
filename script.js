/*************************************************
 * KONFIGURASI
 *************************************************/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxsEEsNcmaXXIzZJN8z5Ztiva8GlHsYv_MhK2ac8YuQw13nN8KZKrsrg3hRJSHW71iu/exec";

/*************************************************
 * AMBIL ELEMEN
 *************************************************/
const video = document.getElementById("video");
const canvasFoto = document.getElementById("foto");
const hasilFoto = document.getElementById("hasilFoto");
const lokasi = document.getElementById("lokasi");
const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");

/*************************************************
 * KAMERA DEPAN (SELFIE)
 *************************************************/
if (navigator.mediaDevices && video) {
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" }
  })
  .then(stream => video.srcObject = stream)
  .catch(() => alert("❌ Kamera tidak tersedia / izin ditolak"));
}

function ambilFoto() {
  if (!video.videoWidth) {
    alert("⏳ Kamera belum siap");
    return;
  }

  const maxWidth = 480;
  const scale = maxWidth / video.videoWidth;

  canvasFoto.width = maxWidth;
  canvasFoto.height = video.videoHeight * scale;

  canvasFoto.getContext("2d").drawImage(
    video, 0, 0, canvasFoto.width, canvasFoto.height
  );

  hasilFoto.src = canvasFoto.toDataURL("image/jpeg", 0.6);
}

/*************************************************
 * TANDA TANGAN (MOUSE + TOUCH)
 *************************************************/
let menggambar = false;
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "#000";

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

// Mouse
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

// Touch (HP)
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
 * LOKASI GPS
 *************************************************/
function ambilLokasi() {
  if (!navigator.geolocation) {
    alert("GPS tidak didukung");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      document.getElementById("lokasi").value =
        pos.coords.latitude.toFixed(6) + "," +
        pos.coords.longitude.toFixed(6);
    },
    function (err) {
      alert("Lokasi ditolak. Aktifkan GPS & izinkan lokasi browser");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}


/*************************************************
 * KIRIM DATA ABSENSI
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

  // Validasi wajib
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

  // Keterangan wajib jika Sakit / Izin
  if ((data.status === "Sakit" || data.status === "Izin") && !data.keterangan) {
    alert("❗ Keterangan wajib diisi jika SAKIT / IZIN");
    btn.disabled = false;
    btn.innerText = "✅ SIMPAN";
    return;
  }

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

