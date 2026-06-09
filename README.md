# daztore.id Landing Page

Landing page dan katalog premium untuk layanan mahar, seserahan, bouquet, hampers, serta wedding gift box. Project dibangun dengan Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, dan disiapkan untuk runtime Docker di belakang Nginx.

## Stack

- Next.js `16.2.7`
- React `19.2.4`
- TypeScript `5.7.3`
- Tailwind CSS `4.x`
- Supabase JavaScript `2.108.0`
- Node.js 20 pada Docker
- Nginx reverse proxy

## Quick Start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan URL dan publishable key Supabase. Jika database belum siap, aplikasi tetap memakai fallback lokal.

Buka:

```text
http://localhost:3000
http://localhost:3000/katalog
```

Script project:

```bash
npm run dev
npm run lint
npm run build
npm run start
```

> **Catatan:** Script lint tersedia, tetapi dependency ESLint belum terdaftar pada repository saat dokumentasi dibuat. Lihat [Setup Local](./docs/SETUP_LOCAL.md).

## Struktur Singkat

```text
app/                Route dan layout App Router
components/         Section landing page, katalog, dan primitive UI
lib/                Data katalog dan utility
supabase/           SQL migration dan seed
public/             Asset gambar
docker/             Konfigurasi Nginx serta file legacy PHP/Supervisor
.github/workflows/  Workflow security CodeQL
docs/               Dokumentasi teknis dan operasional
```

Route aktif:

| Route | Fungsi |
| --- | --- |
| `/` | Landing page utama dan CTA kontak. |
| `/katalog` | Katalog Supabase dengan pencarian, filter, dan sorting client-side. |

## Supabase

Setup ringkas:

1. Jalankan `supabase/migrations/001_create_landing_page_tables.sql` di Supabase SQL Editor.
2. Jalankan `supabase/seed.sql`.
3. Isi `.env.local`.
4. Restart development server.

Panduan lengkap: [Supabase Migration](./docs/SUPABASE_MIGRATION.md).

## Docker Lokal

```bash
docker compose build
docker compose up -d
docker compose ps
```

Aplikasi tersedia di `http://localhost:8002`.

> **Peringatan production:** Compose saat ini memakai bind mount source dan service app belum menunjuk registry image. Jangan gunakan konfigurasi tersebut sebagai deployment immutable sebelum mengikuti [Docker and Deployment](./docs/DOCKER_AND_DEPLOYMENT.md).

## Deployment Production

Flow yang direkomendasikan:

```text
push ke main
-> CI lint/build
-> Docker build
-> Docker push dengan tag commit SHA
-> SSH ke server
-> docker compose pull
-> docker compose up -d
-> health check
```

Server production tidak perlu menjalankan `npm install` atau `npm run build`. Server hanya menarik image yang sudah divalidasi CI dan me-restart container.

## Dokumentasi

- [Project Overview](./docs/PROJECT_OVERVIEW.md)
- [Setup Local](./docs/SETUP_LOCAL.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [Routes and Pages](./docs/ROUTES_AND_PAGES.md)
- [Components](./docs/COMPONENTS.md)
- [API and Integrations](./docs/API_AND_INTEGRATIONS.md)
- [Docker and Deployment](./docs/DOCKER_AND_DEPLOYMENT.md)
- [CI/CD Recommendation](./docs/CI_CD_RECOMMENDATION.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Maintenance Notes](./docs/MAINTENANCE_NOTES.md)
- [Supabase Migration](./docs/SUPABASE_MIGRATION.md)

## Kondisi Yang Perlu Diketahui

- Konten publik dibaca dari Supabase dengan RLS read-only.
- `lib/katalog-data.ts` dan `lib/data/fallback.ts` dipertahankan sebagai fallback.
- CTA utama membuka WhatsApp, email, atau Instagram.
- Supabase memakai publishable key; service-role key tidak digunakan.
- Beberapa area production masih memerlukan hardening; lihat maintenance notes sebelum go-live.
