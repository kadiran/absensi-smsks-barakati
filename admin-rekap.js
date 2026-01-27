const ADMIN_PASSWORD="12345";
const API_URL="https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";
let allData=[];

function login(){
  if(pass.value!==ADMIN_PASSWORD) return alert("❌ Salah");
  panel.style.display="block";
  fetch(API_URL).then(r=>r.json()).then(d=>{allData=d;filterData();});
}

function filterData(){
  const b=bulan.value,t=tahun.value;
  const r={};
  allData.forEach(x=>{
    const d=new Date(x.waktu);
    if(d.getMonth()+1==b&&d.getFullYear()==t){
      if(!r[x.nama])r[x.nama]={Hadir:0,Sakit:0,Izin:0};
      if(r[x.nama][x.status]!=null)r[x.nama][x.status]++;
    }
  });
  rekapGuru.innerHTML="";
  Object.keys(r).forEach(n=>{
    const x=r[n];
    rekapGuru.innerHTML+=`
      <tr>
        <td>${n}</td>
        <td>${x.Hadir}</td>
        <td>${x.Sakit}</td>
        <td>${x.Izin}</td>
        <td>${x.Hadir+x.Sakit+x.Izin}</td>
      </tr>`;
  });
}
