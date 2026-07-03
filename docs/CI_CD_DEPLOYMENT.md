# CI/CD Deployment

## Ringkasan

Workflow `.github/workflows/ci-cd.yml` menjalankan deployment immutable:

```text
push ke main
-> lint, typecheck, dan Next.js build
-> Docker image build
-> push ke GHCR dengan tag commit SHA dan production
-> SSH ke server
-> docker compose pull
-> docker compose up -d
-> smoke test / dan /katalog
```

Production server tidak menjalankan `npm install`, `npm ci`, atau `npm run build`.

Pull request hanya menjalankan job `verify`. Build image, push GHCR, dan deployment hanya
berjalan pada push ke branch `main`.

## GitHub Environment

Buat GitHub Environment bernama:

```text
production
```

Environment dapat diberi required reviewer agar deployment memerlukan approval. Supabase
build variables harus tersedia sebagai repository secrets karena job image berjalan sebelum
job yang menggunakan environment `production`.

## Secrets Yang Diperlukan

| Secret | Fungsi |
| --- | --- |
| `PROD_HOST` | Hostname atau IP production server. |
| `PROD_USER` | User SSH deployment dengan privilege terbatas. |
| `PROD_PORT` | Port SSH, biasanya `22`. |
| `PROD_SSH_KEY` | Private key khusus deployment. |
| `PROD_KNOWN_HOSTS` | Host key server yang sudah diverifikasi. |
| `PROD_APP_DIR` | Direktori server yang berisi production Compose. |
| `PROD_URL` | Base URL HTTPS untuk smoke test. |
| `NEXT_PUBLIC_SITE_URL` | Base URL canonical untuk metadata, robots, dan sitemap. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase yang ditanam saat image build. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase. |

`GITHUB_TOKEN` disediakan otomatis oleh GitHub Actions dan diberi permission
`packages: write` hanya pada job image.

Jangan menambahkan service-role key, database password, atau secret backend sebagai
`NEXT_PUBLIC_*`.

## SSH Key dan Known Hosts

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
digunakan. Pastikan `PROD_APP_DIR` mengarah ke direktori tersebut.

Contoh `.env`:

```dotenv
APP_IMAGE=ghcr.io/OWNER/REPO
APP_TAG=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=https://daztore.web.id
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

Workflow menimpa nilai tersebut untuk proses deployment dengan image dan full commit SHA
yang baru. File `.env` tetap berguna untuk operasi manual dan harus memiliki permission
terbatas:

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
docker compose -f docker-compose.production.yml config --quiet
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --remove-orphans
docker compose -f docker-compose.production.yml ps
```

Production Compose:

- memakai `${APP_IMAGE}:${APP_TAG}`;
- tidak memiliki `build`;
- tidak memasang source code atau `node_modules`;
- menunggu healthcheck Next.js sebelum menjalankan Nginx;
- mengekspos Nginx pada port host `8002`.

## Log dan Diagnosis

```bash
cd /opt/daztore
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=200 app web
curl -fsS http://localhost:8002/
curl -fsS http://localhost:8002/katalog
```

## Rollback

Gunakan full commit SHA dari image terakhir yang diketahui sehat:

```bash
cd /opt/daztore
export APP_TAG=<previous-commit-sha>
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d --remove-orphans
docker compose -f docker-compose.production.yml ps
```

Jangan membangun ulang commit lama pada server. Tag `production` adalah alias convenience;
rollback harus memakai tag SHA immutable.

Setelah rollback, verifikasi:

```bash
curl -fsS https://production.example.com/
curl -fsS https://production.example.com/katalog
```

## Rotasi dan Operasional

- Rotasi SSH deployment key dan GHCR read token secara berkala.
- Hapus admin/deployer yang tidak lagi berwenang.
- Pertahankan beberapa image SHA terakhir untuk rollback.
- Lindungi GitHub Environment `production` dengan reviewer bila diperlukan.
- Review perubahan Compose dan Nginx sebelum menyalinnya ke server.
