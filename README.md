# AmalQu — Varian A: situs multi-halaman + papan donasi bersama

Landing page wakaf/sedekah mushaf Al-Qur'an yang dikembangkan menjadi **situs multi-halaman** (8 halaman + 404), dengan satu pembeda utama varian ini: **nama donatur tampil untuk semua pengunjung**, bukan hanya di perangkat masing-masing.

Teks, warna, dan gambar diambil dari amalqu.com.

## Yang membuat ini Varian A

| Bagian | Berkas | Peran |
| --- | --- | --- |
| Backend papan donasi | `api/donations.ts` | Edge Function `GET`/`POST` yang menyimpan donatur di Vercel KV |
| Sinkronisasi klien | `src/store/donations.tsx` | `remote`, `remoteNotice`, `publishDonation()`, merge entri server + lokal (dedupe per ID invoice) |
| Status koneksi | `src/components/DonationWall.tsx` | Menampilkan pemberitahuan bila KV belum aktif |
| Penanda varian | `src/components/Layout.tsx` | Chip "Varian A · papan donasi server KV / mode lokal" di ribbon dan cap di footer — mengikuti status sumber data yang sebenarnya, sehingga deployment Varian A langsung bisa dibedakan |
| Konsol status | `src/components/ServerStatus.tsx` | Panel di `#/papan-donasi` yang memeriksa `/api/donations` tiap 20 detik: sumber entri, jumlah entri di server, latensi, waktu pemeriksaan terakhir, plus perintah perbaikan yang bisa disalin bila KV belum aktif |
| Routing | `vercel.json` | Rewrite SPA `"/((?!api/).*)"` agar `/api/donations` tidak tertutup |

Tanpa konfigurasi KV, aplikasi **tetap jalan penuh** dalam mode lokal dan menampilkan *"Mode lokal — Vercel KV belum dikonfigurasi…"* di papan donasi. Tidak ada error yang menghalangi pengguna.

## Halaman

| Rute | Isi |
| --- | --- |
| `#/` | Banner program, headline, panel statistik langsung, tiga langkah berwakaf, donasi terbaru, teaser mushaf & galeri |
| `#/tentang` | Cerita wakaf untuk orang tua, profil Yayasan, 6 alasan (akordeon), legalitas |
| `#/keutamaan` | 8 keutamaan wakaf Al-Qur'an, video penyaluran, ajakan |
| `#/mushaf` | Spesifikasi mushaf + 12 pilihan nominal; memilih nominal langsung mengisi formulir wakaf |
| `#/penyaluran` | Tab dokumentasi (19 foto) dan bukti transfer (12), dengan lightbox |
| `#/wakaf` | Formulir 3 langkah, metode pembayaran, rekening resmi & QRIS |
| `#/papan-donasi` | Ticker berjalan, total animasi, daftar donatur + ucapan, bukti transfer |
| `#/kontak` | Kanal kontak, sosial media, legalitas, FAQ |
| `#/*` | 404 dengan tautan ke semua halaman |

Routing memakai **HashRouter** sehingga jalan di host statis mana pun tanpa konfigurasi server. Untuk URL bersih (`/tentang`), ganti `HashRouter` menjadi `BrowserRouter` di `src/App.tsx` — rewrite SPA-nya sudah tersedia di `vercel.json`.

## Alur donasi

1. Isi nama, WhatsApp, nominal, serta atas nama & doa → tervalidasi di klien.
2. Pilih **QRIS** atau **Transfer Bank** → invoice `AMQ-XXXXXX` dibuat dengan hitung mundur 15 menit (tetap berlanjut setelah halaman dimuat ulang, otomatis kedaluwarsa bila lewat).
3. Modal pembayaran: QRIS resmi AmalQu (bisa diperbesar), QR invoice menuju halaman checkout, atau rekening resmi + kode unik 3 digit dengan tombol salin.
4. Pembayaran berhasil → **notifikasi** (toast, layar perayaan dengan confetti, notifikasi sistem bila diizinkan) dan nama donatur **langsung tertera** di papan donasi dengan ucapan:

   > Jazakumullah Khairan Katsiran atas donasi dari : … sebesar : … semoga ALLAH melipat gandakan amal sholeh saudara/saudari…

5. `publishDonation()` mengirim entri ke `POST /api/donations` sehingga donatur yang sama terlihat oleh pengunjung lain.

## API

```
GET  /api/donations   -> { remote, entries }        # 200 entri terbaru, newest first
POST /api/donations   -> { remote, entry }  (201)   # validasi nama >= 2 karakter & nominal resmi
```

Penyimpanan memakai Vercel KV (Upstash Redis REST): `LPUSH` + `LTRIM` agar daftar terurut terbaru dan dibatasi 200 entri. Bila `KV_REST_API_URL`/`KV_REST_API_TOKEN` tidak ada, `GET` membalas `{ remote: false }` dan `POST` membalas `501`.

```bash
curl https://<project>.vercel.app/api/donations
curl -X POST https://<project>.vercel.app/api/donations \
  -H 'Content-Type: application/json' \
  -d '{"id":"AMQ-TEST01","name":"Uji Coba","amount":99000,"dedication":"Alm. Fulan","method":"qris"}'
```

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/index.html (semua JS & CSS di-inline)
npm run preview
```

Butuh **Node 22.x** (dikunci lewat `engines`).

## Deploy ke Vercel

```bash
vercel                # preview
vercel kv create      # buat store KV, pilih region terdekat (mis. Singapore)
vercel env pull .env.local
vercel dev            # uji lokal dengan API + env asli
vercel --prod
```

`vercel kv create` otomatis menambahkan `KV_REST_API_URL` dan `KV_REST_API_TOKEN` ke environment project. Lihat `.env.example`. Rinciannya ada di `README-DEPLOY.md`.

## Tes QA (opsional)

Playwright sengaja tidak dimasukkan ke `package.json` agar instalasi di Vercel ringan.

```bash
npm i -D playwright
npx playwright install --with-deps chromium
npm run preview -- --port 4173 &
node tests/routes.mjs     # semua rute, menu mobile, alur donasi, deep link, back/forward, overflow
node tests/csp-check.mjs  # menguji dist/ dengan header & CSP persis dari vercel.json
```

## Struktur

```
api/donations.ts             # Edge Function papan donasi bersama
src/
  App.tsx                    # HashRouter + 9 rute + provider
  data.ts                    # teks, harga, kontak, rekening, navigasi, FAQ, URL gambar
  index.css                  # design token, ambient background, komponen & animasi
  pages/                     # Home, Tentang, Keutamaan, Mushaf, Penyaluran, Wakaf, PapanDonasi, Kontak, NotFound
  store/donations.tsx        # invoice, status, papan donasi, sinkronisasi server + localStorage
  utils/page.ts              # judul & meta description per halaman
  components/
    Layout.tsx               # header + nav aktif, menu mobile, ribbon langsung, footer, CTA melayang
    PageHero.tsx             # kepala halaman editorial + breadcrumb
    DonationForm.tsx  PaymentModal.tsx  Celebration.tsx  DonationWall.tsx
    Gallery.tsx  PaymentMethods.tsx  Toaster.tsx  Dialog.tsx  SourceImage.tsx
tests/                       # skrip QA Playwright
```

## Menyatukan dengan Varian B

Salin `api/charge.ts`, `api/status.ts`, `api/webhook.ts`, dan `src/lib/gateway.ts` dari Varian B, lalu panggil `POST /api/donations` dari `api/webhook.ts` saat status `settlement` — donatur tercatat terpusat begitu pembayaran lunas, tanpa mengandalkan klik pengguna.
