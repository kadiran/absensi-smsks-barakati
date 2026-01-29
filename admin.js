const y = doc.lastAutoTable.finalY + 12;

// ===== FORMAT TANGGAL RESMI =====
const bulanNama = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];
const now = new Date();
const tanggalResmi =
  now.getDate() + " " +
  bulanNama[now.getMonth()] + " " +
  now.getFullYear();

// ===== TANDA TANGAN KEPALA SEKOLAH =====
doc.setFont("times","normal");
doc.setFontSize(11);

doc.text("Bungkolo, " + tanggalResmi, 140, y);
doc.text("Mengetahui,", 140, y + 6);
doc.text("Kepala Sekolah", 140, y + 12);

// spasi khusus area tanda tangan
doc.text(" ", 140, y + 22);

doc.text("Muhammad Ali", 140, y + 30);
doc.text("NIP. 196xxxxxxxxxxxx", 140, y + 36);
