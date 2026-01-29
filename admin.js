const API_URL = "https://script.google.com/macros/s/AKfycbxSEZ5HSpNAio_FbDCWFfZR8-5zv7cd-K-tm7O8IGVpN4LiKPZU01JlnOM5g7Vbaxl1/exec";

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  fetch(`${API_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`)
    .then(r => r.json())
    .then(res => {
      if (res.status !== "ok") {
        alert("❌ Username atau password salah");
        return;
      }

      localStorage.setItem("role", res.role);
      window.location.href = "admin.html";
    })
    .catch(() => {
      alert("❌ Server tidak dapat diakses");
    });
}

function loadAdmin() {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    alert("⛔ Akses ditolak");
    return;
  }

  fetch(`${API_URL}?action=admin&role=${role}`)
    .then(r => r.json())
    .then(data => {
      console.log("DATA:", data);
    });
}
