const ADMIN_PASSWORD="12345";
const API_URL="https://script.google.com/macros/s/AKfycbwTqSOV-uhzwizynhuiKdUp6P1aGQA-6CktCVGMAmN0gndTzkEQJecHrXxuT_5c9e1r/exec";

function login(){
  if(pass.value!==ADMIN_PASSWORD) return alert("❌ Salah");
  panel.style.display="block";
  fetch(API_URL)
    .then(r=>r.json())
    .then(d=>{
      data.innerHTML="";
      d.forEach((x,i)=>{
        data.innerHTML+=`
          <tr>
            <td>${i+1}</td>
            <td>${new Date(x.waktu).toLocaleString("id-ID")}</td>
            <td>${x.nama}</td>
            <td>${x.status}</td>
            <td>${x.keterangan||"-"}</td>
          </tr>`;
      });
    });
}
