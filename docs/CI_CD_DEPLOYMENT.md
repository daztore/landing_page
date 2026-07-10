# CI/CD Deployment

## Ringkasan

Workflow `.github/workflows/ci-cd.yml` saat ini menjalankan verify dan publish image:

```text
push ke main
-> lint, typecheck, dan Next.js build
-> Docker image build
-> push ke GHCR dengan tag commit SHA dan production
```

Production server tidak menjalankan `npm install`, `npm ci`, atau `npm run build`.

Pull request hanya menjalankan job `verify`. Build image dan push GHCR hanya berjalan pada push ke branch `main`. Job deploy via SSH sudah dihapus, sehingga deploy server dilakukan manual/operasional menggunakan image yang sudah tersedia di GHCR.

## GitHub Environment

Workflow aktif tidak membutuhkan GitHub Environment. Jika deploy otomatis diaktifkan kembali, buat GitHub Environment bernama:

```text
production
```

GitHub Environment `production` tidak digunakan oleh workflow aktif saat ini karena tidak ada job deploy SSH. Environment dapat dibuat nanti jika deploy otomatis diaktifkan kembali dan diberi required reviewer agar deployment memerlukan approval.

## Secrets/Variables Yang Diperlukan

| Secret/Variable | Fungsi |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Base URL canonical untuk metadata, robots, sitemap, dan redirect recovery password admin. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase yang ditanam saat image build. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase. |

`GITHUB_TOKEN` disediakan otomatis oleh GitHub Actions dan diberi permission
`packages: write` hanya pada job image.

Jangan menambahkan service-role key, database password, atau secret backend sebagai
`NEXT_PUBLIC_*`. `SUPABASE_SERVICE_ROLE_KEY` dibutuhkan pada runtime server untuk feedback, bukan pada GitHub Actions build.

## SSH Key dan Known Hosts

Bagian ini hanya relevan jika deploy SSH otomatis diaktifkan kembali. Workflow aktif saat ini tidak memakai SSH secrets.

Gunakan private key khusus deployment. Public key pasang pada `authorized_keys` user
production dengan permission minimum yang diperlukan.

Buat known hosts dari workstation tepercaya dan verifikasi fingerprint melalui kanal lain:

```bash
ssh-keyscan -p 22 production.example.com
```

Untuk port non-standar, output harus memuat host dalam format `[host]:port`. Simpan output
yang sudah diverifikasi sebagai `PROD_KNOWN_HOSTS`; jangan menggunakan
`StrictHostKeyChecking=no`.

## Persiapan Server Satu Kali

Contoh direktori:

```bash
sudo mkdir -p /opt/daztore/docker/nginx
sudo chown -R deploy:deploy /opt/daztore
cd /opt/daztore
```

Server hanya membutuhkan:

```text
docker-compose.production.yml
docker/nginx/default.conf
.env
```

Salin `docker-compose.production.yml` dan `docker/nginx/default.conf` dari commit yang akan
digunakan ke direktori aplikasi server tersebut.

Contoh `.env`:

```dotenv
APP_IMAGE=ghcr.io/daztore/landing_page
APP_TAG=<full-40-character-commit-sha>
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=https://daztore.web.id
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
ORDER_ACCESS_COOKIE_SECRET=<random-secret-minimal-32-byte>
RATE_LIMIT_STORE=supabase
```

`APP_IMAGE` dan `APP_TAG` wajib tersedia. Gunakan full commit SHA yang dipush workflow untuk
`APP_TAG`; jangan deploy memakai alias `main`, `production`, atau `latest`. Alias tersebut tetap
dipush hanya sebagai convenience tag dan bukan sumber kebenaran deployment/rollback.

`ORDER_ACCESS_COOKIE_SECRET` adalah secret runtime khusus untuk menandatangani bukti akses order.
Gunakan nilai acak minimal 32 byte, jangan memakai ulang service-role key, dan jangan memasukkannya
ke Docker build argument atau variable `NEXT_PUBLIC_*`.

Production Compose mengunci `RATE_LIMIT_STORE=supabase` agar seluruh replica memakai counter
Postgres/RPC yang sama. Migration `009_create_rate_limit_store.sql` harus diterapkan lebih dulu;
jika RPC gagal, endpoint public write mengembalikan `503` dan tidak menjadi unlimited.

File `.env` harus memiliki permission terbatas:

```bash
chmod 600 /opt/daztore/.env
```

## Akses GHCR

Jika package GHCR public, server dapat melakukan pull tanpa login.

Jika package private, login satu kali menggunakan token read-only dengan scope
`read:packages`:

```bash
echo "$GHCR_READ_TOKEN" | docker login ghcr.io -u OWNER --password-stdin
```

Jangan menyimpan token registry di repository atau menuliskannya ke `.env` Compose.

## Deploy Manual

```bash
cd /opt/daztore
export APP_IMAGE=ghcr.io/daztore/landing_page
export APP_TAG=<full-40-character-commit-sha>
printf '%s' "$APP_TAG" | grep -Eq '^[0-9a-f]{40}$' || {
  echo "APP_TAG wajib berupa full commit SHA 40 karakter" >&2
  exit 1
}
docker compose -f docker-compose.production.yml config --quiet
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --remove-orphans
docker compose -f docker-compose.production.yml ps
```

Compose memakai required-variable interpolation dan gagal dengan pesan jelas bila `APP_IMAGE`,
`APP_TAG`, atau runtime secret wajib tidak tersedia. Jalankan `config --quiet` sebelum `pull` agar
deployment berhenti sebelum mengubah container.

Production Compose:

- memakai image wajib `${APP_IMAGE}:${APP_TAG}`;
- mengharuskan `APP_TAG` operasional berupa full commit SHA immutable;
- tidak memiliki `build`;
- tidak memasang source code atau `node_modules`;
- menunggu healthcheck Next.js sebelum menjalankan Nginx;
- mengekspos Nginx pada port host `8003`.

Topologi client-IP yang didukung adalah client langsung ke Nginx container, lalu Nginx ke service
app internal. Jika TLS proxy/CDN/load balancer lain berada di depan port `8003`, deployment harus
ditahan sampai CIDR upstream resmi dikonfigurasi sebagai trusted proxy di Nginx. Jangan hanya
meneruskan `X-Forwarded-For` atau header provider tanpa allowlist koneksi.

## Log dan Diagnosis

```bash
cd /opt/daztore
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=200 app web
curl -fsS http://localhost:8003/
curl -fsS http://localhost:8003/katalog
```

## Rollback

Gunakan full commit SHA dari image terakhir yang diketahui sehat. Jangan memindahkan kembali tag
`production` atau membangun ulang commit lama di server.

```bash
cd /opt/daztore
export APP_IMAGE=ghcr.io/daztore/landing_page
export APP_TAG=<previous-full-40-character-commit-sha>
printf '%s' "$APP_TAG" | grep -Eq '^[0-9a-f]{40}$' || exit 1
docker compose -f docker-compose.production.yml config --quiet
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --remove-orphans
docker compose -f docker-compose.production.yml ps
```

Jangan membangun ulang commit lama pada server. Tag `production` adalah alias convenience; rollback yang aman harus memakai tag SHA immutable.

Setelah rollback, verifikasi:

```bash
curl -fsS https://production.example.com/
curl -fsS https://production.example.com/katalog
```

## Rotasi dan Operasional

- Rotasi GHCR read token secara berkala. Rotasi SSH deployment key hanya relevan jika deploy SSH otomatis diaktifkan kembali.
- Hapus admin/deployer yang tidak lagi berwenang.
- Pertahankan beberapa image SHA terakhir untuk rollback.
- Lindungi GitHub Environment `production` dengan reviewer bila diperlukan.
- Review perubahan Compose dan Nginx sebelum menyalinnya ke server.
