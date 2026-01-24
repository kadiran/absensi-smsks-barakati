const SHEET_URL="https://script.google.com/macros/s/AKfycbz8KcWKDqf0Ovfna4GtqyouQ7gDhhAOhaelaiZLA6aBVUZCKGs63Cr42SUm13AWTFDi/exec";

fetch(SHEET_URL)
.then(r=>r.json())
.then(data=>{
  const map={};
  data.forEach(d=>{
    if(!map[d.nama]) map[d.nama]={h:0,s:0,i:0};
    if(d.status==="Hadir") map[d.nama].h++;
    if(d.status==="Sakit") map[d.nama].s++;
    if(d.status==="Izin") map[d.nama].i++;
  });

  rekap.innerHTML="";
  Object.keys(map).forEach(n=>{
    rekap.innerHTML+=`
    <tr>
      <td>${n}</td>
      <td>${map[n].h}</td>
      <td>${map[n].s}</td>
      <td>${map[n].i}</td>
      <td>${map[n].h+map[n].s+map[n].i}</td>
    </tr>`;
  });
});
