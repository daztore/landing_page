# Environment Variables

## Variable Aktif

| Variable | Contoh aman | Digunakan di | Klasifikasi | Sensitif |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | `production` | Next.js, Docker, analytics | Framework-managed, build/runtime | Tidak |
| `NEXT_PUBLIC_SITE_URL` | `https://daztore.web.id` | Metadata, robots, sitemap | Public, build/runtime | Tidak |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://project-ref.supabase.co` | `lib/supabase/client.ts` | Public, build/runtime | Tidak |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_example` | `lib/supabase/client.ts` | Public client-side, build/runtime | Tidak rahasia |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_example` | `lib/supabase/service-role.ts` | Server-only runtime | Ya |

## Local Development

`.env.example` hanya berisi nama variable:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Buat `.env.local` dan isi dengan nilai project:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=https://daztore.web.id
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_service_role_key
```

`.env.local` terabaikan Git. `.env.example` dikecualikan dari pola ignore agar dapat di-commit.

Restart `npm run dev` setelah perubahan env.

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
upload foto pelanggan ke bucket private, dan menyimpan submission. Jangan kirim key ini ke client,
Docker build argument, atau source code.

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
APP_IMAGE=ghcr.io/OWNER/REPO
APP_TAG=<full-commit-sha>
NEXT_PUBLIC_SITE_URL=https://daztore.web.id
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_service_role_key
```

Workflow GitHub Actions mengisi `APP_IMAGE`, `APP_TAG`, dan kedua variable Supabase saat
menjalankan Compose di server. `.env` server menyediakan fallback untuk deploy manual.

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

GitHub Actions memerlukan repository secrets:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

`NEXT_PUBLIC_SITE_URL` dapat disimpan sebagai Actions variable. Kedua Supabase public variable
tetap dapat disimpan sebagai Actions secrets untuk pengelolaan environment yang konsisten.
`SUPABASE_SERVICE_ROLE_KEY` wajib ada di environment runtime server, bukan build argument.

## Rotation

Jika publishable key dirotasi:

1. perbarui `.env.local` untuk development;
2. perbarui secret/variable CI;
3. rebuild image karena variable public dapat tertanam saat build;
4. deploy image dengan commit SHA baru;
5. verifikasi query publik masih lolos RLS.

## Variable Yang Belum Digunakan

Project belum menggunakan:

- database connection string langsung;
- authentication secret custom;
- SMTP credential;
- storage secret terpisah;
- payment credential.

Supabase Auth email/password aktif melalui publishable key. Session admin disimpan sebagai
cookie oleh `@supabase/ssr`.

## Needs Confirmation

- Apakah URL Supabase yang diberikan ditujukan untuk development, staging, atau production.
- Apakah CI menggunakan GitHub Secrets atau environment-level variables untuk nilai public Supabase.
- Apakah publishable key perlu dipisahkan per environment.
