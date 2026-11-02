# Varian A — Situs multi-halaman + papan donasi bersama (Vercel KV)

Repo: `https://github.com/jupli/contoh1.git` · branch: `varian-a`

Varian ini adalah **situs multi-halaman** (8 halaman + 404, HashRouter) dengan satu pembeda utama: nama donatur **tampil untuk semua pengunjung**, bukan hanya di perangkat masing-masing. Setiap donasi terverifikasi dikirim ke `POST /api/donations` dan disimpan di Vercel KV; halaman `#/papan-donasi` membaca `GET /api/donations` saat dimuat lalu menggabungkannya dengan catatan lokal (dedupe per ID invoice).

Kalau KV belum dikonfigurasi, aplikasi tetap jalan penuh dalam **mode lokal** dan menampilkan pemberitahuan di papan donasi — tidak ada error yang menghalangi pengguna.

## Halaman

`#/` Beranda · `#/tentang` · `#/keutamaan` · `#/mushaf` · `#/penyaluran` · `#/wakaf` · `#/papan-donasi` · `#/kontak` · `#/*` 404

## Deploy

```bash
npm install
npm run build            # pastikan build sukses
vercel                   # preview
vercel kv create         # buat store KV (pilih region terdekat, mis. Singapore)
vercel env pull .env.local
vercel dev               # uji lokal dengan API + env asli
vercel --prod
```

`vercel kv create` otomatis menambahkan `KV_REST_API_URL` dan `KV_REST_API_TOKEN` ke environment project. Lihat `.env.example`.

`vercel.json` varian ini memakai rewrite `"/((?!api/).*)"` agar route SPA tidak menutupi `/api/donations`.

## Uji cepat endpoint

```bash
curl https://<project>.vercel.app/api/donations
curl -X POST https://<project>.vercel.app/api/donations \
  -H 'Content-Type: application/json' \
  -d '{"id":"AMQ-TEST01","name":"Uji Coba","amount":99000,"dedication":"Alm. Fulan","method":"qris"}'
```

`POST` memvalidasi nama (min. 2 karakter) dan nominal terhadap daftar harga resmi AmalQu, lalu menyimpan maksimal 200 entri terbaru (`LPUSH` + `LTRIM`).

## Berkas pembeda dari varian dasar

- `api/donations.ts` — Edge Function baca/tulis papan donasi bersama
- `src/store/donations.tsx` — `remote`, `remoteNotice`, `publishDonation()`, merge entri server + lokal
- `src/components/DonationWall.tsx` — menampilkan status koneksi papan donasi
- `vercel.json` — rewrite SPA mengecualikan `/api/*`

## Menyatukan dengan Varian B

Ingin papan donasi terpusat **dan** pembayaran Midtrans sungguhan? Salin `api/charge.ts`, `api/status.ts`, `api/webhook.ts`, dan `src/lib/gateway.ts` dari Varian B ke varian ini, lalu panggil `POST /api/donations` dari `api/webhook.ts` saat status `settlement` — dengan begitu donatur tercatat terpusat begitu pembayaran lunas, tanpa mengandalkan klik pengguna.
