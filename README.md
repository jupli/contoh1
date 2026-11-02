# AmalQu — Situs Wakaf Mushaf Al-Qur'an (multi-halaman)

Situs wakaf/sedekah mushaf Al-Qur'an dengan **8 halaman + 404**, gerbang pembayaran (QRIS & transfer bank), notifikasi donasi, dan papan donasi langsung. Teks, warna, dan gambar diambil dari amalqu.com.

## Halaman

| Rute | Isi |
| --- | --- |
| `#/` | Beranda: banner program, headline, panel statistik langsung, tiga langkah berwakaf, donasi terbaru, teaser mushaf & galeri |
| `#/tentang` | Cerita wakaf untuk orang tua, profil Yayasan, 6 alasan (akordeon), legalitas |
| `#/keutamaan` | 8 keutamaan wakaf Al-Qur'an, video penyaluran, ajakan |
| `#/mushaf` | Spesifikasi mushaf + 12 pilihan nominal; memilih nominal langsung mengisi formulir wakaf |
| `#/penyaluran` | Laporan penyaluran: tab dokumentasi (19 foto) dan bukti transfer (12), dengan lightbox |
| `#/wakaf` | Formulir 3 langkah, metode pembayaran, rekening resmi & QRIS |
| `#/papan-donasi` | Papan donasi langsung: ticker, total animasi, daftar donatur + ucapan, bukti transfer |
| `#/kontak` | Kanal kontak, sosial media, legalitas, FAQ |
| `#/*` | 404 dengan tautan ke semua halaman |

Routing memakai **HashRouter** sehingga situs jalan di host statis mana pun tanpa konfigurasi server — termasuk saat `dist/index.html` dibuka langsung. `vercel.json` sudah punya rewrite SPA, jadi kalau ingin URL bersih (`/tentang`), ganti `HashRouter` menjadi `BrowserRouter` di `src/App.tsx`.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/index.html (semua JS & CSS di-inline)
npm run preview
```

Butuh **Node 22.x** (dikunci lewat `engines`).

## Deploy ke Vercel

1. Push repo → Vercel *Add New Project* → impor.
2. Framework **Vite** terdeteksi otomatis; `vercel.json` mengatur build command, output `dist`, rewrite SPA (mengecualikan `/api/*`), dan header keamanan + CSP.
3. Deploy. Tanpa environment variable wajib.

Atau lewat CLI: `vercel` lalu `vercel --prod`.

## Alur donasi

1. Isi nama, WhatsApp, nominal, dan atas nama & doa → validasi di klien.
2. Pilih metode: **QRIS** atau **Transfer Bank** → invoice `AMQ-XXXXXX` dibuat dengan hitung mundur 15 menit (tetap berlanjut setelah halaman dimuat ulang; otomatis kedaluwarsa bila lewat).
3. Modal pembayaran: QRIS resmi AmalQu (bisa diperbesar), QR invoice yang menuju halaman checkout, atau rekening resmi + kode unik 3 digit dengan tombol salin.
4. Status berhasil → **notifikasi** (toast, layar perayaan dengan confetti, dan notifikasi sistem bila diizinkan) dan nama donatur **langsung tertera** di papan donasi dengan ucapan: *Jazakumullah Khairan Katsiran atas donasi dari : … sebesar : … semoga ALLAH melipat gandakan amal sholeh saudara/saudari…*

Data donasi disimpan di `localStorage`. Untuk membuat nama donatur tampil bagi **semua** pengunjung, sambungkan `src/store/donations.tsx` ke backend (Vercel KV/Postgres atau Supabase) — lihat varian A. Untuk pembayaran sungguhan, pakai Midtrans/Xendit dengan webhook — lihat varian B.

## Tes QA (opsional)

Playwright tidak dipasang di `package.json` agar instalasi di Vercel ringan.

```bash
npm i -D playwright
npx playwright install --with-deps chromium
npm run preview -- --port 4173 &
node tests/routes.mjs     # semua rute, menu mobile, alur donasi, deep link, back/forward, overflow
node tests/csp-check.mjs  # menguji dist/ dengan header & CSP persis dari vercel.json
```

## Struktur

```
src/
  App.tsx                    # HashRouter + 9 rute + provider
  data.ts                    # teks, harga, kontak, rekening, navigasi, FAQ, URL gambar
  index.css                  # design token, ambient background, komponen & animasi
  pages/                     # Home, Tentang, Keutamaan, Mushaf, Penyaluran, Wakaf, PapanDonasi, Kontak, NotFound
  store/donations.tsx        # invoice, status pembayaran, papan donasi, persistensi
  utils/page.ts              # judul & meta description per halaman
  components/
    Layout.tsx               # header + navigasi aktif, menu mobile, ribbon langsung, footer, CTA melayang
    PageHero.tsx             # kepala halaman editorial + breadcrumb
    DonationForm.tsx         # alur 3 langkah
    PaymentModal.tsx         # QRIS/transfer, hitung mundur, salin nominal
    Celebration.tsx          # notifikasi sukses + confetti + ucapan
    DonationWall.tsx         # ticker, total animasi, daftar donatur
    Gallery.tsx              # karusel + lightbox
    PaymentMethods.tsx       # rekening resmi + QRIS
    Toaster.tsx  Dialog.tsx  SourceImage.tsx
tests/                       # skrip QA Playwright
```
