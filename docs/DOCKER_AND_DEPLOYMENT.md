# Docker and Deployment

## Kondisi Saat Ini

Repository memiliki:

- `Dockerfile` multi-stage;
- `docker-compose.yml`;
- reverse proxy Nginx;
- beberapa file PHP/Supervisor yang tidak digunakan oleh Dockerfile atau Compose aktif.

Konfigurasi dapat digunakan sebagai dasar, tetapi belum aman untuk flow production immutable tanpa perubahan.

## Dockerfile

### Stage `builder`

Base image:

```dockerfile
FROM node:20-alpine AS builder
```

Urutan:

1. Set working directory `/app`.
2. Terima build arguments Supabase public.
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
- Supabase URL dan publishable key dari build arguments/runtime environment;
- menyalin `.next`;
- menyalin `public`;
- menyalin `package.json`;
- menyalin seluruh `node_modules`;
- expose port `3000`;
- menjalankan `npm start`.

Image belum menggunakan Next.js standalone output. Karena itu runtime masih membawa seluruh `node_modules`, termasuk dependency development yang terinstal oleh `npm ci`.

## Docker Compose Saat Ini

### Service `app`

- Dibangun lokal dari `Dockerfile`.
- Container name `daztore-app`.
- Menetapkan `NODE_ENV=production`.
- Memasang bind mount `.:/app`.
- Memasang anonymous volume `/app/node_modules`.
- Tidak mengekspos port langsung ke host.

### Service `web`

- Menggunakan `nginx:1.30.1-alpine`.
- Container name `daztore-nginx`.
- Meneruskan host `8002` ke container `80`.
- Memasang repository ke `/app`, walaupun Nginx config hanya melakukan reverse proxy.
- Memasang `docker/nginx/default.conf` read-only.
- Meneruskan request ke `http://app:3000`.

## Risiko Production Penting

### 1. Bind mount menutupi hasil build image

Mount berikut:

```yaml
- .:/app
```

dapat menutupi `.next`, `package.json`, dan file aplikasi yang sudah dibangun di image. Jika host tidak memiliki `.next`, `npm start` dapat gagal karena production build tidak ditemukan.

Bind mount juga membuat container tidak immutable karena perilakunya bergantung pada isi filesystem server.

### 2. Service `app` tidak memiliki `image`

Compose saat ini memakai `build`, bukan image registry. Karena itu flow:

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
```

`.env.local` tidak masuk build context. Nilai Supabase diteruskan melalui build arguments dan environment.

### 4. Tidak ada health check

Compose tidak memeriksa apakah Next.js atau Nginx benar-benar siap menerima traffic.

### 5. TypeScript build errors diabaikan

`next.config.mjs` menetapkan `typescript.ignoreBuildErrors: true`, sehingga image dapat berhasil dibangun walaupun type check gagal.

## Menjalankan Compose Saat Ini Untuk Verifikasi Lokal

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

## Target Compose Production

Production harus menggunakan image yang sudah dibangun dan didorong oleh CI. Contoh struktur yang direkomendasikan:

```yaml
services:
  app:
    image: ${APP_IMAGE}:${APP_TAG}
    environment:
      NODE_ENV: production
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
      - "8002:80"
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped
```

Karakteristik wajib:

- tidak ada bind mount source aplikasi;
- service `app` memakai `image`, bukan `build`;
- tag image berasal dari commit SHA;
- secret diberikan saat runtime, bukan disalin ke image;
- Nginx hanya memasang config yang diperlukan;
- health check aktif.
- environment Supabase tersedia pada build dan runtime.

Contoh di atas belum dibuat sebagai file karena tugas dokumentasi tidak mengubah deployment behavior.

## Flow Deployment Production

```text
push ke main
-> CI install, lint, dan build
-> CI membangun Docker image
-> CI push image dengan tag commit SHA
-> CI SSH ke server
-> server menarik image
-> server menjalankan docker compose up -d
-> health check dan smoke test
```

Di server:

```bash
cd /opt/daztore
export APP_IMAGE=ghcr.io/example/daztore
export APP_TAG=<full-commit-sha>
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
```

`docker-compose.production.yml` adalah nama rekomendasi dan belum ada di repository.

## Rollback

Simpan SHA image terakhir yang diketahui sehat.

```bash
cd /opt/daztore
export APP_IMAGE=ghcr.io/example/daztore
export APP_TAG=<previous-known-good-sha>
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
```

Tag `latest` atau `production` boleh menjadi alias operasional, tetapi rollback harus menggunakan tag immutable seperti full commit SHA.

## Secret Management

- Jangan `COPY .env` ke image.
- Jangan mengirim secret melalui `NEXT_PUBLIC_*`.
- Jangan menaruh secret sebagai Docker build argument biasa.
- Simpan secret di GitHub Actions Secrets dan secret store server.
- Inject secret server-only melalui environment runtime atau Docker secrets.
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
