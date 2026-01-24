const SHEET_URL="https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec";
const ADMIN_PASS="admin123";

const panel=document.getElementById("panel");
const loading=document.getElementById("loading");
const filterNama=document.getElementById("filterNama");
const dataTable=document.getElementById("data");
const btnCetak=document.getElementById("btnCetak");
let absensiData=[];

function login(){if(document.getElementById("pass").value===ADMIN_PASS){panel.style.display="block";loading.style.display="none";loadData();}else alert("Password salah");}

function loadData(){loading.innerText="⏳ Memuat data..."; fetch(SHEET_URL+"?action=getAll").then(r=>r.json()).then(data=>{absensiData=data; renderTable(data); populateFilterNama(); btnCetak.disabled=false; loading.style.display="none";}).catch(()=>loading.innerText="❌ Gagal memuat data");}

function renderTable(data){dataTable.innerHTML=""; data.forEach((r,i)=>{const tr=document.createElement("tr"); tr.innerHTML=`<td>${i+1}</td><td>${r.waktu||""}</td><td>${r.jenis||""}</td><td>${r.status_kepegawaian||""}</td><td>${r.nip||""}</td><td>${r.nama||""}</td><td>${r.status||""}</td><td>${r.keterangan||""}</td><td>${r.lokasi||""}</td><td>${r.foto?`<img src="${r.foto}" width="50">`:''}</td>`; dataTable.appendChild(tr);});}

function populateFilterNama(){const set=new Set(absensiData.map(r=>r.nama)); filterNama.innerHTML="<option value=''>Semua</option>"; set.forEach(n=>{const o=document.createElement("option"); o.value=n; o.innerText=n; filterNama.appendChild(o);});}

function filterData(){const bulan=document.getElementById("bulan").value; const tahun=document.getElementById("tahun").value; const nama=filterNama.value; renderTable(absensiData.filter(r=>{const t=new Date(r.waktu); return (t.getMonth()+1==bulan && t.getFullYear()==tahun && (nama?r.nama===nama:true));}));}

// CETAK PDF
function cetakPDFBulanan(){const doc=new jspdf.jsPDF(); const yStart=20; const rows=absensiData.map(r=>[r.waktu,r.jenis,r.status_kepegawaian,r.nip,r.nama,r.status,r.keterangan]); doc.autoTable({head:[["Waktu","Jenis","Status Kepegawaian","NIP","Nama","Status","Keterangan"]],body:rows,startY:yStart}); const ttdImg=new Image(); ttdImg.src="ttd_kepsek.png"; ttdImg.onload=()=>{const y=doc.internal.pageSize.getHeight()-50; doc.addImage(ttdImg,"PNG",140,y,40,20); const tgl=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}); doc.text(`Muna Barat, ${tgl}`,140,y+25); doc.text("Kepala Sekolah,",140,y+32); doc.text("Muhammad Ali",140,y+50); doc.save(`Absensi_${new Date().toLocaleDateString()}.pdf`);};}
