/************************************************************
 * TESPOIN DPD MAJALENGKA
 * GOOGLE APPS SCRIPT BACKEND
 * SISTEM TIER 1 / TIER 2 / TIER 3 / COD
 ************************************************************/

const SPREADSHEET_ID = '14Pc60kNoLwz2ulT6kFW0PGoB3Xeg06rL6s3UfxDe4i4';
const SHEET_NAME = 'REGISTRASI PESERTA';
const SETTINGS_SHEET = 'PENGATURAN';
const LOG_SHEET_NAME = 'LOG AKTIVITAS';
const DRIVE_FOLDER_ID = '1VMpRpaSjkIfCPzd3UO2ZZaBN--S0tC8C';

const HEADERS = [
  'Timestamp','Kode Registrasi','Nama Peserta','Nama Toko','No. WhatsApp',
  'Alamat','Email','Ukuran Kaos','Bukti Transfer','Status Pembayaran',
  'Nominal Pembayaran','Tanggal Verifikasi','Status Kehadiran','Jam Check-in',
  'Catatan Panitia','Metode Pembayaran','Petugas Pembayaran','Waktu Pembayaran',
  'Petugas Verifikasi','Waktu Verifikasi','Petugas Scan','Waktu Scan',
  'Status Benefit','Catatan',
  'Tier Registrasi','Estimasi Harga Registrasi','Tier Pembayaran','Harga Final'
];

/* ========================= GET ========================= */

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const action = String(p.action || '').toLowerCase();

    switch (action) {
      case 'ping':
        return json_({ok:true, message:'API TESPOIN aktif', waktu:new Date().toISOString()});
      case 'cari':
      case 'caripeserta':
        return cari_(p);
      case 'caribukti':
        return cari_(p);
      case 'peserta':
        return peserta_(false);
      case 'lunas':
        return peserta_(true);
      case 'pengaturan':
        return ambilPengaturan_();
      case 'harga':
        return getHargaAktifPublic_();
      default:
        return json_({ok:false,message:'Action GET tidak dikenal',action:action});
    }
  } catch (err) {
    return json_({ok:false,message:err.message});
  }
}

/* ========================= POST ========================= */

function doPost(e) {
  try {
    const data = parsePost_(e);
    const action = String(data.action || '').toLowerCase();

    switch (action) {
      case 'registrasi': return registrasi_(data);
      case 'registrasicod': return registrasiCOD_(data);
      case 'verifikasilunas': return verifikasiLunas_(data);
      case 'pembayarancod': return pembayaranCOD_(data);
      case 'checkin': return checkin_(data);
      case 'simpanpengaturan': return simpanPengaturan_(data);
      default:
        return json_({ok:false,message:'Action POST tidak dikenal',action:action});
    }
  } catch (err) {
    return json_({ok:false,message:err.message});
  }
}

/* ========================= SHEET ========================= */

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  ensureHeader_(sh);
  return sh;
}

function ensureHeader_(sh) {
  const n = HEADERS.length;
  if (sh.getMaxColumns() < n) {
    sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
  }
  const current = sh.getRange(1,1,1,n).getValues()[0];
  let different = false;
  for (let i=0;i<n;i++) {
    if (String(current[i] || '').trim() !== HEADERS[i]) { different = true; break; }
  }
  if (different) sh.getRange(1,1,1,n).setValues([HEADERS]);
}

/* ========================= REGISTRASI ========================= */

function registrasi_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sh = getSheet_();
    const nama = clean_(data.nama);
    const toko = clean_(data.toko);
    const wa = normalizeWa_(data.wa);
    const alamat = clean_(data.alamat);
    const email = normalizeEmail_(data.email);
    const ukuran = clean_(data.ukuran);

    if (!nama) throw new Error('Nama peserta wajib diisi.');
    if (!wa) throw new Error('Nomor WhatsApp wajib diisi.');
    if (!alamat) throw new Error('Alamat wajib diisi.');
    if (!ukuran) throw new Error('Ukuran kaos wajib dipilih.');

    const duplikat = cekDuplikatRegistrasi_(sh, wa, email);
    if (duplikat) {
      return json_({
        ok:false, duplicate:true, field:duplikat.field,
        message:'PENDAFTARAN DITOLAK — ' +
          (duplikat.field === 'wa'
            ? 'Nomor WhatsApp sudah terdaftar dengan kode '
            : 'Email sudah terdaftar dengan kode ') + duplikat.peserta.kode,
        peserta:duplikat.peserta
      });
    }

    const hargaInfo = hargaBerlaku_(new Date(), false);
    if (!hargaInfo.ok) throw new Error(hargaInfo.message);

    const kode = buatKodeRegistrasi_(sh);
    let buktiUrl = '';
    if (data.buktiBase64) {
      buktiUrl = simpanBuktiTransfer_(
        data.buktiBase64,
        data.buktiNamaFile || data.buktiNama || ('BUKTI-' + kode + '.jpg')
      );
    }

    const sekarang = new Date();
    const row = new Array(HEADERS.length).fill('');
    row[0] = sekarang;
    row[1] = kode;
    row[2] = nama;
    row[3] = toko;
    row[4] = wa;
    row[5] = alamat;
    row[6] = email;
    row[7] = ukuran;
    row[8] = buktiUrl;
    row[9] = 'BELUM LUNAS';
    row[10] = '';
    row[11] = '';
    row[12] = 'BELUM HADIR';
    row[13] = '';
    row[14] = '';
    row[15] = '';
    row[16] = '';
    row[17] = '';
    row[18] = '';
    row[19] = '';
    row[20] = '';
    row[21] = '';
    row[22] = 'BELUM DIAMBIL';
    row[23] = '';
    row[24] = hargaInfo.tier;              // Tier saat daftar = ESTIMASI
    row[25] = hargaInfo.harga;             // Estimasi
    row[26] = '';                          // Tier pembayaran
    row[27] = '';                          // Harga final

    sh.appendRow(row);

    const peserta = rowToObject_(row);
    logAktivitas_('', 'REGISTRASI', kode,
      'Peserta baru: ' + nama + ' | Estimasi ' + hargaInfo.tier + ' ' + formatRupiah_(hargaInfo.harga));

    return json_({
      ok:true,
      message:'Registrasi berhasil.',
      peserta:peserta
    });
  } finally {
    lock.releaseLock();
  }
}

/* ========================= REGISTRASI LANGSUNG COD =========================
 * Digunakan di lokasi pada hari acara.
 * Peserta baru langsung tercatat LUNAS dengan harga COD.
 */
function registrasiCOD_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sh = getSheet_();
    const nama = clean_(data.nama);
    const toko = clean_(data.toko);
    const wa = normalizeWa_(data.wa);
    const alamat = clean_(data.alamat);
    const email = normalizeEmail_(data.email);
    const ukuran = clean_(data.ukuran);

    if (!nama) throw new Error('Nama peserta wajib diisi.');
    if (!wa) throw new Error('Nomor WhatsApp wajib diisi.');
    if (!alamat) throw new Error('Alamat wajib diisi.');
    if (!ukuran) throw new Error('Ukuran kaos wajib dipilih.');

    const hargaInfo = hargaBerlaku_(new Date(), true);
    if (!hargaInfo.ok || hargaInfo.tier !== 'COD') {
      throw new Error(hargaInfo.message || 'Registrasi COD hanya dapat dilakukan pada hari acara.');
    }

    const duplikat = cekDuplikatRegistrasi_(sh, wa, email);
    if (duplikat) {
      return json_({
        ok:false, duplicate:true, field:duplikat.field,
        message:'PENDAFTARAN DITOLAK — Data sudah terdaftar dengan kode ' + duplikat.peserta.kode,
        peserta:duplikat.peserta
      });
    }

    const kode = buatKodeRegistrasi_(sh);
    const sekarang = new Date();
    const petugas = clean_(data.petugas || data.namaPetugas || '');

    const row = new Array(HEADERS.length).fill('');
    row[0]=sekarang; row[1]=kode; row[2]=nama; row[3]=toko; row[4]=wa;
    row[5]=alamat; row[6]=email; row[7]=ukuran; row[8]='';
    row[9]='LUNAS'; row[10]=hargaInfo.harga; row[11]=sekarang;
    row[12]='BELUM HADIR'; row[13]=''; row[14]='';
    row[15]='COD'; row[16]=petugas; row[17]=sekarang;
    row[18]=petugas; row[19]=sekarang; row[20]=''; row[21]='';
    row[22]='BELUM DIAMBIL'; row[23]='';
    row[24]='COD'; row[25]=hargaInfo.harga;
    row[26]='COD'; row[27]=hargaInfo.harga;

    sh.appendRow(row);

    logAktivitas_(petugas,'REGISTRASI COD',kode,
      'LUNAS | COD | ' + formatRupiah_(hargaInfo.harga));

    return json_({
      ok:true,
      message:'Registrasi COD berhasil: ' + formatRupiah_(hargaInfo.harga),
      peserta:rowToObject_(row)
    });
  } finally {
    lock.releaseLock();
  }
}


/* ========================= DUPLIKAT ========================= */

function cekDuplikatRegistrasi_(sh, waBaru, emailBaru) {
  const data = getAllObjects_(sh);
  const wa = normalizeWa_(waBaru);
  const email = normalizeEmail_(emailBaru);

  for (let i=0;i<data.length;i++) {
    const p = data[i];
    if (wa && normalizeWa_(p.wa) === wa) return {field:'wa',peserta:p};
    if (email && normalizeEmail_(p.email) === email) return {field:'email',peserta:p};
  }
  return null;
}

function buatKodeRegistrasi_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 'REG-0001';

  const values = sh.getRange(2,2,lastRow-1,1).getValues();
  let terbesar = 0;
  values.forEach(function(r) {
    const m = String(r[0] || '').match(/^REG-(\d+)$/i);
    if (m) terbesar = Math.max(terbesar, parseInt(m[1],10));
  });
  return 'REG-' + String(terbesar + 1).padStart(4,'0');
}

/* ========================= CARI ========================= */

function cari_(p) {
  const sh = getSheet_();
  const q = clean_(p.q || p.kode || p.wa || p.email || p.keyword);
  if (!q) return json_({ok:false,message:'Kode, WhatsApp, atau email wajib diisi.'});

  const qWa = normalizeWa_(q);
  const qEmail = normalizeEmail_(q);
  const qKode = normalizeKode_(q);
  const all = getAllObjects_(sh);

  const hasil = all.filter(function(x) {
    return (qKode && normalizeKode_(x.kode) === qKode) ||
      String(x.kode).toLowerCase() === q.toLowerCase() ||
      (qWa && normalizeWa_(x.wa) === qWa) ||
      (qEmail && normalizeEmail_(x.email) === qEmail);
  });

  if (!hasil.length) return json_({ok:false,message:'Peserta tidak ditemukan.',peserta:null});
  return json_({ok:true,peserta:hasil[0]});
}

/* ========================= DATA PESERTA ========================= */

function peserta_(hanyaLunas) {
  const sh = getSheet_();
  let hasil = getAllObjects_(sh);
  if (hanyaLunas) {
    hasil = hasil.filter(function(p) {
      return String(p.statusPembayaran).toUpperCase() === 'LUNAS';
    });
  }
  return json_({ok:true,total:hasil.length,peserta:hasil});
}

/* ========================= PEMBAYARAN TRANSFER =========================
 * Harga FINAL ditentukan berdasarkan TANGGAL PEMBAYARAN.
 * Data.nominal dari frontend DIABAIKAN.
 */

function verifikasiLunas_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sh = getSheet_();
    const kode = clean_(data.kode || data.kodeRegistrasi);
    if (!kode) throw new Error('Kode registrasi wajib diisi.');

    const rowNumber = findRowByKode_(sh, kode);
    if (!rowNumber) return json_({ok:false,message:'Peserta tidak ditemukan.'});

    const row = sh.getRange(rowNumber,1,1,HEADERS.length).getValues()[0];

    if (String(row[9] || '').toUpperCase() === 'LUNAS') {
      return json_({ok:false,message:'Pembayaran peserta ini sudah LUNAS.',peserta:rowToObject_(row)});
    }

    const hargaInfo = hargaBerlaku_(new Date(), false);
    if (!hargaInfo.ok) throw new Error(hargaInfo.message);

    const petugas = clean_(data.petugas || data.namaPetugas || '');
    const sekarang = new Date();

    row[9] = 'LUNAS';
    row[10] = hargaInfo.harga;
    row[11] = sekarang;
    row[15] = 'TRANSFER';
    row[16] = petugas;
    row[17] = sekarang;
    row[18] = petugas;
    row[19] = sekarang;
    row[26] = hargaInfo.tier;
    row[27] = hargaInfo.harga;

    sh.getRange(rowNumber,1,1,HEADERS.length).setValues([row]);

    logAktivitas_(petugas,'VERIFIKASI',kode,
      'LUNAS | ' + hargaInfo.tier + ' | ' + formatRupiah_(hargaInfo.harga));

    return json_({
      ok:true,
      message:'Pembayaran berhasil diverifikasi: ' + hargaInfo.tier + ' — ' + formatRupiah_(hargaInfo.harga),
      peserta:rowToObject_(row)
    });
  } finally {
    lock.releaseLock();
  }
}

/* ========================= COD =========================
 * COD hanya berlaku pada tanggal acara.
 * Harga COD berasal dari PENGATURAN.
 */

function pembayaranCOD_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sh = getSheet_();
    const kode = clean_(data.kode || data.kodeRegistrasi);
    if (!kode) throw new Error('Kode registrasi wajib diisi.');

    const rowNumber = findRowByKode_(sh, kode);
    if (!rowNumber) return json_({ok:false,message:'Peserta tidak ditemukan.'});

    const row = sh.getRange(rowNumber,1,1,HEADERS.length).getValues()[0];

    if (String(row[9] || '').toUpperCase() === 'LUNAS') {
      return json_({ok:false,message:'Pembayaran peserta ini sudah LUNAS.',peserta:rowToObject_(row)});
    }

    const hargaInfo = hargaBerlaku_(new Date(), true);
    if (!hargaInfo.ok || hargaInfo.tier !== 'COD') {
      throw new Error(hargaInfo.message || 'COD hanya dapat digunakan pada hari acara.');
    }

    const petugas = clean_(data.petugas || data.namaPetugas || '');
    const sekarang = new Date();

    row[9] = 'LUNAS';
    row[10] = hargaInfo.harga;
    row[11] = sekarang;
    row[15] = 'COD';
    row[16] = petugas;
    row[17] = sekarang;
    row[18] = petugas;
    row[19] = sekarang;
    row[26] = 'COD';
    row[27] = hargaInfo.harga;

    sh.getRange(rowNumber,1,1,HEADERS.length).setValues([row]);

    logAktivitas_(petugas,'COD',kode,
      'LUNAS | COD | ' + formatRupiah_(hargaInfo.harga));

    return json_({
      ok:true,
      message:'Pembayaran COD berhasil dicatat: ' + formatRupiah_(hargaInfo.harga),
      peserta:rowToObject_(row)
    });
  } finally {
    lock.releaseLock();
  }
}

/* ========================= SCAN / CHECK-IN ========================= */

function checkin_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sh = getSheet_();
    const kode = clean_(data.kode || data.kodeRegistrasi);
    if (!kode) return json_({ok:false,message:'Kode registrasi wajib diisi.'});

    const rowNumber = findRowByKode_(sh,kode);
    if (!rowNumber) return json_({ok:false,message:'Peserta tidak ditemukan.'});

    const row = sh.getRange(rowNumber,1,1,HEADERS.length).getValues()[0];
    const statusPembayaran = String(row[9] || '').toUpperCase();
    const statusHadir = String(row[12] || '').toUpperCase();

    if (statusPembayaran !== 'LUNAS') {
      return json_({
        ok:false,type:'BELUM_LUNAS',
        message:'REGISTRASI GAGAL — Pembayaran belum lunas. Silakan menuju LOKET PEMBAYARAN terlebih dahulu.',
        peserta:rowToObject_(row)
      });
    }

    if (statusHadir === 'HADIR') {
      return json_({
        ok:false,type:'SUDAH_REGISTRASI',alreadyCheckin:true,
        message:'SUDAH REGISTRASI ULANG — Peserta ini sudah melakukan registrasi ulang.',
        peserta:rowToObject_(row)
      });
    }

    const sekarang = new Date();
    const petugas = clean_(data.petugas || data.namaPetugas || '');

    row[12] = 'HADIR';
    row[13] = sekarang;
    row[20] = petugas;
    row[21] = sekarang;
    row[22] = 'SUDAH DIAMBIL';

    sh.getRange(rowNumber,1,1,HEADERS.length).setValues([row]);

    logAktivitas_(petugas,'SCAN',kode,'HADIR - Benefit diberikan');

    return json_({
      ok:true,type:'BERHASIL',
      message:'REGISTRASI ULANG BERHASIL — Pembayaran: LUNAS — Silakan mengambil benefit peserta.',
      peserta:rowToObject_(row)
    });
  } finally {
    lock.releaseLock();
  }
}

/* ========================= HARGA TIER ========================= */

function ambilPengaturan_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SETTINGS_SHEET);
  if (!sh || sh.getLastRow() < 2) return json_({ok:true,pengaturan:{}});

  const values = sh.getRange(2,1,sh.getLastRow()-1,2).getValues();
  const data = {};
  values.forEach(function(r) {
    const key = String(r[0] || '').trim();
    if (key) data[key] = r[1];
  });
  return json_({ok:true,pengaturan:data});
}

function simpanPengaturan_(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SETTINGS_SHEET);
  if (!sh) sh = ss.insertSheet(SETTINGS_SHEET);
  sh.clearContents();
  sh.getRange(1,1,1,2).setValues([['KEY','VALUE']]);

  const settings = [
    ['judul', data.judulAcara || ''],
    ['deskripsi', data.deskripsi || ''],
    ['tanggal', data.tanggal || ''],
    ['tanggalAcara', data.tanggal || data.tanggalAcara || ''],
    ['waktu', data.waktu || ''],
    ['lokasi', data.lokasi || ''],

    ['tier1Harga', angka_(data.tier1Harga)],
    ['tier1Mulai', data.tier1Mulai || ''],
    ['tier1Selesai', data.tier1Selesai || ''],

    ['tier2Harga', angka_(data.tier2Harga)],
    ['tier2Mulai', data.tier2Mulai || ''],
    ['tier2Selesai', data.tier2Selesai || ''],

    ['tier3Harga', angka_(data.tier3Harga)],
    ['tier3Mulai', data.tier3Mulai || ''],
    ['tier3Selesai', data.tier3Selesai || ''],

    ['codHarga', angka_(data.codHarga)],

    ['wa', data.nomorWa || data.wa || ''],
    ['benefit', data.benefit || ''],
    ['pemberiBenefit', data.pemberiBenefit || ''],
    ['petugasRegistrasi', data.petugasRegistrasi || ''],
    ['petugasScan', data.petugasScan || ''],
    ['petugasPembayaran', data.petugasPembayaran || ''],
    ['petugasApproval', data.petugasApproval || ''],
    ['pamflet', data.pamflet || ''],
    ['statusPendaftaran', data.statusPendaftaran || 'DIBUKA']
  ];

  sh.getRange(2,1,settings.length,2).setValues(settings);
  return json_({ok:true,message:'Pengaturan berhasil disimpan.'});
}

/*
 * allowCod = true hanya untuk pembayaran COD.
 * Untuk registrasi biasa, hari acara juga bisa menampilkan COD
 * sebagai harga hari-H agar peserta tahu harga lokasi.
 */
function hargaBerlaku_(date, allowCod) {
  const s = bacaSettingsObject_();
  const today = tanggalLokal_(date);
  const eventDate = normalizeDateKey_(s.tanggalAcara || s.tanggal);

  if (allowCod && eventDate && today === eventDate) {
    const cod = angka_(s.codHarga);
    if (cod <= 0) return {ok:false,message:'Harga COD belum diatur di Pengaturan.'};
    return {ok:true,tier:'COD',harga:cod};
  }

  const tiers = [
    {name:'TIER 1',harga:angka_(s.tier1Harga),mulai:s.tier1Mulai,selesai:s.tier1Selesai},
    {name:'TIER 2',harga:angka_(s.tier2Harga),mulai:s.tier2Mulai,selesai:s.tier2Selesai},
    {name:'TIER 3',harga:angka_(s.tier3Harga),mulai:s.tier3Mulai,selesai:s.tier3Selesai}
  ];

  for (let i=0;i<tiers.length;i++) {
    const t = tiers[i];
    if (!t.harga) continue;
    const mulai = normalizeDateKey_(t.mulai);
    const selesai = normalizeDateKey_(t.selesai);
    if (mulai && selesai && today >= mulai && today <= selesai) {
      return {ok:true,tier:t.name,harga:t.harga};
    }
  }

  return {
    ok:false,
    message:'Tidak ada harga tiket yang aktif untuk tanggal ' + today + '. Silakan periksa periode Tier di Pengaturan.'
  };
}

function bacaSettingsObject_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(SETTINGS_SHEET);
  const data = {};
  if (!sh || sh.getLastRow() < 2) return data;
  sh.getRange(2,1,sh.getLastRow()-1,2).getValues().forEach(function(r) {
    const key = String(r[0] || '').trim();
    if (key) data[key] = r[1];
  });
  return data;
}

function getHargaAktifPublic_() {
  return hargaBerlaku_(new Date(), false);
}

/* ========================= DRIVE ========================= */

function simpanBuktiTransfer_(base64,namaFile) {
  if (!DRIVE_FOLDER_ID) throw new Error('Folder Drive belum disetting.');
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const raw = String(base64 || '');
  const match = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Format bukti transfer tidak valid.');

  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes,match[1],namaFile || ('BUKTI-' + Utilities.getUuid() + '.jpg'));
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  } catch (err) {}

  return 'https://drive.google.com/file/d/' + file.getId() + '/view';
}

/* ========================= LOG ========================= */

function getLogSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET_NAME);
    sh.getRange(1,1,1,5).setValues([['Waktu','Petugas','Aktivitas','Kode Registrasi','Keterangan']]);
  }
  return sh;
}

function logAktivitas_(petugas,aktivitas,kode,keterangan) {
  getLogSheet_().appendRow([new Date(),petugas || '',aktivitas || '',kode || '',keterangan || '']);
}

/* ========================= HELPERS ========================= */

function findRowByKode_(sh,kode) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return null;
  const values = sh.getRange(2,2,lastRow-1,1).getValues();
  const targetRaw = String(kode).trim().toLowerCase();
  const target = normalizeKode_(targetRaw);
  for (let i=0;i<values.length;i++) {
    const savedRaw = String(values[i][0] || '').trim().toLowerCase();
    if (savedRaw === targetRaw) return i+2;
    if (target && normalizeKode_(savedRaw) === target) return i+2;
  }
  return null;
}

function getAllObjects_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const values = sh.getRange(2,1,lastRow-1,HEADERS.length).getValues();
  return values.map(rowToObject_);
}

function rowToObject_(row) {
  return {
    timestamp:formatDate_(row[0]),
    kode:row[1] || '',
    kodeRegistrasi:row[1] || '',
    nama:row[2] || '',
    toko:row[3] || '',
    wa:row[4] || '',
    alamat:row[5] || '',
    email:row[6] || '',
    ukuran:row[7] || '',
    buktiTransfer:normalisasiLinkDrive_(row[8] || ''),
    statusPembayaran:row[9] || 'BELUM LUNAS',
    nominalPembayaran:Number(row[10]) || 0,
    tanggalVerifikasi:formatDate_(row[11]),
    statusKehadiran:row[12] || 'BELUM HADIR',
    jamCheckin:formatDate_(row[13]),
    catatanPanitia:row[14] || '',
    metodePembayaran:row[15] || '',
    petugasPembayaran:row[16] || '',
    waktuPembayaran:formatDate_(row[17]),
    petugasVerifikasi:row[18] || '',
    waktuVerifikasi:formatDate_(row[19]),
    petugasScan:row[20] || '',
    waktuScan:formatDate_(row[21]),
    statusBenefit:row[22] || 'BELUM DIAMBIL',
    catatan:row[23] || '',
    tierRegistrasi:row[24] || '',
    estimasiHarga:Number(row[25]) || 0,
    tierPembayaran:row[26] || '',
    hargaFinal:Number(row[27]) || 0
  };
}

function normalisasiLinkDrive_(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (url.indexOf('drive.google.com') !== -1) return url;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return 'https://drive.google.com/file/d/' + url + '/view';
  }
  return url;
}

function normalizeKode_(value) {
  const s = String(value || '').trim().toUpperCase();
  const m = s.match(/^REG[- ]?(\\d+)$/);
  if (!m) return s;
  return 'REG-' + String(parseInt(m[1],10)).padStart(4,'0');
}

function normalizeWa_(value) {
  let s = String(value || '').replace(/\D/g,'');
  if (!s) return '';
  if (s.indexOf('62') === 0) s = '0' + s.substring(2);
  if (s.indexOf('8') === 0) s = '0' + s;
  return s;
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function clean_(value) {
  return String(value || '').trim();
}

function angka_(value) {
  const n = Number(String(value == null ? '' : value).replace(/[^\d]/g,''));
  return isNaN(n) ? 0 : n;
}

function parsePost_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (err) {}
  }
  return e.parameter || {};
}

function tanggalLokal_(date) {
  return Utilities.formatDate(date,Session.getScriptTimeZone() || 'Asia/Jakarta','yyyy-MM-dd');
}

function normalizeDateKey_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value,Session.getScriptTimeZone() || 'Asia/Jakarta','yyyy-MM-dd');
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d,Session.getScriptTimeZone() || 'Asia/Jakarta','yyyy-MM-dd');
}

function formatDate_(value) {
  if (!value) return '';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return Utilities.formatDate(d,Session.getScriptTimeZone() || 'Asia/Jakarta','dd/MM/yyyy HH:mm:ss');
  } catch (err) { return String(value); }
}

function formatRupiah_(angka) {
  return 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
