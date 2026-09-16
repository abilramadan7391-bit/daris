# Sistem Monitoring Tahfidz Qur'an - Madrasah Darul Istiqomah

Aplikasi web modern untuk pencatatan dan pemantauan hafalan Al-Qur'an santri di **Madrasah Darul Istiqomah**. Didesain dengan antarmuka *Bento-Grid* bernuansa *Deep Forest Green*, ringan, cepat, dan siap dideploy 100% menggunakan paket **Free Tier** di **Netlify** dan **Supabase**.

---

## 🌟 Fitur Utama

### 1. Tiga Tingkatan Akses Pengguna (3 Roles)
- 👑 **Admin Utama**: Akses penuh mengelola sistem, membuat kelas baru, menunjuk wali kelas ustadz, menentukan kode PIN 4-angka kelas, serta menambah surah baru ke katalog.
- 👳‍♂️ **Ustadz / Ustadzah**: Mengakses kelas binaannya dengan verifikasi **PIN 4-angka khusus**, mencatat setoran hafalan harian santri, menambah santri baru, dan mengedit data santri.
- 👨‍👩‍👧 **Tamu / Pengunjung (Wali Santri / Publik)**: Mode baca saja (*read-only*) untuk melihat ringkasan dashboard, mencari nama atau NIS anak, serta membuka buku rapor hafalan digital.

### 2. Form Setoran Pintar (Search Autocomplete)
- **Pencarian Surah Cepat**: Ketik nama surah (contoh: *An-Naba*, *Al-Ikhlas*) untuk memilih otomatis dari 37 Surah Juz 30 (Juz Amma) atau surah tambahan lainnya.
- **Validasi Rentang Ayat**: Ayat awal dan ayat akhir divalidasi otomatis sesuai jumlah total ayat surah.
- **Predikat Kelancaran**: Tombol pill cepat **[ A ]** *(Mumtaz)*, **[ B ]** *(Jayyid)*, dan **[ C ]** *(Perlu Mengulang)*.
- **Efek Konfeti**: Animasi konfeti saat santri meraih predikat A.

### 3. Batas Keamanan Antar Ustadz (Isolasi Kelas)
- Setiap kelas diasuh oleh 1 ustadz/ustadzah.
- Ustadz hanya dapat mengelola kelas asuhannya sendiri setelah memverifikasi **PIN 4-angka**.
- Admin Utama memiliki hak *super-access* untuk memantau semua kelas secara langsung.

### 4. Rapor Tahfidz Digital Siap Cetak
- Menampilkan profil santri, statistik predikat A/B/C, visualisasi kelulusan surah-surah Juz 30 (*checklist grid*), serta histori catatan ustadz.
- Dilengkapi tombol **Cetak Rapor** untuk arsip fisik madrasah atau laporan ke orang tua.

---

## 🚀 Panduan Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori proyek
cd /home/khoiru/Documents/web_madrasah

# 2. Jalankan server lokal
corepack pnpm run dev
```

Buka peramban di `http://localhost:3000`.

> **Catatan Demo**: Aplikasi dilengkapi sistem penyimpanan lokal (*reactive localStorage store*). Anda bisa langsung mencoba seluruh fitur (login Admin, Ustadz, input setoran, buat kelas) secara instan tanpa perlu menunggu setup Supabase!

### Akun Demo Bawaan:
- **Admin Utama**: `H. Abdullah Robbani` (Akses penuh)
- **Ustadz Ahmad Fauzi**: Wali Kelas *Tahfidz 1A* (Kode PIN: `1234`)
- **Ustadzah Siti Maryam**: Wali Kelas *Tahfidz 1B* (Kode PIN: `5678`)

---

## 🗄️ Menghubungkan ke Supabase (Free Tier)

1. Buat akun gratis di [supabase.com](https://supabase.com/) dan buat project baru.
2. Buka menu **SQL Editor** pada dashboard Supabase Anda.
3. Buka file `supabase_schema.sql` pada proyek ini, salin seluruh isinya, lalu tempel (*paste*) dan klik tombol **Run**.
4. Buka menu **Project Settings -> API** di Supabase, lalu salin:
   - **Project URL**
   - **Project API Anon Key**
5. Buat file `.env` di folder proyek ini:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 🌐 Panduan Deploy ke Netlify (Free Tier)

1. Buat repository baru di GitHub dan lakukan push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sistem Monitoring Tahfidz Darul Istiqomah"
   git remote add origin https://github.com/username/web_madrasah.git
   git branch -M main
   git push -u origin main
   ```
2. Buka [app.netlify.com](https://app.netlify.com/) dan klik **Add new site** -> **Import an existing project**.
3. Pilih repository GitHub Anda. Netlify akan otomatis mendeteksi pengaturan dari `netlify.toml`:
   - **Build command**: `corepack pnpm run build`
   - **Publish directory**: `dist`
4. Tambahkan Environment Variables di Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy Site**! Website madrasah Anda kini online dengan domain gratis seperti `madrasah-darul-istiqomah.netlify.app`.
