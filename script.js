const SHEET_URL = "https://script.google.com/macros/s/AKfycbw_uaEJoz413O4fRJWejUNff2m4Irn82-G9Vzstl-ruviyt5YcNFjyXKlbdN2Ybh_9v/exec";

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

  if (
    !data.jenis ||
    !data.status_kepegawaian ||
    !data.nip ||
    !data.nama ||
    !data.status ||
    !data.foto ||
    !data.lokasi
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
