const SHEET_URL = "https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec";
let dataAbsensi = [];

function loadData(){
  fetch(SHEET_URL)
  .then(res=>res.json())
  .then(json=>{
    dataAbsensi=json;
    renderTable(dataAbsensi);
  });
}

function renderTable(data){
  const tbody=document.getElementById("data");
  tbody.innerHTML="";
  data.forEach((row,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${i+1}</td>
                  <td>${row.waktu}</td>
                  <td>${row.nama}</td>
                  <td>${row.status}</td>
                  <td>${row.status_kepegawaian}</td>
                  <td>${row.keterangan}</td>`;
    tbody.appendChild(tr);
  });
}

function filterData(){
  const bulan=document.getElementById("bulan").value;
  const tahun=document.getElementById("tahun").value;
  const nama=document.getElementById("filterNama").value;

  const filtered=dataAbsensi.filter(r=>{
    const d=new Date(r.waktu);
    const matchBulan=d.getMonth()+1==bulan;
    const matchTahun=d.getFullYear()==tahun;
    const matchNama=!nama || r.nama==nama;
    return matchBulan && matchTahun && matchNama;
  });
  renderTable(filtered);
}

function cetakPDFBulanan(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const tanggal=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
  doc.text(`Muna Barat, ${tanggal}`,140,20);
  doc.text("Kepala Sekolah,",140,27);
  doc.text("Muhammad Ali",140,45);
  const ttdKepsek=new Image();
  ttdKepsek.src="ttd_kepsek.png";
  doc.addImage(ttdKepsek,"PNG",140,30,40,20);

  doc.autoTable({ html:"#data", startY:70 });
  doc.save(`Absensi_Bulanan.pdf`);
}

window.onload=loadData;
