# Troubleshooting

## Diagnosis Awal

Mulai dengan mencatat:

- command yang gagal;
- environment lokal, CI, atau container;
- commit SHA;
- versi Node.js dan npm;
- log error lengkap tanpa secret;
- perubahan terakhir pada config atau dependency.

Command dasar:

```bash
node --version
npm --version
npm list --depth=0
```

## Development

### Node.js tidak tersedia

Expected version mengikuti Dockerfile:

```text
Node.js 20
```

Pastikan executable tersedia di `PATH`. Pada PowerShell yang memblokir `npm.ps1`, gunakan:

```powershell
npm.cmd --version
npm.cmd run dev
```

### Dependency install gagal

Gunakan lockfile npm:

```bash
npm ci
```

Jika muncul mismatch:

```bash
npm install
npm ci
```

Lakukan langkah pembaruan lockfile hanya di development branch dan review diff.

### Lockfile non-npm muncul

Package manager resmi project adalah npm. `package-lock.json` adalah satu-satunya lockfile untuk
local, CI, dan Docker. Jangan menjalankan `pnpm install`, jangan menambahkan `pnpm-lock.yaml`,
`yarn.lock`, `bun.lock`, atau lockfile package manager lain, dan jangan mengganti deployment ke
package manager lain tanpa decision record baru.

### Lint gagal

ESLint dan flat config Next.js tersedia sebagai development dependency.

Diagnosis:

```bash
npm run lint
npm list eslint
```

Warning existing tidak membuat command gagal. Error baru harus diperbaiki sebelum merge.

### TypeScript error pada build

Build Next.js gagal jika ada type errors.

Jalankan:

```bash
npx tsc --noEmit
```

Jalankan type check eksplisit untuk melihat error lebih cepat sebelum build.

### Development server memakai port lain

```bash
npm run dev -- -p 3001
```

Periksa proses yang memakai port sebelum menghentikannya.

## Build

### Build gagal saat memuat Google Fonts

Root layout memakai `next/font/google`. Pastikan CI memiliki akses jaringan keluar dan DNS berfungsi.

Diagnosis umum:

```bash
npm run build
```

Jika organisasi memblokir Google Fonts saat build, evaluasi self-hosted font sebagai perubahan terpisah.

### Feedback gagal karena service-role key kosong

`SUPABASE_SERVICE_ROLE_KEY` dibutuhkan saat menjalankan route feedback, tetapi tidak dibutuhkan
sebagai Docker build argument. Pastikan secret tersedia pada environment runtime server.

### Static asset tidak ditemukan

Path image harus cocok dengan file dalam `public/`.

```bash
curl -I http://localhost:3000/hero-mahar.webp
curl -I http://localhost:3000/gallery-1.jpg
```

Perhatikan case sensitivity pada Linux.

## Docker

### `next start` tidak menemukan `.next`

Periksa log:

```bash
docker compose logs --tail=200 app
```

Compose saat ini memasang `.:/app`, yang dapat menutupi `.next` dari image.

Periksa mount:

```bash
docker inspect daztore-app
```

Production fix yang direkomendasikan adalah Compose tanpa bind mount source.

### Docker build lambat atau context sangat besar

Penyebab utama yang mungkin:

- belum ada `.dockerignore`;
- `node_modules` lokal ikut dikirim;
- `.git` dan artifact build ikut dikirim.

Diagnosis:

```bash
docker build --progress=plain -t daztore:test .
```

Tambahkan `.dockerignore` pada perubahan deployment berikutnya.

### Container restart loop

```bash
docker compose ps
docker compose logs --tail=200 app
docker compose logs --tail=200 web
```

Periksa:

- `.next` tersedia;
- dependency runtime tersedia;
- app listen pada port `3000`;
- Nginx dapat resolve hostname `app`.

### Nginx memberi `502 Bad Gateway`

```bash
docker compose ps
docker compose exec web wget -qO- http://app:3000/
docker compose logs --tail=200 app web
```

Jika app belum ready, Nginx lokal dapat gagal proxy. Production Compose menunggu healthcheck
service app sebelum menjalankan Nginx.

### Port Compose sudah dipakai

Compose lokal menggunakan port host `8002`. Compose production saat ini menggunakan port host `8003`. Periksa listener host dan ubah mapping hanya melalui override yang sesuai environment.

```bash
docker compose config
```

### `docker compose pull` tidak memperbarui app

Pastikan command memakai `docker-compose.production.yml`. Compose lokal menggunakan `build`,
sedangkan production Compose menggunakan `${APP_IMAGE}:${APP_TAG}`.

## Connectivity dan Integrasi

### WhatsApp tidak terbuka

Periksa:

- browser tidak memblokir popup;
- device memiliki handler WhatsApp/web;
- URL `wa.me` dapat diakses;
- nomor dan encoding pesan benar.

Tidak ada API server yang dapat diperiksa karena integrasi memakai link langsung.

### Email tidak membuka client

Link `mailto:` memerlukan email client yang terkonfigurasi pada device pengguna.

### Analytics tidak muncul

Analytics belum aktif pada code saat ini. Import dan render `@vercel/analytics/next` masih dikomentari di `app/layout.tsx`, dan package `@vercel/analytics` tidak terdaftar di `package.json`.

Jika analytics diaktifkan kembali pada pekerjaan terpisah, periksa dependency, render condition, ad blocker, browser privacy settings, consent/privacy requirement, dan dukungan deployment.

## Cache dan Static Asset

### Perubahan gambar tidak terlihat

- pastikan image baru benar-benar masuk ke image Docker;
- hindari penggunaan ulang tag immutable untuk content berbeda;
- cek browser cache;
- cek cache reverse proxy/CDN jika ada;
- gunakan commit SHA baru untuk deploy.

Hard refresh browser hanya alat diagnosis, bukan strategi invalidasi production.

### Image lambat

Next Image optimization aktif untuk gambar publik. Periksa remote pattern Supabase, ukuran file,
format WebP/AVIF, cache header, dan CDN.

## Navigasi

### Link Paket tidak berpindah

`#packages` tidak memiliki target aktif karena komponen `Packages` dikomentari.

### Link Testimoni tidak berpindah

`TestimonialsEnhanced` tidak memiliki `id="testimonials"`.

### Link legal kembali ke atas

Kebijakan Privasi dan Syarat & Ketentuan masih memakai `href="#"`.

## Command Production Yang Aman

```bash
docker compose -f docker-compose.production.yml config
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=200 app web
curl -fsS https://example.com/
```

Hindari menghapus volume, image, atau container secara massal saat diagnosis. Pastikan rollback tag diketahui sebelum restart production.
