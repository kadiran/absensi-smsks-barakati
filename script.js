// ===============================
// TANDA TANGAN DIGITAL (PC & HP)
// ===============================
const ttd = document.getElementById("ttd");
const ctx = ttd.getContext("2d");

let menggambar = false;
let lastX = 0;
let lastY = 0;

// ===============================
// Resize canvas responsive
// ===============================
function resizeCanvasTTD() {
  const ratio = Math.min(window.innerWidth * 0.9, 400); // max 400px lebar
  ttd.width = ratio;
  ttd.height = ratio * 2/3; // proporsi TTD
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.clearRect(0,0,ttd.width,ttd.height);
}
window.addEventListener("resize", resizeCanvasTTD);
resizeCanvasTTD();

// ===============================
// MULAI TTD
// ===============================
function mulaiTTD(e) {
  menggambar = true;
  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;
}

// ===============================
// GAMBAR TTD
// ===============================
function gambarTTD(e) {
  if (!menggambar) return;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX,lastY);
  ctx.lineTo(pos.x,pos.y);
  ctx.stroke();
  lastX = pos.x;
  lastY = pos.y;
}

// ===============================
// SELESAI TTD
// ===============================
function selesaiTTD() {
  menggambar = false;
}

// ===============================
// DAPATKAN POSISI MOUSE / TOUCH
// ===============================
function getPos(e){
  const rect = ttd.getBoundingClientRect();
  let x,y;
  if(e.touches){
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  return {x, y};
}

// ===============================
// HAPUS TTD
// ===============================
function hapusTTD(){
  ctx.clearRect(0,0,ttd.width,ttd.height);
}

// ===============================
// EVENT LISTENER PC
// ===============================
ttd.addEventListener("mousedown", mulaiTTD);
ttd.addEventListener("mousemove", gambarTTD);
ttd.addEventListener("mouseup", selesaiTTD);
ttd.addEventListener("mouseout", selesaiTTD);

// ===============================
// EVENT LISTENER TOUCH (HP/Tablet)
// ===============================
ttd.addEventListener("touchstart", e=>{
  e.preventDefault();
  mulaiTTD(e);
});
ttd.addEventListener("touchmove", e=>{
  e.preventDefault();
  gambarTTD(e);
});
ttd.addEventListener("touchend", e=>{
  e.preventDefault();
  selesaiTTD();
});
