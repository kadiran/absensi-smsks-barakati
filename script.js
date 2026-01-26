const SHEET_URL = "https://script.google.com/macros/s/AKfycbyozP8ngH_086cxxDDAwTGXCnPxXFRgs6LZL5y12GabGd9GWoL4K1_B6xGmkl8uvPg6/exec";

// ===============================
// KIRIM DATA
// ===============================
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
    ttd: ttd.toDataURL("image/jpeg", 0.4) // 🔥 dikompres
  };

  if (
    !data.jenis ||
    !data.status_kepegawaian ||
    !data.nip ||
    !data.nama ||
    !data.status ||
    !data.lokasi ||
    !data.foto
  ) {
    alert("❗ Lengkapi semua data");
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
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(() => {
    alert("✅ Absensi berhasil");
    location.reload();
  })
  .catch(() => {
    alert("❌ Gagal mengirim");
    btn.disabled = false;
    btn.innerText = "✅ SIMPAN";
  });
}
