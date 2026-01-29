const API_URL = "https://script.google.com/macros/s/AKfycbwIsnsQIdCDHgOW6cglp3gY-Y901xjFRZ1ICY6FUcK-EpdBEjeJVdlyHUPe5_UQozou/exec";

let roleUser = "";
let allData = [];

function login() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  document.getElementById("loading").style.display = "block";

  fetch(`${API_URL}?action=login&user=${user}&pass=${pass}`)
    .then(r => r.json())
    .then(res => {
      if (res.status !== "ok") {
        alert("Login gagal");
        return;
      }

      roleUser = res.role;
      document.getElementById("panel").style.display = "block";
      document.getElementById("roleInfo").innerText =
        roleUser === "admin" ? "MODE ADMIN" : "MODE KEPALA SEKOLAH";

      initBulan();
      loadData();
    })
    .finally(() => {
      document.getElementById("loading").style.display = "none";
    });
}

function initBulan() {
  const b = document.getElementById("bulan");
  const n = ["Januari","Februari","Maret","April","Mei","Juni","Juli",
             "Agustus","September","Oktober","November","Desember"];
  b.innerHTML = "";
  n.forEach((x,i)=>b.innerHTML+=`<option value="${i+1}">${x}</option>`);
  b.value = new Date().getMonth()+1;
}

function loadData() {
  fetch(`${API_URL}?action=data`)
    .then(r=>r.json())
    .then(d=>{
      allData = d;
      tampilkan();
    });
}

function tampilkan() {
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const tb = document.getElementById("data");
  tb.innerHTML = "";
  let no=1;

  allData.forEach(d=>{
    const t = new Date(d.waktu);
    if (t.getMonth()+1==bulan && t.getFullYear()==tahun) {
      tb.innerHTML += `
      <tr>
        <td>${no++}</td>
        <td>${t.toLocaleDateString("id-ID")}</td>
        <td>${d.nama}</td>
        <td>${d.status}</td>
        <td>${d.keterangan||"-"}</td>
      </tr>`;
    }
  });
}
