# daztore.id Landing Page

Landing page dan katalog premium untuk layanan mahar, seserahan, bouquet, hampers, serta wedding gift box. Project dibangun dengan Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, dan disiapkan untuk runtime Docker di belakang Nginx.

## Stack

- Next.js `16.2.10`
- React `19.2.7`
- TypeScript `5.7.3`
- Tailwind CSS `4.x`
- Supabase JavaScript `2.108.0`
- Node.js 20 pada Docker
- npm `10.9.0` sebagai package manager resmi dengan `package-lock.json` sebagai satu-satunya lockfile
- Nginx reverse proxy

## Quick Start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan URL, publishable key Supabase, site URL, dan service-role key server-only
untuk fitur feedback, inquiry lead, serta public order lookup. Jika database belum siap, aplikasi
tetap memakai fallback lokal untuk konten publik.

Buka:

```text
http://localhost:3000
http://localhost:3000/katalog
http://localhost:3000/produk/mahar-1
http://localhost:3000/admin-daz/login
```

Script project:

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

Lint menggunakan ESLint flat config dengan aturan Next.js Core Web Vitals dan TypeScript.
Baseline existing masih menghasilkan warning non-blocking yang didokumentasikan pada
[Maintenance Notes](./docs/MAINTENANCE_NOTES.md).

## Struktur Singkat

```text
app/                Route dan layout App Router
components/         Section landing page, katalog, feedback, admin, dan primitive UI
lib/                Data access, Supabase helper, admin, feedback, security, dan utility
supabase/           SQL migration dan seed
public/             Asset gambar
docker/             Konfigurasi Nginx serta file legacy PHP/Supervisor
.github/workflows/  Workflow CI/CD dan security CodeQL
docs/               Dokumentasi teknis dan operasional
```

Route aktif:

| Route | Fungsi |
| --- | --- |
| `/` | Landing page utama dan CTA kontak. |
| `/katalog` | Katalog Supabase dengan pencarian, filter, dan sorting client-side. |
| `/produk/[slug]` | Detail produk aktif dengan harga estimasi dan CTA konsultasi. |
| `/order/[orderNumber]?token=...` | Ringkasan order publik berbasis token aman dan `noindex`. |
| `/api/leads` | Route Handler `POST` untuk inquiry produk publik. |
| `/feedback/[id]` | Form feedback pelanggan berbasis link UUID dan tidak diindex. |
| `/feedback/[id]/submit` | Route Handler `POST` untuk submission feedback dan upload foto pelanggan. |
| `/admin-daz` | Redirect ke dashboard admin terproteksi. |
| `/admin-daz/**` | Panel admin terproteksi untuk konten, katalog, leads, orders, feedback, settings, dan gambar. |

## Supabase

Setup ringkas:

1. Jalankan `supabase/migrations/001_create_landing_page_tables.sql` di Supabase SQL Editor.
2. Jalankan `supabase/migrations/002_create_storage_buckets.sql`.
3. Jalankan `supabase/migrations/003_create_admin_access.sql`.
4. Jalankan `supabase/migrations/004_create_feedback_feature.sql`.
5. Jalankan `supabase/migrations/005_harden_feedback_privacy_and_catalog_cleanup.sql`.
6. Jalankan `supabase/migrations/006_create_leads_feature.sql`.
7. Jalankan `supabase/migrations/007_create_orders_feature.sql`.
8. Upload asset landing page ke bucket `landing_page` dan asset produk ke bucket `catalogs`.
9. Jalankan `supabase/seed.sql`.
10. Buat user email/password melalui Supabase Auth, lalu tambahkan user tersebut ke `public.admin_users`.
11. Isi `.env.local`.
12. Restart development server.

Nilai gambar pada database disimpan sebagai object path portabel, bukan full public URL.
File di `public/` tetap dipertahankan sebagai fallback lokal. Daftar object path yang perlu
di-upload tersedia di [Supabase Migration](./docs/SUPABASE_MIGRATION.md).

Panduan lengkap: [Supabase Migration](./docs/SUPABASE_MIGRATION.md).

## Docker Lokal

```bash
docker compose build
docker compose up -d
docker compose ps
```

Aplikasi tersedia di `http://localhost:8002`.

`docker-compose.yml` tetap ditujukan untuk penggunaan lokal. Deployment server wajib memakai
`docker-compose.production.yml`, yang menarik image GHCR tanpa bind mount source.

## Deployment Production

Workflow CI/CD aktif saat ini berhenti sampai verifikasi, build Docker image, dan push ke GHCR. Deploy SSH otomatis belum aktif di `.github/workflows/ci-cd.yml`.

Flow production yang direkomendasikan tetap:

```text
push ke main
-> CI lint/typecheck/build
-> Docker build
-> Docker push dengan tag commit SHA
-> server production pull image
-> docker compose pull
-> docker compose up -d
-> health check manual/operasional
```

Server production tidak perlu menjalankan `npm install` atau `npm run build`. Server hanya menarik image yang sudah divalidasi CI dan me-restart container.

Panduan secrets, persiapan server, deploy manual, dan rollback:
[CI/CD Deployment](./docs/CI_CD_DEPLOYMENT.md).

## Dokumentasi

Dokumentasi roadmap dan aturan kerja:

- [Roadmap](./docs/ROADMAP.md)
- [Development Rules](./docs/DEVELOPMENT_RULES.md)
- [Agent Guide](./docs/AGENT_GUIDE.md)
- [Module Architecture](./docs/MODULE_ARCHITECTURE.md)
- [Security and Performance](./docs/SECURITY_AND_PERFORMANCE.md)
- [Performance Baseline](./docs/PERFORMANCE_BASELINE.md)
- [Commerce Preparation](./docs/COMMERCE_PREPARATION.md)
- [QA/UX Notes](./docs/QA_UX_NOTES.md)
- [Changelog Notes](./docs/CHANGELOG_NOTES.md)

Dokumentasi teknis dan operasional existing:

- [Project Overview](./docs/PROJECT_OVERVIEW.md)
- [Setup Local](./docs/SETUP_LOCAL.md)
- [Package Manager Decision](./docs/PACKAGE_MANAGER_DECISION.md)
- [Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
- [Routes and Pages](./docs/ROUTES_AND_PAGES.md)
- [Components](./docs/COMPONENTS.md)
- [API and Integrations](./docs/API_AND_INTEGRATIONS.md)
- [Docker and Deployment](./docs/DOCKER_AND_DEPLOYMENT.md)
- [CI/CD Recommendation](./docs/CI_CD_RECOMMENDATION.md)
- [CI/CD Deployment](./docs/CI_CD_DEPLOYMENT.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Maintenance Notes](./docs/MAINTENANCE_NOTES.md)
- [Supabase Migration](./docs/SUPABASE_MIGRATION.md)

## Kondisi Yang Perlu Diketahui

- Konten publik dibaca dari Supabase dengan RLS read-only.
- Gambar aktif dibaca dari bucket publik `landing_page` dan `catalogs`.
- `lib/katalog-data.ts` dan `lib/data/fallback.ts` dipertahankan sebagai fallback.
- CTA utama membuka WhatsApp, email, atau Instagram.
- Supabase public content memakai publishable key; feedback, inquiry lead publik, dan public order
  lookup memakai service-role key server-only melalui route/server Next.js.
- Admin memakai Supabase Auth cookie session dan allowlist `admin_users`.
- Write database/Storage hanya diizinkan RLS untuk admin aktif.
- `feedback_customer_photos` adalah bucket private; public feedback submit diproses server-side.
- CI/CD aktif saat ini tidak melakukan SSH deploy otomatis.
- Beberapa area production masih memerlukan hardening; lihat maintenance notes sebelum go-live.
