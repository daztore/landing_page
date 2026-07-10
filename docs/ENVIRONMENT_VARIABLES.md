# Environment Variables

## Variable Aktif

| Variable | Contoh aman | Digunakan di | Klasifikasi | Sensitif |
| --- | --- | --- | --- | --- |
| `APP_IMAGE` | `ghcr.io/daztore/landing_page` | Docker Compose production image coordinate | Deployment runtime | Tidak |
| `APP_TAG` | `<full-40-character-commit-sha>` | Docker Compose production immutable image tag | Deployment runtime | Tidak |
| `NODE_ENV` | `production` | Next.js dan Docker runtime | Framework-managed, build/runtime | Tidak |
| `NEXT_PUBLIC_SITE_URL` | `https://daztore.web.id` | `lib/site-url.ts`, `lib/security/safe-image-src.ts`, admin password recovery redirect | Public, build/runtime | Tidak |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://project-ref.supabase.co` | Public Supabase client, admin SSR/browser client, service-role URL, remote image allowlist | Public, build/runtime | Tidak |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_example` | Public Supabase client dan admin SSR/browser client | Public client-side, build/runtime | Tidak rahasia |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_example` | `lib/supabase/service-role.ts`, dipakai oleh feedback, lead public, shared rate-limit RPC, dan public order lookup server code | Server-only runtime | Ya |
| `ORDER_ACCESS_COOKIE_SECRET` | `<random-secret-minimal-32-byte>` | Menandatangani cookie bukti akses order setelah token exchange | Server-only runtime | Ya |
| `RATE_LIMIT_STORE` | `memory` atau `supabase` | Memilih adapter rate limit server-side | Server-only runtime config | Tidak |

## Audit 2026-07-03

Audit env dilakukan terhadap source code, Dockerfile, Compose, workflow GitHub Actions, `.gitignore`, dan `.dockerignore`.

Hasil:

- Tidak ada `SUPABASE_SERVICE_ROLE_KEY` dengan prefix `NEXT_PUBLIC_*`.
- `SUPABASE_SERVICE_ROLE_KEY` hanya dibaca oleh `lib/supabase/service-role.ts`.
- `lib/supabase/service-role.ts` memakai import `server-only`, sehingga module tersebut tidak boleh masuk client bundle.
- Import service-role hanya boleh berada pada server-only flow seperti `lib/feedback/data.ts`,
  `app/feedback/[id]/submit/route.ts`, service lead public server-side, dan public order lookup.
- Client/browser Supabase hanya memakai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `Dockerfile` hanya menerima build argument `NEXT_PUBLIC_*`; service-role tidak masuk build argument.
- Workflow GitHub Actions aktif hanya memakai env public untuk verify/build image dan tidak memakai `SUPABASE_SERVICE_ROLE_KEY`.
- `docker-compose.production.yml` mewajibkan `SUPABASE_SERVICE_ROLE_KEY` sebagai runtime environment.
- Production memakai Supabase RPC `consume_rate_limit` sebagai shared rate-limit store atomik;
  development/test tetap memakai adapter in-memory tanpa service eksternal.
- Key limiter disimpan sebagai SHA-256 dan tidak memuat email, WhatsApp, atau alamat IP mentah.
- `.gitignore` mengecualikan `.env*` dan hanya membuka `.env.example`.
- `.dockerignore` mengecualikan `.env*`, sehingga env lokal tidak masuk build context Docker.

Catatan gap:

- Belum ada schema validasi env terpusat. Saat ini module Supabase memakai fallback/null handling, tetapi fitur commerce nanti sebaiknya punya validasi env server-side yang fail-fast untuk credential wajib.
- `docker-compose.yml` lokal memakai fallback kosong untuk env. Ini nyaman untuk development dengan fallback data lokal, tetapi route feedback dan `/api/leads` akan gagal aman jika `SUPABASE_SERVICE_ROLE_KEY` belum tersedia.
- Provider commerce seperti payment, shipping, SMTP, dan anti-spam belum memiliki env aktif. Jangan menambahkan nama credential baru ke `.env.example` sebelum implementasi/provider diputuskan.

## Shared Rate-Limit Store

Tidak ada credential provider baru untuk rate limiter. Production memakai infrastruktur Supabase
yang sudah tersedia melalui `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`; key secret
tetap server-only. Migration `supabase/migrations/009_create_rate_limit_store.sql` wajib diterapkan
sebelum deploy image yang memakai adapter baru.

Pemilihan store bersifat eksplisit dan nilai lain dianggap konfigurasi gagal:

- `RATE_LIMIT_STORE=supabase`: Supabase RPC bersama lintas instance, fail-closed `503` bila store
  tidak tersedia;
- `RATE_LIMIT_STORE=memory`: `InMemoryRateLimitStore` untuk local/test;
- nilai tidak diisi: default `supabase` saat `NODE_ENV=production`, dan `memory` pada
  development/test.

`docker-compose.override.yml` mengunci local Compose ke `memory` tanpa mengubah base
`docker-compose.yml`; `docker-compose.production.yml` mengunci production ke `supabase`. Jika
production dijalankan di luar Compose resmi, tetapkan `RATE_LIMIT_STORE=supabase` secara eksplisit
agar intent deployment tetap mudah diaudit.

## Local Development

`.env.example` hanya berisi nama variable:

```dotenv
APP_IMAGE=ghcr.io/daztore/landing_page
APP_TAG=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ORDER_ACCESS_COOKIE_SECRET=
RATE_LIMIT_STORE=memory
```

Buat `.env.local` dan isi dengan nilai project:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=https://daztore.web.id
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_service_role_key
ORDER_ACCESS_COOKIE_SECRET=replace_with_random_value_at_least_32_bytes
RATE_LIMIT_STORE=memory
```

`.env.local` terabaikan Git. `.env.example` dikecualikan dari pola ignore agar dapat di-commit.

Restart `npm run dev` setelah perubahan env.

## Supabase Auth URL Configuration

Fitur lupa password admin memakai Supabase Auth recovery email dengan redirect ke callback
internal aplikasi. Redirect URL dibentuk dari `NEXT_PUBLIC_SITE_URL`, sehingga nilai env harus
sesuai environment yang sedang diuji.

Production Supabase Dashboard:

```text
Authentication -> URL Configuration
Site URL: https://daztore.web.id
Redirect URL: https://daztore.web.id/admin-daz/auth/callback
```

Local development:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
Redirect URL: http://localhost:3000/admin-daz/auth/callback
```

Flow recovery aktual:

```text
/admin-daz/forgot-password
-> POST /admin-daz/forgot-password/request
-> Supabase recovery email
-> /admin-daz/auth/callback?next=/admin-daz/reset-password
-> /admin-daz/reset-password
```

`/admin-daz/reset-password` tidak perlu dimasukkan sebagai Supabase Redirect URL untuk flow ini
karena Supabase hanya melakukan redirect langsung ke `/admin-daz/auth/callback`. Setelah Site URL
atau Redirect URL Supabase diubah, email recovery lama dapat masih membawa URL lama; kirim email
recovery baru untuk pengujian berikutnya.

## Supabase Keys

Publishable key memang dirancang untuk digunakan oleh aplikasi publik. Keamanan database tidak bergantung pada kerahasiaan key ini, tetapi pada:

- Row Level Security aktif;
- policy hanya mengizinkan read terhadap row aktif;
- tidak ada public write policy;
- kolom private tidak ditempatkan di tabel publik.

Jangan mengganti publishable key dengan:

- service-role key;
- secret key;
- database password;
- JWT signing secret.

Service-role key melewati RLS dan tidak boleh menggunakan prefix `NEXT_PUBLIC_`.
Key ini hanya dipakai oleh Server Component/Route Handler untuk membaca feedback request privat,
upload foto pelanggan ke bucket private, menyimpan submission feedback, menyimpan lead publik
setelah validasi server-side, dan memverifikasi public order detail berbasis token. Jangan kirim
key ini ke client, Docker build argument, atau source code.

## Fallback Ketika Env Tidak Tersedia

`getSupabaseClient()` mengembalikan `null` jika salah satu variable tidak tersedia atau URL tidak valid. Data access layer kemudian memakai data dari:

```text
lib/data/fallback.ts
lib/katalog-data.ts
```

Build dan halaman tidak sengaja dibuat crash hanya karena Supabase belum dikonfigurasi.
Resolver Storage juga mengembalikan path gambar fallback lokal dalam kondisi tersebut.

Bucket publik `landing_page` dan `catalogs` tetap dibaca dengan publishable key. Bucket
`feedback_customer_photos` private dan hanya diakses server-side atau admin melalui signed URL.
Tabel order juga tidak memiliki public read policy; public order detail memakai service-role
server-only setelah token order diverifikasi.

Route admin menggunakan variable publik yang sama untuk Supabase Auth, database, dan Storage.
Hak tulis admin berasal dari JWT user yang login dan policy RLS. Service-role key tidak dipakai
untuk operasi admin browser.

## Build-Time dan Runtime

Variable `NEXT_PUBLIC_*` dapat ditanam ke bundle saat `next build`. CI harus menyediakan nilai yang benar saat membangun image production.

Dockerfile menerima variable public sebagai build arguments dan runtime environment:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -t daztore:<commit-sha> .
```

`docker-compose.yml` meneruskan nilai dari environment host:

```bash
export NEXT_PUBLIC_SITE_URL="https://daztore.web.id"
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_your_service_role_key"
docker compose build
docker compose up -d
```

Production Compose juga memerlukan:

```dotenv
APP_IMAGE=ghcr.io/daztore/landing_page
APP_TAG=<full-40-character-commit-sha>
NEXT_PUBLIC_SITE_URL=https://daztore.web.id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_service_role_key
ORDER_ACCESS_COOKIE_SECRET=<random-secret-minimal-32-byte>
RATE_LIMIT_STORE=supabase
```

`docker-compose.production.yml` mewajibkan `${APP_IMAGE}:${APP_TAG}`. Gunakan full commit SHA yang
dipush CI untuk `APP_TAG`; tag `main`, `production`, atau `latest` tidak boleh menjadi sumber
kebenaran deploy/rollback.

Workflow GitHub Actions aktif saat ini tidak menjalankan Compose di server. Workflow hanya memakai env public Supabase saat verify/build image, lalu push image ke GHCR. `.env` server tetap dibutuhkan untuk deploy manual dengan `docker-compose.production.yml`.

Pada PowerShell:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://daztore.web.id"
$env:NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_your_key"
$env:SUPABASE_SERVICE_ROLE_KEY = "sb_secret_your_service_role_key"
docker compose build
docker compose up -d
```

## Docker Safety

`.dockerignore` mengecualikan:

```text
.env*
```

Dengan demikian `.env.local` tidak disalin oleh `COPY . .` dan tidak masuk build context.

GitHub Actions aktif memerlukan repository secrets/variables berikut untuk verify dan build image:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

`NEXT_PUBLIC_SITE_URL` dapat disimpan sebagai Actions variable. Kedua Supabase public variable
tetap dapat disimpan sebagai Actions secrets untuk pengelolaan environment yang konsisten.
`SUPABASE_SERVICE_ROLE_KEY` tidak dipakai oleh workflow build saat ini. Key ini wajib ada di
environment runtime server untuk feedback, lead public submit, shared rate-limit RPC, dan public
order lookup, bukan build argument.

`ORDER_ACCESS_COOKIE_SECRET` juga tidak dipakai saat build. Secret ini hanya dibaca server runtime,
tidak boleh memakai prefix `NEXT_PUBLIC_*`, dan rotasinya membatalkan cookie akses order yang masih
aktif. Link order dapat ditukar kembali selama token publik belum diregenerasi.

## Rotation

Jika publishable key dirotasi:

1. perbarui `.env.local` untuk development;
2. perbarui secret/variable CI;
3. rebuild image karena variable public dapat tertanam saat build;
4. deploy image dengan commit SHA baru;
5. verifikasi query publik masih lolos RLS.

Jika `ORDER_ACCESS_COOKIE_SECRET` dirotasi, seluruh cookie akses order aktif langsung invalid.
Deploy secret baru melalui runtime environment, lalu verifikasi link order terbaru masih dapat
ditukar menjadi cookie baru. Raw token/hash database tidak perlu diubah hanya karena rotasi secret.

## Variable Yang Belum Digunakan

Project belum menggunakan:

- database connection string langsung;
- custom admin authentication secret di luar Supabase Auth;
- SMTP credential;
- storage secret terpisah;
- payment credential.

Supabase Auth email/password aktif melalui publishable key. Session admin disimpan sebagai
cookie oleh `@supabase/ssr`.

## Needs Confirmation

- Apakah URL Supabase yang diberikan ditujukan untuk development, staging, atau production.
- Apakah CI menggunakan GitHub Secrets atau environment-level variables untuk nilai public Supabase.
- Apakah publishable key perlu dipisahkan per environment.
