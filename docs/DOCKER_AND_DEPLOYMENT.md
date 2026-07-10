# Docker and Deployment

## Kondisi Saat Ini

Repository memiliki:

- `Dockerfile` multi-stage;
- `docker-compose.yml`;
- `docker-compose.override.yml` untuk konfigurasi local-only;
- reverse proxy Nginx;
- beberapa file PHP/Supervisor yang tidak digunakan oleh Dockerfile atau Compose aktif.

Compose lokal tetap tersedia untuk development. Compose production terpisah sekarang
menyediakan runtime berbasis image GHCR tanpa bind mount source.

## Dockerfile

### Stage `builder`

Base image:

```dockerfile
FROM node:20-alpine AS builder
```

Urutan:

1. Set working directory `/app`.
2. Terima build arguments public untuk site URL dan Supabase.
3. Salin `package.json` dan `package-lock.json`.
4. Jalankan `npm ci`.
5. Salin config Next.js dan TypeScript.
6. Jalankan `COPY . .`.
7. Jalankan `npm run build`.

### Stage `runner`

Base image:

```dockerfile
FROM node:20-alpine AS runner
```

Runtime:

- `NODE_ENV=production`;
- site URL, Supabase URL, dan publishable key dari build arguments/runtime environment;
- service-role key hanya dari runtime environment server;
- menyalin `.next`;
- menyalin `public`;
- menyalin `next.config.mjs` agar `next start` runtime membaca konfigurasi image optimizer;
- menyalin `package.json`;
- menyalin seluruh `node_modules`;
- expose port `3000`;
- menjalankan `npm start`.

Image belum menggunakan Next.js standalone output. Setelah build, Dockerfile menjalankan
`npm prune --omit=dev`, sehingga runtime hanya membawa production dependencies.

## Docker Compose Lokal

### Service `app`

- Dibangun lokal dari `Dockerfile`.
- Container name `daztore-app`.
- Menetapkan `NODE_ENV=production`.
- Memasang bind mount `.:/app`.
- Memasang anonymous volume `/app/node_modules`.
- Tidak mengekspos port langsung ke host.
- Override local menetapkan `RATE_LIMIT_STORE=memory`, sehingga development container tidak
  membutuhkan shared store. Base `docker-compose.yml` tetap tidak diubah oleh hardening production.

### Service `web`

- Menggunakan `nginx:1.30.1-alpine`.
- Container name `daztore-nginx`.
- Meneruskan host `8002` ke container `80`.
- Memasang repository ke `/app`, walaupun Nginx config hanya melakukan reverse proxy.
- Memasang `docker/nginx/default.conf` read-only.
- Meneruskan request ke `http://app:3000`.

## Risiko Jika Compose Lokal Dipakai Di Production

### 1. Bind mount menutupi hasil build image

Mount berikut:

```yaml
- .:/app
```

dapat menutupi `.next`, `package.json`, dan file aplikasi yang sudah dibangun di image. Jika host tidak memiliki `.next`, `npm start` dapat gagal karena production build tidak ditemukan.

Bind mount juga membuat container tidak immutable karena perilakunya bergantung pada isi filesystem server.

### 2. Service `app` tidak memiliki `image`

Compose lokal memakai `build`, bukan image registry. Karena itu flow:

```bash
docker compose pull
```

tidak akan menarik artifact aplikasi untuk service `app`. Production Compose perlu menunjuk ke image registry.

### 3. Build context

Repository sekarang memiliki `.dockerignore` yang mengecualikan:

```text
node_modules
.next
.git
.github
.env*
npm-debug.log*
Dockerfile*
docker-compose*.yml
README.md
docs
```

`.env.local` tidak masuk build context. Nilai public diteruskan melalui build arguments dan
environment. Service-role key hanya diteruskan sebagai runtime environment.

### 4. Compose lokal tidak memiliki health check

Compose lokal tidak memeriksa apakah Next.js atau Nginx benar-benar siap menerima traffic.
Production Compose memiliki healthcheck service app.

### 5. Runtime secret tidak boleh jadi build arg

`SUPABASE_SERVICE_ROLE_KEY` dibutuhkan untuk feedback privat, tetapi tidak boleh dijadikan
Docker build argument atau disalin ke image.

## Menjalankan Compose Lokal

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=200 app web
```

Uji endpoint:

```bash
curl -fsS http://localhost:8002/
curl -fsS http://localhost:8002/katalog
```

Hentikan:

```bash
docker compose down
```

## Compose Production

File `docker-compose.production.yml` menggunakan image yang sudah dibangun dan didorong CI:

```yaml
services:
  app:
    image: ${APP_IMAGE:?APP_IMAGE is required}:${APP_TAG:?APP_TAG is required}
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL:-https://daztore.web.id}
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:?NEXT_PUBLIC_SUPABASE_URL is required}
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:?NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is required}
      ORDER_ACCESS_COOKIE_SECRET: ${ORDER_ACCESS_COOKIE_SECRET:?ORDER_ACCESS_COOKIE_SECRET is required}
      RATE_LIMIT_STORE: supabase
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/ >/dev/null || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s

  web:
    image: nginx:1.30.1-alpine
    depends_on:
      app:
        condition: service_healthy
    ports:
      - "8003:80"
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped
```

Karakteristik wajib:

- tidak ada bind mount source aplikasi;
- service `app` memakai `image`, bukan `build`;
- image aplikasi wajib memakai `${APP_IMAGE}:${APP_TAG}`;
- `APP_TAG` operasional wajib full commit SHA immutable; `main`/`production` hanya convenience tag;
- secret diberikan saat runtime, bukan disalin ke image;
- Nginx hanya memasang config yang diperlukan;
- health check aktif.
- environment public Supabase tersedia pada build dan runtime.
- service-role key dan secret cookie akses order tersedia hanya pada runtime.
- rate-limit store production dikunci ke adapter shared `supabase`; Compose lokal tetap tidak
  diubah dan memakai default in-memory.

File tersebut tidak memiliki `build`, bind mount source, atau mount `node_modules`.

## Trusted Proxy dan Access Log

Topologi production yang didukung repository saat ini:

```text
client -> Nginx service `web` (host :8003) -> Next.js service `app` (network internal)
```

Service `app` tidak mempublikasikan port host. Karena itu Nginx menjadi trust boundary dan selalu
menimpa header app-facing `X-Daztore-Client-IP` dari `$remote_addr`. `X-Forwarded-For` juga ditimpa,
`CF-Connecting-IP` dibuang, dan aplikasi mengabaikan header forwarding lain. Nilai custom tersebut
tetap divalidasi sebagai IPv4/IPv6; nilai kosong/tidak valid menjadi `unknown`.

Konfigurasi ini tidak mengklaim dukungan client-IP asli di belakang CDN/load balancer yang belum
dipilih. Jika upstream resmi ditambahkan, operator wajib lebih dulu mengatur `real_ip_header`,
`set_real_ip_from` menggunakan CIDR resmi provider, dan `real_ip_recursive`; jangan percaya header
provider dari koneksi publik biasa. Tanpa konfigurasi itu, Nginx memakai IP peer upstream sehingga
rate limit menjadi lebih konservatif, tetapi client tidak dapat memilih key melalui spoofed header.

Access log Nginx memakai method + `$uri` tanpa query args atau referer, sehingga raw token pada
route exchange order tidak masuk access log. Response `/order/**` memakai satu effective
`Referrer-Policy: no-referrer`; header upstream disembunyikan sebelum policy Nginx diterapkan.
Location `/order/**` juga mengarahkan `error_log` ke `/dev/null` karena format error bawaan Nginx
dapat menyertakan request URI lengkap saat upstream gagal. Trade-off observability ini disengaja:
status, path tanpa query, ukuran response, dan request time tetap tersedia pada sanitized access
log, sedangkan diagnosis detail order dilakukan melalui healthcheck/app log tanpa mencetak token.

## Flow Deployment Production

Workflow aktif saat ini:

```text
push ke main
-> CI install, lint, typecheck, dan build
-> CI membangun Docker image
-> CI push image ke GHCR dengan tag commit SHA, main, dan production
```

Job SSH deploy otomatis sudah dihapus dari `.github/workflows/ci-cd.yml`. Deploy server dilakukan manual/operasional dengan menarik image yang sudah dipush ke GHCR.

Di server:

```bash
cd /opt/daztore
export APP_IMAGE=ghcr.io/daztore/landing_page
export APP_TAG=<full-40-character-commit-sha>
printf '%s' "$APP_TAG" | grep -Eq '^[0-9a-f]{40}$' || exit 1
docker compose -f docker-compose.production.yml config --quiet
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
```

Panduan setup server lengkap tersedia di `docs/CI_CD_DEPLOYMENT.md`.

## Rollback

Simpan SHA image terakhir yang diketahui sehat. Rollback hanya mengubah `APP_TAG` ke full commit
SHA tersebut; jangan memakai alias mutable.

```bash
cd /opt/daztore
export APP_IMAGE=ghcr.io/example/daztore
export APP_TAG=<previous-known-good-full-sha>
printf '%s' "$APP_TAG" | grep -Eq '^[0-9a-f]{40}$' || exit 1
docker compose -f docker-compose.production.yml config --quiet
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
```

Tag `latest`, `main`, atau `production` boleh menjadi alias operasional, tetapi rollback yang aman harus menggunakan tag immutable seperti full commit SHA.

## Secret Management

- Jangan `COPY .env` ke image.
- Jangan mengirim secret melalui `NEXT_PUBLIC_*`.
- Jangan menaruh secret sebagai Docker build argument biasa.
- Simpan secret di GitHub Actions Secrets dan secret store server.
- Inject secret server-only melalui environment runtime atau Docker secrets.
- `ORDER_ACCESS_COOKIE_SECRET` harus acak minimal 32 byte, khusus untuk bukti akses order, dan
  tidak boleh memakai ulang `SUPABASE_SERVICE_ROLE_KEY`.
- Publishable key Supabase boleh berada di client bundle, tetapi service-role key tidak boleh.
- Batasi akses registry dan SSH ke principal deployment.

## Health Check

Untuk jangka pendek, root page dapat dipakai sebagai health check. Untuk jangka panjang, tambahkan endpoint ringan seperti `/api/health` yang tidak bergantung pada layanan eksternal.

Health check sebaiknya menguji:

- process Next.js merespons;
- reverse proxy dapat menjangkau app;
- status bukan `5xx`;
- rollout dianggap gagal jika readiness tidak tercapai.

## File Docker Yang Tidak Terhubung

File berikut tidak direferensikan Dockerfile atau Compose aktif:

- `docker/supervisord.conf`;
- `docker/php/zz-docker.conf`;
- `docker/php/www.conf`.

`supervisord.conf` bahkan merujuk PHP-FPM, Nginx, PM2, `server.js`, dan path aplikasi lain. Treat sebagai legacy sampai pemilik sistem mengonfirmasi fungsinya.

## Needs Confirmation

- Registry image yang akan dipakai.
- Path aplikasi resmi di server.
- Arsitektur target server, misalnya `linux/amd64` atau `linux/arm64`.
- Apakah TLS ditangani Nginx ini atau reverse proxy/load balancer lain.
- Apakah file PHP/Supervisor dapat dihapus pada pekerjaan cleanup terpisah.
