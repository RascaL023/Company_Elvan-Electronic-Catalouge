# Laporan Infrastruktur & Kapasitas Website (Gratis/Free Plan)

Laporan ini merangkum batas penggunaan (kuota gratis) dari layanan-layanan cloud yang digunakan untuk menjalankan website Anda. Selama website berjalan di bawah batas kuota ini, **Anda tidak akan dikenakan biaya sama sekali (Rp 0)**.

---

## 1. Penyimpanan Gambar & Aset (ImageKit - Free Plan)
Layanan ini digunakan khusus untuk menyimpan, mengoptimalkan, dan mempercepat pemuatan gambar produk di website agar loading-nya cepat.

* **Kapasitas Penyimpanan & Bandwidth**: Mendapatkan kuota **20 GB per bulan** (Media Library storage + bandwidth). Kuota ini akan direset setiap awal bulan.
* **Optimasi Otomatis**: Gambar otomatis dikompres dan diubah ukurannya agar ringan dibuka oleh pengunjung (misal: otomatis diubah dari format PNG/JPEG yang berat ke WebP yang sangat ringan).
* **Jika Melebihi Batas**:
  * Website tetap berjalan, namun gambar tidak dapat dimuat lagi atau kualitas gambar akan diturunkan sementara hingga kuota kembali direset pada bulan berikutnya, kecuali Anda melakukan upgrade ke paket berbayar.

---

## 2. Jembatan Keamanan Upload/Delete (Cloudflare Workers - Free Plan)
Layanan mini-server (serverless) ini berfungsi sebagai "satpam keamanan" untuk memvalidasi proses upload dan penghapusan otomatis gambar di ImageKit agar data aman dan tidak disalahgunakan.

* **Kuota Request Harian**: Mendapatkan **100.000 request per hari**. Kuota ini direset setiap hari.
  * *Catatan*: 1 kali upload/delete atau 1 kali buka halaman edit produk oleh admin dihitung sebagai 1 request. Kuota ini sangat melimpah dan sangat sulit habis jika hanya digunakan untuk admin website.
* **Kecepatan**: Sangat cepat karena dijalankan di server global Cloudflare terdekat dari pengunjung.
* **Jika Melebihi Batas**:
  * Fitur upload gambar dan delete gambar produk di halaman admin akan berhenti berfungsi sementara waktu (muncul pesan error) sampai kuota direset pada hari berikutnya. Namun, website utama untuk pengunjung umum **tetap dapat dibuka dengan normal**.

---

## 3. Database Utama (Google Cloud Firestore - Spark Plan)
Tempat penyimpanan seluruh data teks website seperti daftar produk, kategori, harga, spesifikasi, dan data admin.

* **Kapasitas Penyimpanan**: Maksimal **1 GB** (Sangat besar untuk ukuran database berupa teks, bisa menampung puluhan ribu data produk).
* **Batasan Transaksi Harian**:
  * **Membaca Data (Reads)**: Maksimal **50.000 dokumen/hari** (Setiap kali pengunjung melihat produk).
  * **Menulis/Mengubah Data (Writes)**: Maksimal **20.000 dokumen/hari** (Setiap kali admin menambah atau mengedit produk).
* **Transfer Data Keluar**: Maksimal **10 GB per bulan** (Data teks yang dikirim ke browser pengunjung).

---

## 4. Hosting / Penyebaran Website (Firebase Hosting - Spark Plan)
Infrastruktur tempat meletakkan file website (HTML, CSS, Javascript) agar bisa diakses oleh publik secara online. Sudah termasuk gratis domain kustom (misal: `tokoanda.com`) dan sertifikat keamanan SSL gratis (icon gembok `https://`).

* **Kapasitas Penyimpanan Website**: Maksimal **10 GB** (Sangat cukup untuk menyimpan kode program website).
* **Kuota Bandwidth**: Maksimal **360 MB per hari**.
  * *Catatan*: Karena gambar produk sudah disimpan di ImageKit, bandwidth Firebase Hosting ini murni hanya terpakai untuk men-download kode website pertama kali oleh pengunjung, sehingga kuota 360 MB per hari ini tergolong cukup aman untuk traffic kecil-menengah.

---

## 5. Sistem Login Admin (Firebase Authentication)
Layanan untuk mengamankan halaman admin agar hanya orang yang memiliki akun terdaftar yang bisa masuk untuk menambah atau mengubah data website.

* **Jumlah Pengguna**: **Tidak terbatas** untuk akun email & password standar.
* **Batas Pengiriman Email Sistem (Harian)**:
  * Email untuk verifikasi pendaftaran: Maksimal 1.000 email per hari.
  * Email untuk reset kata sandi (lupa password): Maksimal 150 email per hari.

---

## PENTING: Apa yang Terjadi jika Kuota Gratis Habis?

1. **Aturan Reset**: Kuota harian akan direset otomatis setiap hari, sementara kuota bulanan (seperti bandwidth hosting dan penyimpanan) akan direset setiap tanggal 1 awal bulan.
2. **Risiko Jika Bandwidth Bulanan Firebase Hosting Habis**:
   * Firebase akan memberikan **masa tenggang (grace period) yang sangat singkat** sesaat setelah kuota 100% habis.
   * Setelah masa tenggang lewat, **website akan dinonaktifkan otomatis**. Pengunjung yang membuka website Anda akan melihat halaman error (misal: *"Site Suspended"* atau *"Quota Exceeded"*).
   * Website akan kembali aktif secara otomatis pada awal bulan berikutnya saat kuota direset, **kecuali** jika Anda memilih untuk meng-upgrade akun Firebase ke paket **Blaze (Pay-as-you-go)** untuk langsung mengaktifkannya kembali seketika dengan sistem bayar sesuai pemakaian berlebih.
