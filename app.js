
const DEFAULT_DATA={
judul:"TESPOIN DPD MAJALENGKA",
deskripsi:"Informasi dan registrasi peserta acara.",
tanggal:"[TANGGAL ACARA]",
waktu:"[JAM ACARA]",
lokasi:"[LOKASI ACARA]",
tiket:"Rp [HARGA TIKET]",
kuota:"[JUMLAH] Peserta",
wa:"[NO. WA PANITIA]",
benefit:"Kaos • Makan • Sertifikat • Doorprize"
};

function getData(){try{return JSON.parse(localStorage.getItem("acaraSettings"))||DEFAULT_DATA}catch(e){return DEFAULT_DATA}}
function setText(id,val){const e=document.getElementById(id);if(e)e.textContent=val||"-"}

function loadIndex(){
 const d=getData();
 ["judul","deskripsi","tanggal","waktu","lokasi","tiket","kuota","wa","benefit"].forEach(k=>setText(k,d[k]));
 setText("siteTitle",d.judul);
 const n=JSON.parse(localStorage.getItem("peserta")||"[]");
 setText("jumlah",n.length+" peserta");
}
function loadSettings(){
 const d=getData();
 ["judul","deskripsi","tanggal","waktu","lokasi","tiket","kuota","wa","benefit"].forEach(k=>{const e=document.getElementById(k);if(e)e.value=d[k]||""});
}
function simpanPengaturan(){
 const d={};
 ["judul","deskripsi","tanggal","waktu","lokasi","tiket","kuota","wa","benefit"].forEach(k=>d[k]=document.getElementById(k).value);
 const f=document.getElementById("pamflet");
 if(f.files[0]){
   const r=new FileReader();
   r.onload=()=>{d.pamflet=r.result;localStorage.setItem("acaraSettings",JSON.stringify(d));document.getElementById("msg").textContent="Pengaturan dan pamflet tersimpan.";};
   r.readAsDataURL(f.files[0]);
 }else{
   d.pamflet=getData().pamflet||"";
   localStorage.setItem("acaraSettings",JSON.stringify(d));
   document.getElementById("msg").textContent="Pengaturan tersimpan.";
 }
}
function kodeBaru(){
 const n=JSON.parse(localStorage.getItem("counter")||"0")+1;localStorage.setItem("counter",n);
 const d=new Date();const t=d.getFullYear().toString().slice(-2)+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0");
 return "TES-"+t+"-"+String(n).padStart(4,"0");
}
function initReg(){setText("kode",kodeBaru())}
function daftar(){
 const vals={kode:document.getElementById("kode").value,nama:document.getElementById("nama").value.trim(),toko:document.getElementById("toko").value.trim(),wa:document.getElementById("waPeserta").value.trim(),alamat:document.getElementById("alamat").value.trim(),email:document.getElementById("email").value.trim(),ukuran:document.getElementById("ukuran").value,status:"BELUM LUNAS",hadir:false};
 if(!vals.nama||!vals.toko||!vals.wa||!vals.alamat){alert("Mohon lengkapi data wajib.");return}
 const arr=JSON.parse(localStorage.getItem("peserta")||"[]");arr.push(vals);localStorage.setItem("peserta",JSON.stringify(arr));
 localStorage.setItem("lastKode",vals.kode);location.href="bukti.html";
}
function loadBukti(){
 const code=localStorage.getItem("lastKode");const arr=JSON.parse(localStorage.getItem("peserta")||"[]");const p=arr.find(x=>x.kode===code);
 const e=document.getElementById("buktiData");if(!p){e.innerHTML="<p>Data tidak ditemukan.</p>";return}
 e.innerHTML=`<h2>${p.kode}</h2><p><b>${p.nama}</b></p><p>${p.toko}</p><p>WA: ${p.wa}</p><p>Status: <span class="badge ${p.status==="LUNAS"?"ok":"wait"}">${p.status}</span></p>`;
 const qr=document.getElementById("qr");qr.innerHTML=`<div style="font-size:50px">▦</div><small>QR akan diaktifkan pada tahap integrasi.</small>`;
}
function loadTables(){
 const arr=JSON.parse(localStorage.getItem("peserta")||"[]");
 const t=document.getElementById("tabelPeserta");if(t)t.innerHTML=arr.map(p=>`<tr><td>${p.kode}</td><td>${p.nama}</td><td>${p.toko}</td><td>${p.wa}</td><td><span class="badge ${p.status==="LUNAS"?"ok":"wait"}">${p.status}</span></td></tr>`).join("");
 const l=document.getElementById("tabelLunas");if(l)l.innerHTML=arr.filter(p=>p.status==="LUNAS").map(p=>`<tr><td>${p.kode}</td><td>${p.nama}</td><td>${p.toko}</td><td>${p.ukuran}</td><td><span class="badge ok">LUNAS</span></td></tr>`).join("");
}
function checkin(){
 const code=document.getElementById("checkKode").value.trim();const arr=JSON.parse(localStorage.getItem("peserta")||"[]");const i=arr.findIndex(p=>p.kode===code);const e=document.getElementById("hasilCheck");
 if(i<0){e.innerHTML='<p class="badge wait">Peserta tidak ditemukan.</p>';return}
 arr[i].hadir=true;localStorage.setItem("peserta",JSON.stringify(arr));e.innerHTML=`<div class="card"><h2>✓ Peserta Ditemukan</h2><p><b>${arr[i].nama}</b> — ${arr[i].toko}</p><p>Status pembayaran: ${arr[i].status}</p><p>Status kehadiran: <span class="badge ok">HADIR</span></p></div>`;
}
function loginDemo(){localStorage.setItem("adminLogin","true");location.href="pengaturan.html"}

document.addEventListener("DOMContentLoaded",()=>{
 loadIndex();loadSettings();initReg();loadBukti();loadTables();
 const d=getData(), img=document.getElementById("pImg");if(img&&d.pamflet)img.src=d.pamflet;
});
