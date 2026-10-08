TESPOIN DPD MAJALENGKA — FINAL 2026-10-08

BACKEND
- Code.gs memakai Spreadsheet ID dan API yang sama.
- GET: ping, cari, caripeserta, caribukti, peserta, lunas, pengaturan, harga.
- POST: registrasi, registrasicod, verifikasilunas, pembayarancod, checkin, simpanpengaturan.
- Harga transfer ditentukan berdasarkan TANGGAL PEMBAYARAN.
- COD hanya melalui endpoint registrasiCOD/pembayaranCOD pada HARI ACARA.
- REG-3 / REG-03 / REG-003 / REG-0003 dicari sebagai REG-0003.
- Ukuran kaos: S, M, L, XL, XXL, XXXL, XXXXL.

HALAMAN
- index.html
- index-admin.html
- pengaturan.html
- registrasi.html
- registrasi-cod.html
- peserta.html
- lunas.html
- bukti.html
- registrasi-ulang.html
- pamplet.html
- login.html

DEPLOY
1. Ganti Code.gs di Apps Script dengan Code.gs di paket ini.
2. Save.
3. Deploy > Manage deployments > Edit > New version > Deploy.
4. URL Web App tetap URL yang sama.
5. Upload semua HTML ke GitHub Pages.
