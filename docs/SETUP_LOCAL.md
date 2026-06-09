# Setup Local

## Prasyarat

Gunakan environment berikut agar konsisten dengan Dockerfile:

- Node.js 20 LTS;
- npm yang kompatibel dengan lockfile versi 3;
- Git;
- Docker Desktop atau Docker Engine dengan Compose v2, hanya jika menjalankan mode container.

Repository memiliki `package-lock.json` dan `pnpm-lock.yaml`. Dockerfile memakai npm dan `package-lock.json`, sehingga npm adalah package manager acuan untuk setup saat ini.

> **Peringatan:** Jangan bergantian menjalankan npm dan pnpm tanpa keputusan tim. Dua lockfile dapat menghasilkan dependency tree yang berbeda.

## Instalasi

```bash
git clone <repository-url>
cd landing_page
npm ci
```

Buat environment lokal:

```bash
cp .env.example .env.local
```

Isi URL dan publishable key Supabase. Lihat [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md).

Jika sedang mengubah dependency dan memang perlu memperbarui lockfile:

```bash
npm install
```

Jangan gunakan `npm install` pada server production. Dependency dan aplikasi seharusnya dibangun di CI ke dalam Docker image.

## Environment Variable

Supabase menggunakan dua environment variable:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Jika belum tersedia, aplikasi tetap berjalan dengan fallback lokal. Next.js mengatur `NODE_ENV` berdasarkan command yang dijalankan.

```text
npm run dev    -> NODE_ENV=development
npm run build  -> build production
npm run start  -> NODE_ENV=production
```

Detail tersedia di [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

## Menjalankan Development Server

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
http://localhost:3000/katalog
```

## Script Project

Script yang benar-benar terdaftar di `package.json`:

| Command | Fungsi | Catatan |
| --- | --- | --- |
| `npm run dev` | Menjalankan `next dev`. | Untuk development lokal. |
| `npm run build` | Menjalankan `next build`. | Build production; error TypeScript saat ini diabaikan oleh config. |
| `npm run start` | Menjalankan `next start`. | Memerlukan hasil build `.next`. |
| `npm run lint` | Menjalankan `eslint .`. | Script tersedia, tetapi dependency ESLint tidak terdaftar saat dokumentasi dibuat. |

> **Peringatan:** `npm run lint` belum dapat dianggap sebagai quality gate sampai package ESLint dan konfigurasi yang sesuai ditambahkan.

Pemeriksaan TypeScript manual yang direkomendasikan:

```bash
npx tsc --noEmit
```

Command tersebut bukan script resmi project. Jalankan dari dependency lokal dan jangan mengandalkan download package dinamis di CI.

## Menjalankan Dengan Docker Compose

Konfigurasi Compose saat ini lebih cocok untuk verifikasi lokal daripada production:

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f app web
```

Akses aplikasi melalui:

```text
http://localhost:8002
```

Hentikan container:

```bash
docker compose down
```

Lihat risiko bind mount dan build context di [DOCKER_AND_DEPLOYMENT.md](./DOCKER_AND_DEPLOYMENT.md).

## Error Lokal Umum

### `node` atau `npm` tidak ditemukan

Pastikan Node.js 20 tersedia di `PATH`:

```bash
node --version
npm --version
```

Pada Windows, restart terminal setelah instalasi Node.js.

### PowerShell menolak `npm.ps1`

Gunakan executable command shim:

```powershell
npm.cmd ci
npm.cmd run dev
```

Atau sesuaikan execution policy sesuai kebijakan organisasi. Jangan melemahkan policy mesin production hanya untuk menjalankan project.

### `npm ci` gagal karena lockfile

Pastikan `package.json` dan `package-lock.json` sinkron. Untuk perbaikan yang disengaja di branch development:

```bash
npm install
npm ci
```

Review perubahan `package-lock.json` sebelum commit.

### `npm run lint` gagal karena ESLint tidak tersedia

Kondisi ini sesuai repository saat dokumentasi dibuat. Dependency dan config ESLint perlu ditambahkan melalui pekerjaan maintenance terpisah. Jangan menghapus script untuk menyembunyikan kegagalan.

### `next start` mengatakan production build tidak ditemukan

Jalankan build lebih dahulu:

```bash
npm run build
npm run start
```

Dalam Docker Compose saat ini, bind mount `.:/app` juga dapat menutupi folder `.next` dari image. Lihat panduan Docker untuk diagnosis.

### Font gagal saat build

`next/font/google` dapat memerlukan akses jaringan saat build untuk mengambil metadata atau aset font. Pastikan runner CI memiliki akses keluar yang diperlukan, atau evaluasi self-hosted font pada pekerjaan terpisah.

### Supabase belum dimigrasikan atau query gagal

Aplikasi tetap menampilkan fallback lokal. Periksa log server untuk prefix `[Supabase]`, lalu pastikan:

- migration dan seed sudah dijalankan;
- env benar;
- tabel memiliki row aktif;
- RLS public read policy tersedia.

### Gambar tidak tampil

Periksa bahwa file tersedia di `public/` dan path dimulai dari root, misalnya:

```text
/hero-mahar.webp
/gallery-1.jpg
```

Gunakan tab Network browser untuk memeriksa response `404`.

### Port sudah digunakan

Development:

```bash
npm run dev -- -p 3001
```

Docker Compose menggunakan port host `8002`. Ubah mapping hanya pada override lokal dan hindari perubahan production tanpa review.
