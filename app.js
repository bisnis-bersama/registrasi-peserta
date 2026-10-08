/* =========================================================
   TESPOIN DPD MAJALENGKA
   APP.JS
   Frontend GitHub Pages
   ========================================================= */


/* =========================================================
   API GOOGLE APPS SCRIPT
   ========================================================= */

const TESPOIN_API =
"https://script.google.com/macros/s/AKfycbxPM09axMCDYVMpMjGya5aoCDIhcs5MrcdeP0AlGB2BSzH8a2NigppNmAjV3lSH0-XH/exec";


/* =========================================================
   DATA DEFAULT
   ========================================================= */

const DEFAULT_DATA = {
  judul: "TESPOIN DPD MAJALENGKA",
  deskripsi: "Informasi dan registrasi peserta acara.",
  tanggal: "[TANGGAL ACARA]",
  waktu: "[JAM ACARA]",
  lokasi: "[LOKASI ACARA]",
  tiket: "Rp [HARGA TIKET]",
  kuota: "[JUMLAH] Peserta",
  wa: "[NO. WA PANITIA]",
  benefit: "Kaos • Makan • Sertifikat • Doorprize"
};


/* =========================================================
   PENGATURAN LAMA
   ========================================================= */

function getData() {

  try {

    return JSON.parse(
      localStorage.getItem("acaraSettings")
    ) || DEFAULT_DATA;

  } catch (e) {

    return DEFAULT_DATA;
  }
}


function setText(id, val) {

  const e = document.getElementById(id);

  if (e) {
    e.textContent =
      val !== undefined &&
      val !== null &&
      val !== ""
        ? val
        : "-";
  }
}


/* =========================================================
   INDEX
   ========================================================= */

function loadIndex() {

  const d = getData();

  [
    "judul",
    "deskripsi",
    "tanggal",
    "waktu",
    "lokasi",
    "tiket",
    "kuota",
    "wa",
    "benefit"
  ].forEach(k => {

    setText(k, d[k]);

  });

  setText("siteTitle", d.judul);

  /*
    Jumlah peserta sekarang dari API,
    bukan lagi localStorage.
  */
  loadJumlahPesertaAPI();
}


/* =========================================================
   PENGATURAN
   ========================================================= */

function loadSettings() {

  const d = getData();

  [
    "judul",
    "deskripsi",
    "tanggal",
    "waktu",
    "lokasi",
    "tiket",
    "kuota",
    "wa",
    "benefit"
  ].forEach(k => {

    const e = document.getElementById(k);

    if (e) {
      e.value = d[k] || "";
    }

  });
}


function simpanPengaturan() {

  const d = {};

  [
    "judul",
    "deskripsi",
    "tanggal",
    "waktu",
    "lokasi",
    "tiket",
    "kuota",
    "wa",
    "benefit"
  ].forEach(k => {

    const e =
      document.getElementById(k);

    d[k] =
      e ? e.value : "";

  });


  const f =
    document.getElementById("pamflet");


  if (f && f.files && f.files[0]) {

    const r =
      new FileReader();

    r.onload = () => {

      d.pamflet =
        r.result;

      localStorage.setItem(
        "acaraSettings",
        JSON.stringify(d)
      );

      const msg =
        document.getElementById("msg");

      if (msg) {
        msg.textContent =
          "Pengaturan dan pamflet tersimpan.";
      }

    };

    r.readAsDataURL(
      f.files[0]
    );

  } else {

    d.pamflet =
      getData().pamflet || "";

    localStorage.setItem(
      "acaraSettings",
      JSON.stringify(d)
    );

    const msg =
      document.getElementById("msg");

    if (msg) {
      msg.textContent =
        "Pengaturan tersimpan.";
    }

  }
}


/* =========================================================
   API GET
   ========================================================= */

async function apiGet(
  action,
  params = {}
) {

  const url =
    new URL(TESPOIN_API);

  url.searchParams.set(
    "action",
    action
  );

  url.searchParams.set(
    "_",
    Date.now()
  );


  Object.keys(params).forEach(key => {

    if (
      params[key] !== undefined &&
      params[key] !== null
    ) {

      url.searchParams.set(
        key,
        params[key]
      );

    }

  });


  const res =
    await fetch(
      url.toString(),
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (!res.ok) {
    throw new Error(
      "Gagal menghubungi server."
    );
  }


  return await res.json();
}


/* =========================================================
   API POST
   ========================================================= */

async function apiPost(data) {

  const res =
    await fetch(
      TESPOIN_API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(data)
      }
    );


  if (!res.ok) {

    throw new Error(
      "Gagal mengirim data ke server."
    );
  }


  return await res.json();
}


/* =========================================================
   NORMALISASI PESERTA
   ========================================================= */

function normalPeserta(p) {

  if (!p) {
    return null;
  }


  return {

    timestamp:
      p.timestamp || "",

    kode:
      p.kode ||
      p.kodeRegistrasi ||
      "",

    kodeRegistrasi:
      p.kode ||
      p.kodeRegistrasi ||
      "",


    nama:
      p.nama ||
      p.namaPeserta ||
      "",

    namaPeserta:
      p.nama ||
      p.namaPeserta ||
      "",


    toko:
      p.toko ||
      p.namaToko ||
      "",

    namaToko:
      p.toko ||
      p.namaToko ||
      "",


    wa:
      p.wa ||
      p.noWhatsApp ||
      "",

    noWhatsApp:
      p.wa ||
      p.noWhatsApp ||
      "",


    alamat:
      p.alamat || "",

    email:
      p.email || "",


    ukuran:
      p.ukuran ||
      p.ukuranKaos ||
      "",

    ukuranKaos:
      p.ukuran ||
      p.ukuranKaos ||
      "",


    buktiTransfer:
      p.buktiTransfer || "",


    status:
      p.status ||
      p.statusPembayaran ||
      "BELUM LUNAS",

    statusPembayaran:
      p.statusPembayaran ||
      p.status ||
      "BELUM LUNAS",


    nominal:
      p.nominal ||
      p.nominalPembayaran ||
      0,

    nominalPembayaran:
      p.nominalPembayaran ||
      p.nominal ||
      0,


    tanggalVerifikasi:
      p.tanggalVerifikasi ||
      "",


    statusKehadiran:
      p.statusKehadiran ||
      (
        p.hadir
          ? "HADIR"
          : "BELUM HADIR"
      ),


    hadir:
      p.statusKehadiran === "HADIR" ||
      p.hadir === true,


    jamCheckin:
      p.jamCheckin ||
      "",


    catatan:
      p.catatan ||
      p.catatanPanitia ||
      "",


    metodePembayaran:
      p.metodePembayaran ||
      p.metode ||
      "",


    petugasPembayaran:
      p.petugasPembayaran ||
      p.petugasCOD ||
      "",


    waktuPembayaran:
      p.waktuPembayaran ||
      p.waktuCOD ||
      "",


    petugasVerifikasi:
      p.petugasVerifikasi ||
      "",


    waktuVerifikasi:
      p.waktuVerifikasi ||
      p.tanggalVerifikasi ||
      "",


    petugasScan:
      p.petugasScan ||
      "",


    waktuScan:
      p.waktuScan ||
      p.jamCheckin ||
      "",

    tierRegistrasi:
      p.tierRegistrasi || "",

    estimasiHarga:
      Number(p.estimasiHarga) || 0,

    tierPembayaran:
      p.tierPembayaran || "",

    hargaFinal:
      Number(p.hargaFinal) || 0,


    statusBenefit:
      p.statusBenefit ||
      (
        p.hadir
          ? "SUDAH DIAMBIL"
          : "BELUM DIAMBIL"
      )

  };
}


/* =========================================================
   CARI PESERTA
   ========================================================= */

async function cariPesertaAPI(
  keyword
) {

  keyword =
    String(
      keyword || ""
    ).trim();


  if (!keyword) {

    return {
      ok: false,
      message:
        "Masukkan kode registrasi, WhatsApp, atau email."
    };

  }


  try {

    const data =
      await apiGet(
        "cari",
        {
          kode: keyword,
          q: keyword,
          keyword: keyword
        }
      );


    if (
      !data ||
      !data.ok
    ) {

      return {
        ok: false,
        message:
          data?.message ||
          "Peserta tidak ditemukan."
      };

    }


    const peserta =
      data.peserta ||
      data.data ||
      data.result;


    return {

      ok: true,

      peserta:
        normalPeserta(
          peserta
        )

    };


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Gagal mencari peserta."

    };

  }
}


/* =========================================================
   SEMUA PESERTA
   ========================================================= */

async function ambilSemuaPesertaAPI() {

  try {

    const data =
      await apiGet(
        "peserta"
      );


    if (
      !data ||
      !data.ok
    ) {

      throw new Error(
        data?.message ||
        "Data peserta tidak tersedia."
      );

    }


    const list =
      data.peserta ||
      data.data ||
      [];


    return list.map(
      normalPeserta
    );


  } catch (err) {

    console.error(
      "ambilSemuaPesertaAPI:",
      err
    );

    throw err;
  }
}


/* =========================================================
   PESERTA LUNAS
   ========================================================= */

async function ambilPesertaLunasAPI() {

  try {

    const data =
      await apiGet(
        "lunas"
      );


    if (
      !data ||
      !data.ok
    ) {

      throw new Error(
        data?.message ||
        "Data peserta lunas tidak tersedia."
      );

    }


    const list =
      data.peserta ||
      data.data ||
      [];


    return list.map(
      normalPeserta
    );


  } catch (err) {

    console.error(
      "ambilPesertaLunasAPI:",
      err
    );

    throw err;
  }
}


/* =========================================================
   VERIFIKASI LUNAS
   ========================================================= */

async function verifikasiLunasAPI(
  kode,
  nominal,
  petugas = ""
) {

  kode =
    String(
      kode || ""
    ).trim();


  if (!kode) {

    return {
      ok: false,
      message:
        "Kode registrasi tidak boleh kosong."
    };

  }


  nominal =
    Number(
      String(
        nominal || "0"
      ).replace(
        /[^\d]/g,
        ""
      )
    );


  const namaPetugas =
    petugas ||
    getPetugasLogin();


  try {

    return await apiPost({

      action:
        "verifikasiLunas",

      kode:
        kode,

      kodeRegistrasi:
        kode,

      nominal:
        nominal,

      petugas:
        namaPetugas,

      namaPetugas:
        namaPetugas

    });


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Gagal memverifikasi pembayaran."

    };

  }
}


/* =========================================================
   PEMBAYARAN COD
   ========================================================= */

async function pembayaranCODAPI(
  kode,
  nominal,
  petugas = ""
) {

  kode =
    String(
      kode || ""
    ).trim();


  nominal =
    Number(
      String(
        nominal || "0"
      ).replace(
        /[^\d]/g,
        ""
      )
    );


  if (!kode) {

    return {
      ok: false,
      message:
        "Kode registrasi tidak boleh kosong."
    };

  }


  const namaPetugas =
    petugas ||
    getPetugasLogin();


  try {

    return await apiPost({

      action:
        "pembayaranCOD",

      kode:
        kode,

      kodeRegistrasi:
        kode,

      nominal:
        nominal,

      metodePembayaran:
        "COD",

      petugas:
        namaPetugas,

      namaPetugas:
        namaPetugas

    });


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Pembayaran COD gagal."

    };

  }
}


/* =========================================================
   CHECK-IN / REGISTRASI ULANG
   ========================================================= */

async function checkinAPI(
  kode,
  petugas = ""
) {

  kode =
    String(
      kode || ""
    ).trim();


  if (!kode) {

    return {
      ok: false,
      message:
        "Kode registrasi kosong."
    };

  }


  const namaPetugas =
    petugas ||
    getPetugasLogin();


  try {

    return await apiPost({

      action:
        "checkin",

      kode:
        kode,

      kodeRegistrasi:
        kode,

      petugas:
        namaPetugas,

      namaPetugas:
        namaPetugas

    });


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Registrasi ulang gagal."

    };

  }
}


/* =========================================================
   PROSES SCAN QR
   ========================================================= */

function ambilKodeDariQR(
  text
) {

  text =
    String(
      text || ""
    ).trim();


  if (!text) {
    return "";
  }


  if (
    /^REG-/i.test(text)
  ) {

    return text.toUpperCase();

  }


  try {

    const url =
      new URL(text);


    const kode =
      url.searchParams.get(
        "kode"
      ) ||
      url.searchParams.get(
        "kodeRegistrasi"
      ) ||
      url.searchParams.get(
        "q"
      );


    if (kode) {

      return kode
        .trim()
        .toUpperCase();

    }

  } catch (e) {}


  const match =
    text.match(
      /REG-[A-Z0-9-]+/i
    );


  if (match) {

    return match[0]
      .toUpperCase();

  }


  return text;
}


/* =========================================================
   PROSES HASIL SCAN
   ========================================================= */

async function prosesScanPesertaAPI(
  qrText,
  petugas = ""
) {

  const kode =
    ambilKodeDariQR(
      qrText
    );


  if (!kode) {

    return {

      ok: false,

      message:
        "QR Code tidak valid."

    };

  }


  const hasil =
    await checkinAPI(
      kode,
      petugas
    );


  try {

    sessionStorage.setItem(
      "lastCheckin",
      JSON.stringify({

        kode:
          kode,

        hasil:
          hasil,

        waktu:
          new Date().toISOString()

      })
    );

  } catch (e) {}


  return hasil;
}


/* =========================================================
   PESAN CHECK-IN
   ========================================================= */

function pesanCheckin(
  data
) {

  if (!data) {

    return "Registrasi ulang gagal.";

  }


  if (data.ok === true) {

    return (
      "REGISTRASI ULANG BERHASIL\n\n" +
      "Pembayaran: LUNAS\n" +
      "Silakan mengambil benefit peserta."
    );

  }


  const msg =
    String(
      data.message || ""
    );


  if (
    msg
      .toLowerCase()
      .includes("belum lunas")
  ) {

    return (
      "REGISTRASI GAGAL\n\n" +
      "Pembayaran belum lunas. " +
      "Silakan menuju LOKET PEMBAYARAN terlebih dahulu."
    );

  }


  if (
    msg
      .toLowerCase()
      .includes("sudah registrasi") ||

    msg
      .toLowerCase()
      .includes("sudah hadir")
  ) {

    const jam =
      data.jamCheckin ||
      data.waktuScan ||
      "";


    return (
      "SUDAH REGISTRASI ULANG\n\n" +
      "Peserta ini sudah melakukan registrasi ulang" +
      (
        jam
          ? " pada " + jam
          : ""
      ) +
      ".\n" +
      "Benefit sudah tercatat. " +
      "Tidak dapat mengambil benefit kembali."
    );

  }


  return (
    msg ||
    "Registrasi ulang gagal."
  );
}


/* =========================================================
   PETUGAS
   ========================================================= */

function getPetugasLogin() {

  try {

    const keys = [

      "petugasLogin",

      "namaPetugas",

      "petugas",

      "userLogin",

      "username"

    ];


    for (
      const key of keys
    ) {

      const value =
        sessionStorage.getItem(
          key
        ) ||
        localStorage.getItem(
          key
        );


      if (value) {

        try {

          const obj =
            JSON.parse(
              value
            );


          if (
            obj &&
            typeof obj === "object"
          ) {

            return (
              obj.nama ||
              obj.namaPetugas ||
              obj.username ||
              obj.name ||
              value
            );

          }

        } catch (e) {}


        return value;

      }

    }


  } catch (e) {}


  return "PANITIA";
}


function setPetugasLogin(
  nama,
  role = ""
) {

  const data = {

    nama:
      String(
        nama || ""
      ).trim(),

    role:
      String(
        role || ""
      ).trim(),

    loginAt:
      new Date().toISOString()

  };


  sessionStorage.setItem(
    "petugasLogin",
    JSON.stringify(
      data
    )
  );


  localStorage.setItem(
    "namaPetugas",
    data.nama
  );


  if (data.role) {

    localStorage.setItem(
      "rolePetugas",
      data.role
    );

  }


  return data;
}


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiahAPI(
  nominal
) {

  const angka =
    Number(
      String(
        nominal || 0
      ).replace(
        /[^\d]/g,
        ""
      )
    ) || 0;


  return (
    "Rp " +
    angka.toLocaleString(
      "id-ID"
    )
  );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   DETAIL PESERTA
   ========================================================= */

function renderDetailPesertaAPI(
  p
) {

  p =
    normalPeserta(p);


  if (!p) {

    return `
      <p>
        Data peserta tidak ditemukan.
      </p>
    `;

  }


  return `

    <div class="detail-peserta-api">

      <h3>DATA PESERTA</h3>

      <p>
        <b>Kode Registrasi</b><br>
        ${escapeHTML(p.kode)}
      </p>

      <p>
        <b>Nama Peserta</b><br>
        ${escapeHTML(p.nama)}
      </p>

      <p>
        <b>Nama Toko</b><br>
        ${escapeHTML(p.toko || "-")}
      </p>

      <p>
        <b>No. WhatsApp</b><br>
        ${escapeHTML(p.wa)}
      </p>

      <p>
        <b>Alamat</b><br>
        ${escapeHTML(p.alamat)}
      </p>

      <p>
        <b>Email</b><br>
        ${escapeHTML(p.email || "-")}
      </p>

      <p>
        <b>Ukuran Kaos</b><br>
        ${escapeHTML(p.ukuran)}
      </p>

      <hr>

      <h3>PEMBAYARAN</h3>

      <p>
        <b>Status</b><br>
        ${escapeHTML(
          p.statusPembayaran
        )}
      </p>

      <p>
        <b>Nominal</b><br>
        ${formatRupiahAPI(
          p.nominalPembayaran
        )}
      </p>

      <p>
        <b>Metode Pembayaran</b><br>
        ${escapeHTML(
          p.metodePembayaran || "-"
        )}
      </p>

      <p>
        <b>Petugas Pembayaran COD</b><br>
        ${escapeHTML(
          p.petugasPembayaran || "-"
        )}
      </p>

      <p>
        <b>Waktu Pembayaran COD</b><br>
        ${escapeHTML(
          p.waktuPembayaran || "-"
        )}
      </p>

      <p>
        <b>Petugas Verifikasi</b><br>
        ${escapeHTML(
          p.petugasVerifikasi || "-"
        )}
      </p>

      <p>
        <b>Waktu Verifikasi</b><br>
        ${escapeHTML(
          p.waktuVerifikasi || "-"
        )}
      </p>

      <hr>

      <h3>REGISTRASI ULANG</h3>

      <p>
        <b>Status Kehadiran</b><br>
        ${escapeHTML(
          p.statusKehadiran
        )}
      </p>

      <p>
        <b>Petugas Scan</b><br>
        ${escapeHTML(
          p.petugasScan || "-"
        )}
      </p>

      <p>
        <b>Waktu Scan</b><br>
        ${escapeHTML(
          p.waktuScan || "-"
        )}
      </p>

      <p>
        <b>Status Benefit</b><br>
        ${escapeHTML(
          p.statusBenefit
        )}
      </p>

      ${
        p.buktiTransfer
          ? `
            <hr>

            <h3>BUKTI TRANSFER</h3>

            <a
              href="${escapeHTML(
                p.buktiTransfer
              )}"
              target="_blank"
              rel="noopener">
              LIHAT BUKTI TRANSFER
            </a>
          `
          : ""
      }

    </div>

  `;
}


/* =========================================================
   BUKTI TRANSFER
   ========================================================= */

function renderBuktiTransferAPI(
  p
) {

  p =
    normalPeserta(p);


  if (!p) {

    return `
      <p>
        Peserta tidak ditemukan.
      </p>
    `;

  }


  if (!p.buktiTransfer) {

    return `

      <div class="bukti-kosong">

        <b>
          BUKTI TRANSFER BELUM TERSEDIA
        </b>

        <br>

        <small>
          Silakan cocokkan dengan mutasi rekening.
        </small>

      </div>

    `;

  }


  return `

    <div class="bukti-transfer-api">

      <h3>BUKTI TRANSFER</h3>

      <p>
        <b>
          ${escapeHTML(p.nama)}
        </b>

        <br>

        ${escapeHTML(p.kode)}
      </p>

      <a
        href="${escapeHTML(
          p.buktiTransfer
        )}"
        target="_blank"
        rel="noopener"
        class="btn-bukti">

        LIHAT BUKTI TRANSFER

      </a>

    </div>

  `;
}


/* =========================================================
   FILTER PESERTA
   ========================================================= */

function filterPesertaAPI(
  list,
  status
) {

  list =
    Array.isArray(list)
      ? list.map(
          normalPeserta
        )
      : [];


  if (
    !status ||
    status === "SEMUA"
  ) {

    return list;

  }


  if (
    status === "BELUM LUNAS"
  ) {

    return list.filter(
      p =>
        p.statusPembayaran !==
        "LUNAS"
    );

  }


  if (
    status === "LUNAS"
  ) {

    return list.filter(
      p =>
        p.statusPembayaran ===
        "LUNAS"
    );

  }


  if (
    status === "HADIR"
  ) {

    return list.filter(
      p =>
        p.statusKehadiran ===
        "HADIR"
    );

  }


  return list;
}


/* =========================================================
   STATISTIK
   ========================================================= */

function hitungStatistikPesertaAPI(
  list
) {

  list =
    Array.isArray(list)
      ? list.map(
          normalPeserta
        )
      : [];


  const total =
    list.length;


  const lunas =
    list.filter(
      p =>
        p.statusPembayaran ===
        "LUNAS"
    ).length;


  const belumLunas =
    list.filter(
      p =>
        p.statusPembayaran !==
        "LUNAS"
    ).length;


  const hadir =
    list.filter(
      p =>
        p.statusKehadiran ===
        "HADIR"
    ).length;


  return {

    total:
      total,

    lunas:
      lunas,

    belumLunas:
      belumLunas,

    hadir:
      hadir

  };
}


/* =========================================================
   UPDATE STATISTIK
   ========================================================= */

function updateStatistikPesertaAPI(
  list
) {

  const s =
    hitungStatistikPesertaAPI(
      list
    );


  setText(
    "total",
    s.total
  );


  setText(
    "belum",
    s.belumLunas
  );


  setText(
    "lunas",
    s.lunas
  );


  setText(
    "hadir",
    s.hadir
  );


  setText(
    "jumlah",
    s.total +
    " peserta"
  );


  setText(
    "totalPeserta",
    s.total
  );


  setText(
    "jumlahLunas",
    s.lunas
  );


  setText(
    "jumlahHadir",
    s.hadir
  );


  return s;
}


/* =========================================================
   LOAD PESERTA DARI SERVER
   ========================================================= */

async function loadPesertaAPI() {

  try {

    const list =
      await ambilSemuaPesertaAPI();


    updateStatistikPesertaAPI(
      list
    );


    sessionStorage.setItem(
      "pesertaAPI",
      JSON.stringify(
        list
      )
    );


    return list;


  } catch (err) {

    console.error(
      "loadPesertaAPI:",
      err
    );


    const tbody =
      document.getElementById(
        "tbody"
      );


    if (tbody) {

      tbody.innerHTML = `

        <tr>

          <td
            colspan="20"
            style="
              text-align:center;
              color:#c00;
              padding:20px;
            ">

            Gagal mengambil data peserta.

            <br>

            ${escapeHTML(
              err.message
            )}

          </td>

        </tr>

      `;

    }


    throw err;
  }
}


/* =========================================================
   JUMLAH PESERTA DI INDEX
   ========================================================= */

async function loadJumlahPesertaAPI() {

  try {

    const list =
      await ambilSemuaPesertaAPI();


    const s =
      hitungStatistikPesertaAPI(
        list
      );


    setText(
      "jumlah",
      s.total +
      " peserta"
    );


    setText(
      "totalPeserta",
      s.total
    );


    setText(
      "jumlahLunas",
      s.lunas
    );


    setText(
      "jumlahHadir",
      s.hadir
    );


    return s;


  } catch (err) {

    console.error(
      "loadJumlahPesertaAPI:",
      err
    );


    return {

      total: 0,

      lunas: 0,

      belumLunas: 0,

      hadir: 0

    };

  }
}


/* =========================================================
   CARI DAN TAMPILKAN
   ========================================================= */

async function cariDanTampilkanPesertaAPI(
  keyword,
  targetId
) {

  const target =
    document.getElementById(
      targetId
    );


  if (target) {

    target.innerHTML =
      "<p>Mencari peserta...</p>";

  }


  const hasil =
    await cariPesertaAPI(
      keyword
    );


  if (!hasil.ok) {

    if (target) {

      target.innerHTML = `

        <p
          style="
            color:#c00;
            font-weight:bold;
          ">

          ${escapeHTML(
            hasil.message
          )}

        </p>

      `;

    }


    return null;

  }


  if (target) {

    target.innerHTML =
      renderDetailPesertaAPI(
        hasil.peserta
      );

  }


  return hasil.peserta;
}


/* =========================================================
   KODE REGISTRASI LAMA
   ========================================================= */

function kodeBaru() {

  const n =
    Number(
      localStorage.getItem(
        "counter"
      ) || "0"
    ) + 1;


  localStorage.setItem(
    "counter",
    n
  );


  const d =
    new Date();


  const t =
    d.getFullYear()
      .toString()
      .slice(-2) +

    String(
      d.getMonth() + 1
    ).padStart(2, "0") +

    String(
      d.getDate()
    ).padStart(2, "0");


  return (
    "TES-" +
    t +
    "-" +
    String(n).padStart(
      4,
      "0"
    )
  );
}


function initReg() {

  setText(
    "kode",
    kodeBaru()
  );

}


/* =========================================================
   LOGIN DEMO LAMA
   ========================================================= */

function loginDemo() {

  localStorage.setItem(
    "adminLogin",
    "true"
  );

  location.href =
    "pengaturan.html";
}


/* =========================================================
   IDENTITAS PETUGAS
   ========================================================= */

function getPetugasLogin() {

  try {

    const keys = [

      "petugasLogin",

      "namaPetugas",

      "petugas",

      "userLogin",

      "username"

    ];


    for (
      const key of keys
    ) {

      const value =
        sessionStorage.getItem(
          key
        ) ||
        localStorage.getItem(
          key
        );


      if (value) {

        try {

          const obj =
            JSON.parse(
              value
            );


          if (
            obj &&
            typeof obj ===
              "object"
          ) {

            return (
              obj.nama ||
              obj.namaPetugas ||
              obj.username ||
              obj.name ||
              value
            );

          }

        } catch (e) {}


        return value;

      }

    }

  } catch (e) {}


  return "PANITIA";
}


function setPetugasLogin(
  nama,
  role = ""
) {

  const data = {

    nama:
      String(
        nama || ""
      ).trim(),

    role:
      String(
        role || ""
      ).trim(),

    loginAt:
      new Date().toISOString()

  };


  sessionStorage.setItem(
    "petugasLogin",
    JSON.stringify(
      data
    )
  );


  localStorage.setItem(
    "namaPetugas",
    data.nama
  );


  if (data.role) {

    localStorage.setItem(
      "rolePetugas",
      data.role
    );

  }


  return data;
}


/* =========================================================
   PEMBAYARAN COD
   ========================================================= */

async function pembayaranCODAPI(
  kode,
  nominal,
  petugas = ""
) {

  kode =
    String(
      kode || ""
    ).trim();


  nominal =
    Number(
      String(
        nominal || "0"
      ).replace(
        /[^\d]/g,
        ""
      )
    );


  if (!kode) {

    return {

      ok: false,

      message:
        "Kode registrasi tidak boleh kosong."

    };

  }


  if (
    !nominal ||
    nominal <= 0
  ) {

    return {

      ok: false,

      message:
        "Masukkan nominal pembayaran COD."

    };

  }


  const namaPetugas =
    petugas ||
    getPetugasLogin();


  try {

    return await apiPost({

      action:
        "pembayaranCOD",

      kode:
        kode,

      kodeRegistrasi:
        kode,

      nominal:
        nominal,

      metodePembayaran:
        "COD",

      petugas:
        namaPetugas,

      namaPetugas:
        namaPetugas

    });


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Pembayaran COD gagal."

    };

  }
}


/* =========================================================
   VERIFIKASI PEMBAYARAN
   ========================================================= */

async function verifikasiLunasAPI(
  kode,
  nominal,
  petugas = ""
) {

  kode =
    String(
      kode || ""
    ).trim();


  nominal =
    Number(
      String(
        nominal || "0"
      ).replace(
        /[^\d]/g,
        ""
      )
    );


  if (!kode) {

    return {

      ok: false,

      message:
        "Kode registrasi tidak boleh kosong."

    };

  }


  if (
    !nominal ||
    nominal <= 0
  ) {

    return {

      ok: false,

      message:
        "Nominal pembayaran belum benar."

    };

  }


  const namaPetugas =
    petugas ||
    getPetugasLogin();


  try {

    return await apiPost({

      action:
        "verifikasiLunas",

      kode:
        kode,

      kodeRegistrasi:
        kode,

      nominal:
        nominal,

      petugas:
        namaPetugas,

      namaPetugas:
        namaPetugas

    });


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Gagal memverifikasi pembayaran."

    };

  }
}


/* =========================================================
   CHECK-IN
   ========================================================= */

async function checkinAPI(
  kode,
  petugas = ""
) {

  kode =
    String(
      kode || ""
    ).trim();


  if (!kode) {

    return {

      ok: false,

      message:
        "Kode registrasi kosong."

    };

  }


  const namaPetugas =
    petugas ||
    getPetugasLogin();


  try {

    return await apiPost({

      action:
        "checkin",

      kode:
        kode,

      kodeRegistrasi:
        kode,

      petugas:
        namaPetugas,

      namaPetugas:
        namaPetugas

    });


  } catch (err) {

    return {

      ok: false,

      message:
        err.message ||
        "Registrasi ulang gagal."

    };

  }
}


/* =========================================================
   QR CODE
   ========================================================= */

function ambilKodeDariQR(
  text
) {

  text =
    String(
      text || ""
    ).trim();


  if (!text) {
    return "";
  }


  if (
    /^REG-/i.test(text)
  ) {

    return text.toUpperCase();

  }


  try {

    const url =
      new URL(text);


    const kode =
      url.searchParams.get(
        "kode"
      ) ||
      url.searchParams.get(
        "kodeRegistrasi"
      ) ||
      url.searchParams.get(
        "q"
      );


    if (kode) {

      return kode
        .trim()
        .toUpperCase();

    }

  } catch (e) {}


  const match =
    text.match(
      /REG-[A-Z0-9-]+/i
    );


  if (match) {

    return match[0]
      .toUpperCase();

  }


  return text;
}


async function prosesScanPesertaAPI(
  qrText,
  petugas = ""
) {

  const kode =
    ambilKodeDariQR(
      qrText
    );


  if (!kode) {

    return {

      ok: false,

      message:
        "QR Code tidak valid."

    };

  }


  const hasil =
    await checkinAPI(
      kode,
      petugas
    );


  try {

    sessionStorage.setItem(
      "lastCheckin",
      JSON.stringify({

        kode:
          kode,

        hasil:
          hasil,

        waktu:
          new Date().toISOString()

      })
    );

  } catch (e) {}


  return hasil;
}


/* =========================================================
   PESAN CHECK-IN
   ========================================================= */

function pesanCheckin(
  data
) {

  if (!data) {

    return (
      "Registrasi ulang gagal."
    );

  }


  if (data.ok === true) {

    return (
      "REGISTRASI ULANG BERHASIL\n\n" +
      "Pembayaran: LUNAS\n" +
      "Silakan mengambil benefit peserta."
    );

  }


  const msg =
    String(
      data.message || ""
    );


  if (
    msg
      .toLowerCase()
      .includes(
        "belum lunas"
      )
  ) {

    return (
      "REGISTRASI GAGAL\n\n" +
      "Pembayaran belum lunas. " +
      "Silakan menuju LOKET PEMBAYARAN terlebih dahulu."
    );

  }


  if (
    msg
      .toLowerCase()
      .includes(
        "sudah registrasi"
      ) ||

    msg
      .toLowerCase()
      .includes(
        "sudah hadir"
      )
  ) {

    const jam =
      data.jamCheckin ||
      data.waktuScan ||
      "";


    return (
      "SUDAH REGISTRASI ULANG\n\n" +
      "Peserta ini sudah melakukan registrasi ulang" +
      (
        jam
          ? " pada " + jam
          : ""
      ) +
      ".\n" +
      "Benefit sudah tercatat. " +
      "Tidak dapat mengambil benefit kembali."
    );

  }


  return (
    msg ||
    "Registrasi ulang gagal."
  );
}


/* =========================================================
   LOAD DATA SAAT HALAMAN DIBUKA
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    /*
      Index
    */

    if (
      document.getElementById(
        "jumlah"
      ) ||
      document.getElementById(
        "totalPeserta"
      ) ||
      document.getElementById(
        "jumlahLunas"
      )
    ) {

      loadIndex();

    }


    /*
      Pengaturan
    */

    if (
      document.getElementById(
        "judul"
      ) &&
      document.getElementById(
        "pamflet"
      )
    ) {

      loadSettings();

    }


    /*
      Registrasi lama
    */

    if (
      document.getElementById(
        "kode"
      )
    ) {

      initReg();

    }


    /*
      Pamflet
    */

    const d =
      getData();


    const img =
      document.getElementById(
        "pImg"
      );


    if (
      img &&
      d.pamflet
    ) {

      img.src =
        d.pamflet;

    }

  }
);
