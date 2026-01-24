const SHEET_URL = "https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec";

let video = document.getElementById("video");
navigator.mediaDevices.getUserMedia({video:true})
.then(s=>video.srcObject=s);

function ambilFoto(){
  let c=document.getElementById("foto");
  c.width=video.videoWidth;
  c.height=video.videoHeight;
  c.getContext("2d").drawImage(video,0,0);
  hasilFoto.src=c.toDataURL();
}

let ttd=document.getElementById("ttd"),ctx=ttd.getContext("2d"),draw=false;
ttd.onmousedown=e=>{draw=true;ctx.beginPath();ctx.moveTo(e.offsetX,e.offsetY);}
ttd.onmousemove=e=>{if(draw){ctx.lineTo(e.offsetX,e.offsetY);ctx.stroke();}}
ttd.onmouseup=()=>draw=false;
function hapusTTD(){ctx.clearRect(0,0,ttd.width,ttd.height);}

function ambilLokasi(){
  navigator.geolocation.getCurrentPosition(p=>{
    lokasi.value=p.coords.latitude+","+p.coords.longitude;
  });
}

function kirim(btn){
  const data={
    waktu:new Date().toISOString(),
    jenis:jenis.value,
    status_kepegawaian:status_kepegawaian.value,
    nip:nik.value,
    nama:nama.value,
    status:status.value,
    keterangan:keterangan.value,
    lokasi:lokasi.value,
    foto:hasilFoto.src,
    ttd:ttd.toDataURL()
  };

  fetch(SHEET_URL,{
    method:"POST",
    body:JSON.stringify(data)
  }).then(()=>{
    alert("Berhasil");
    location.reload();
  });
}
