
const API_URL = ""; // isi dengan URL Web App Google Apps Script
function $(id){return document.getElementById(id)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function statusClass(v){v=(v||"").toUpperCase();return v==="LUNAS"?"lunas":v==="HADIR"?"hadir":"belum"}
