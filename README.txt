STRUKTUR TESPOIN REGISTRASI

Halaman:
1 index.html              = landing page, membaca pengaturan acara
2 pengaturan.html         = admin mengatur acara
3 registrasi.html         = form peserta
4 bukti.html              = bukti registrasi + QR
5 peserta.html            = semua peserta (lunas & belum)
6 lunas.html              = peserta yang sudah LUNAS
7 registrasi-ulang.html   = scan QR, tampil data lengkap, check-in sekali
8 pamplet.html            = pamflet lengkap
9 login.html              = login panitia

ATURAN PENTING:
- Status pembayaran LUNAS/BELUM LUNAS hanya diubah ADMIN.
- QR/barcode hanya identitas peserta dan membaca data terbaru.
- QR tidak pernah mengubah status pembayaran.
- Registrasi ulang hanya bisa berhasil satu kali per peserta.
- Setelah HADIR, scan ulang ditolak/diberi keterangan SUDAH REGISTRASI ULANG.
- Data yang ditampilkan saat scan: kode, nama, toko, alamat, no WA, email, ukuran kaos, status pembayaran, nominal, status kehadiran, jam check-in.
- Spreadsheet "Peserta sertifikasi" tidak digunakan.
- Backend berikutnya: Google Apps Script -> Google Spreadsheet + Google Drive.
