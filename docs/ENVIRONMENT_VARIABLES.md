# Environment Variables

## Variable Aktif

| Variable | Contoh aman | Digunakan di | Klasifikasi | Sensitif |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | `production` | Next.js, Docker, analytics | Framework-managed, build/runtime | Tidak |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://project-ref.supabase.co` | `lib/supabase/client.ts` | Public, build/runtime | Tidak |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_example` | `lib/supabase/client.ts` | Public client-side, build/runtime | Tidak rahasia |

## Local Development

`.env.example` hanya berisi nama variable:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Buat `.env.local` dan isi dengan nilai project:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

`.env.local` terabaikan Git. `.env.example` dikecualikan dari pola ignore agar dapat di-commit.

Restart `npm run dev` setelah perubahan env.

## Supabase Publishable Key

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

## Fallback Ketika Env Tidak Tersedia

`getSupabaseClient()` mengembalikan `null` jika salah satu variable tidak tersedia atau URL tidak valid. Data access layer kemudian memakai data dari:

```text
lib/data/fallback.ts
lib/katalog-data.ts
```

Build dan halaman tidak sengaja dibuat crash hanya karena Supabase belum dikonfigurasi.
Resolver Storage juga mengembalikan path gambar fallback lokal dalam kondisi tersebut.

Tidak ada environment variable atau secret tambahan untuk membaca bucket publik
`landing_page` dan `catalogs`. Service-role key tidak diperlukan dan tidak boleh ditambahkan.

## Build-Time dan Runtime

Variable `NEXT_PUBLIC_*` dapat ditanam ke bundle saat `next build`. CI harus menyediakan nilai yang benar saat membangun image production.

Dockerfile menerima kedua variable sebagai build arguments dan runtime environment:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -t daztore:<commit-sha> .
```

`docker-compose.yml` meneruskan nilai dari environment host:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
docker compose build
docker compose up -d
```

Pada PowerShell:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_your_key"
docker compose build
docker compose up -d
```

## Docker Safety

`.dockerignore` mengecualikan:

```text
.env*
```

Dengan demikian `.env.local` tidak disalin oleh `COPY . .` dan tidak masuk build context.

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
- service-role key;
- authentication secret;
- SMTP credential;
- storage secret atau service-role key;
- payment credential.

## Needs Confirmation

- Apakah URL Supabase yang diberikan ditujukan untuk development, staging, atau production.
- Apakah CI menggunakan GitHub Secrets atau environment-level variables untuk nilai public Supabase.
- Apakah publishable key perlu dipisahkan per environment.
