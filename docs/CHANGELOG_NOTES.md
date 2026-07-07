# Changelog Notes

Dokumen ini mencatat perubahan penting yang berdampak pada arsitektur, environment, database, security, performance, atau flow bisnis.

## Format

### YYYY-MM-DD - Title

Type:

- Documentation
- Feature
- Fix
- Refactor
- Security
- Performance
- Database
- Infrastructure

Impact:

- Low
- Medium
- High

Summary:

- ...

Files:

- ...

Notes:

- ...

## Entries

### 2026-07-07 - Dependabot dependency alert cleanup

Type:

- Security
- Infrastructure
- Documentation

Impact:

- Medium

Summary:

- Menghapus `pnpm-lock.yaml` karena npm sudah menjadi package manager resmi dan
  `package-lock.json` menjadi satu-satunya lockfile yang boleh di-commit.
- Memperbarui `next` dan `eslint-config-next` ke `16.2.10`, `react` dan `react-dom` ke
  `19.2.7`, serta toolchain Tailwind/PostCSS ke versi patched.
- Menambahkan npm override scoped untuk `next -> postcss` agar nested PostCSS vulnerable tidak
  dipakai, dan override lodash agar resolusi transitive tetap patched.
- Menambahkan guard `.gitignore` untuk mencegah lockfile package manager non-npm masuk kembali.
- Memperbarui dokumentasi package manager, security, roadmap, maintenance, setup, troubleshooting,
  dan stack project.

Files:

- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `.gitignore`
- `README.md`
- `docs/PACKAGE_MANAGER_DECISION.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/ROADMAP.md`
- `docs/MAINTENANCE_NOTES.md`
- `docs/SETUP_LOCAL.md`
- `docs/TROUBLESHOOTING.md`
- `docs/AGENT_GUIDE.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`,
  `npm audit --audit-level=low`, `npm audit --audit-level=moderate`, dan dependency tree check
  berhasil.
- `npm audit` melaporkan 0 vulnerability setelah cleanup.
- `docker build` dengan dummy public env sudah dicoba, tetapi tidak dapat berjalan di mesin lokal
  karena Docker Desktop/Linux engine tidak aktif.
- Tidak ada perubahan route, UI, database schema, env secret, payment, shipping, checkout, atau
  customer account.

### 2026-07-06 - Phase 3 manual order management

Type:

- Feature
- Database
- Security
- Documentation

Impact:

- High

Summary:

- Membuat migration `007_create_orders_feature.sql` untuk tabel `orders`, `order_items`,
  `order_status_histories`, sequence nomor order, RLS admin-only, dan RPC
  `public.change_order_status()`.
- Menambahkan module `features/orders` untuk kontrak status, validasi create order, query
  admin/public, service create order, status workflow, dan token publik.
- Menambahkan admin order management di `/admin-daz/orders`, `/admin-daz/orders/new`, dan
  `/admin-daz/orders/[id]` dengan create draft order, item manual/katalog, status update,
  history, dan regenerasi link publik.
- Menambahkan route publik `/order/[orderNumber]?token=...` dengan token hash di database,
  service-role lookup server-only, metadata `noindex`, dan data customer yang dibatasi.
- Menambahkan shortcut dari detail lead ke create order dan menandai lead sebagai `converted`
  saat order dibuat dari lead.
- Memperbarui status roadmap Phase 3 untuk `Order data model`, `Admin create order`,
  `Public order detail page`, dan `Order status workflow` menjadi `DONE`.

Files:

- `supabase/migrations/007_create_orders_feature.sql`
- `features/orders/**`
- `features/catalog/queries/order-product-snapshot.ts`
- `features/catalog/server.ts`
- `app/admin-daz/(protected)/orders/**`
- `app/order/[orderNumber]/page.tsx`
- `app/admin-daz/(protected)/leads/[id]/page.tsx`
- `app/admin-daz/(protected)/dashboard/page.tsx`
- `components/admin-daz/admin-bottom-nav.tsx`
- `app/robots.ts`
- `README.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG_NOTES.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/COMMERCE_PREPARATION.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/ROUTES_AND_PAGES.md`
- `docs/API_AND_INTEGRATIONS.md`
- `docs/SUPABASE_MIGRATION.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/COMPONENTS.md`
- `docs/PROJECT_OVERVIEW.md`

Notes:

- Order baru selalu dimulai sebagai `draft` dan belum dianggap transaksi final.
- Public direct read/write Supabase untuk tabel order tidak dibuka; halaman publik order memakai
  nomor order dan token yang diverifikasi server-side terhadap hash di database.
- Payment provider, payment transaction table, webhook payment, shipping, tracking, cart,
  checkout, dan customer account tetap belum dibuat.

### 2026-07-06 - Phase 2 lead and inquiry management

Type:

- Feature
- Database
- Security
- Documentation

Impact:

- High

Summary:

- Membuat migration `006_create_leads_feature.sql` untuk tabel `leads`, `lead_messages`, index,
  trigger `updated_at`, RLS admin-only, dan RPC `public.change_lead_status()`.
- Menambahkan Route Handler public `/api/leads` dengan validasi server-side, body limit, honeypot,
  time-to-submit ringan, dan rate limit in-memory per IP/nomor WhatsApp.
- Menambahkan form inquiry aktif pada `/produk/[slug]` yang menyimpan lead server-side dan tetap
  memberi opsi lanjut chat WhatsApp setelah submit.
- Menambahkan admin lead management di `/admin-daz/leads` dan `/admin-daz/leads/[id]` dengan
  pagination, filter status, pencarian, detail, catatan follow-up, dan status workflow.
- Memperbarui dashboard dan navigasi admin agar Leads bisa diakses.
- Memperbarui status roadmap Phase 2 untuk `Inquiry form`, `Admin lead management`, dan
  `Lead status workflow` menjadi `DONE`.

Files:

- `supabase/migrations/006_create_leads_feature.sql`
- `app/api/leads/route.ts`
- `app/produk/[slug]/page.tsx`
- `app/admin-daz/(protected)/leads/**`
- `app/admin-daz/(protected)/dashboard/page.tsx`
- `components/admin-daz/admin-bottom-nav.tsx`
- `features/leads/**`
- `features/catalog/components/product-detail-view.tsx`
- `README.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG_NOTES.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/COMMERCE_PREPARATION.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/ROUTES_AND_PAGES.md`
- `docs/API_AND_INTEGRATIONS.md`
- `docs/SUPABASE_MIGRATION.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/COMPONENTS.md`

Notes:

- Public direct insert/read Supabase untuk `leads` dan `lead_messages` tidak dibuka; public submit
  diproses melalui Route Handler server-side dan service-role server-only.
- Rate limit lead masih in-memory per proses dan perlu store terpusat bila deployment menjadi
  multi-instance.
- Tidak ada order, payment, shipping, cart, checkout, customer account, payment provider, atau
  auto-create order dari lead yang dibuat.

### 2026-07-06 - Phase 2 product detail page

Type:

- Feature
- Documentation

Impact:

- Medium

Summary:

- Membuat route public `/produk/[slug]` untuk detail produk aktif dengan harga estimasi,
  CTA konsultasi WhatsApp, metadata SEO, dan fallback lokal saat Supabase tidak tersedia.
- Membuat module `features/catalog` untuk kontrak `ProductDetail`, query detail produk,
  dan sitemap produk aktif.
- Menambahkan link detail dari kartu katalog tanpa menghapus CTA WhatsApp existing.
- Menambahkan URL produk aktif ke `/sitemap.xml`.
- Memperbarui status roadmap Phase 2 `Product detail page` menjadi `DONE`.

Files:

- `app/produk/[slug]/page.tsx`
- `app/sitemap.ts`
- `components/katalog/product-card.tsx`
- `features/catalog/**`
- `README.md`
- `docs/ROADMAP.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/COMMERCE_PREPARATION.md`
- `docs/ROUTES_AND_PAGES.md`
- `docs/API_AND_INTEGRATIONS.md`
- `docs/COMPONENTS.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- Tidak ada migration, endpoint `/api/leads`, admin leads page, order, payment, shipping, cart,
  checkout, atau customer account yang dibuat.
- Inquiry form, admin lead management, dan lead status workflow tetap berada pada Phase 2 berikutnya.

### 2026-07-05 - Phase 1 P1 product detail, lead, and admin preparation

Type:

- Documentation

Impact:

- Low

Summary:

- Merancang struktur `/produk/[slug]`, kontrak `ProductDetail`, slug/404 behavior, SEO metadata,
  sitemap policy, dan image policy untuk product detail.
- Merancang module lead/inquiry, termasuk tabel `leads`, `lead_messages`, status lead, admin
  follow-up flow, public anti-spam/rate limit, dan notifikasi server-side tanpa secret client.
- Merancang admin module boundary untuk resource landing/content, catalog, feedback, leads,
  orders, payments, shipping, dan customers.
- Memperbarui status roadmap Phase 1 P1 untuk `Prepare product detail structure`,
  `Prepare lead/inquiry module`, dan `Prepare admin module boundary` menjadi `DONE`.

Files:

- `docs/ROADMAP.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/COMMERCE_PREPARATION.md`
- `docs/ROUTES_AND_PAGES.md`
- `docs/API_AND_INTEGRATIONS.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- Tidak ada route `/produk/[slug]`, `/api/leads`, admin leads page, migration, dependency, atau
  fitur commerce runtime yang dibuat.
- Implementasi product detail dan inquiry tetap berada pada Phase 2 sesuai roadmap.
- Order, payment, shipping, cart, checkout, dan customer account tetap tidak dibuat.

### 2026-07-05 - Package manager decision and modular architecture definition

Type:

- Documentation
- Infrastructure

Impact:

- Low

Summary:

- Menetapkan npm sebagai package manager resmi project dengan `packageManager: "npm@10.9.0"`.
- Mempertahankan `package-lock.json` sebagai lockfile utama dan menandai `pnpm-lock.yaml`
  sebagai legacy lockfile yang tidak dipakai jalur operasional aktif.
- Melengkapi keputusan modular architecture Phase 1, termasuk trigger pembuatan `features/`,
  module boundary, import rules, service/query layer, dan batas tanggung jawab `app/`.
- Memperbarui status roadmap untuk `Decide official package manager` dan `Define modular
  architecture` menjadi `DONE`.

Files:

- `package.json`
- `README.md`
- `docs/ROADMAP.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/PACKAGE_MANAGER_DECISION.md`
- `docs/SETUP_LOCAL.md`
- `docs/TROUBLESHOOTING.md`
- `docs/AGENT_GUIDE.md`
- `docs/MAINTENANCE_NOTES.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- Tidak ada dependency baru, lockfile dependency update, Dockerfile change, workflow CI change,
  database migration, atau fitur commerce yang dibuat.
- Saat entry ini dibuat, `pnpm-lock.yaml` belum dihapus karena belum ada approval eksplisit.
  Status ini sudah digantikan oleh cleanup Dependabot 2026-07-07.
- Versi npm dipin ke versi lokal yang tersedia saat keputusan dibuat, yaitu `npm@10.9.0`.

### 2026-07-03 - Performance baseline and workflow enforcement

Type:

- Documentation
- Performance

Impact:

- Low

Summary:

- Mencatat baseline Lighthouse lokal untuk `/`, `/katalog`, dan `/admin-daz/login`.
- Mencatat resource transfer, script transfer, image baseline, admin/public boundary check, dan checklist regresi performance.
- Mencatat decision record package manager dengan rekomendasi npm dan status blocked sampai owner mengonfirmasi keputusan final.
- Memperkuat workflow enforcement untuk agent/Codex pada `AGENTS.md`, `docs/AGENT_GUIDE.md`, `docs/DEVELOPMENT_RULES.md`, dan template prompt roadmap.
- Memperbarui status roadmap untuk Performance baseline dan Agent/Codex workflow enforcement menjadi `DONE`, serta Decide official package manager menjadi `BLOCKED`.

Files:

- `AGENTS.md`
- `README.md`
- `docs/PERFORMANCE_BASELINE.md`
- `docs/PACKAGE_MANAGER_DECISION.md`
- `docs/AGENT_GUIDE.md`
- `docs/DEVELOPMENT_RULES.md`
- `docs/prompts/ROADMAP_TASK_PROMPT_TEMPLATE.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/MAINTENANCE_NOTES.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- Tidak ada fitur commerce yang dibuat.
- Tidak ada perubahan package manager, lockfile, Dockerfile, atau workflow CI.
- Performance baseline adalah lab measurement lokal; field Core Web Vitals production belum tersedia.
- Package manager tetap menunggu approval owner sebelum `packageManager` ditambahkan ke `package.json` atau lockfile dihapus.

### 2026-07-03 - Environment and security audit before commerce

Type:

- Documentation
- Security

Impact:

- Low

Summary:

- Mengaudit penggunaan env aktif, termasuk boundary `NEXT_PUBLIC_*`, `SUPABASE_SERVICE_ROLE_KEY`, Docker build args, Compose runtime env, GitHub Actions env, `.gitignore`, dan `.dockerignore`.
- Mengaudit baseline security sebelum commerce, termasuk RLS, admin allowlist, feedback public route, upload validation, error handling, security headers, dependency advisory, dan CodeQL workflow.
- Menambahkan rate limit dasar server-side untuk submit feedback publik dengan response `429` dan header `Retry-After`.
- Memperbarui status roadmap untuk audit env dan security check tanpa membuat fitur order, payment, shipping, cart, checkout, atau customer account.
- Memperbarui `SECURITY.md` agar tidak lagi memakai template GitHub generik.

Files:

- `SECURITY.md`
- `app/feedback/[id]/submit/route.ts`
- `lib/security/rate-limit.ts`
- `docs/API_AND_INTEGRATIONS.md`
- `docs/ROUTES_AND_PAGES.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/MAINTENANCE_NOTES.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- Logic aplikasi yang diubah hanya guard rate limit pada Route Handler feedback publik.
- Tidak ada migration database yang dibuat.
- Rate limit feedback masih in-memory per proses; endpoint commerce publik nanti tetap membutuhkan abuse prevention yang sesuai skala.
- Magic-byte/content validation upload dan CSP/HSTS tetap menjadi gap sebelum commerce publik.
  Advisory PostCSS internal Next.js sudah dibersihkan pada cleanup Dependabot 2026-07-07.

### 2026-07-03 - Sync README and documentation with current code

Type:

- Documentation

Impact:

- Low

Summary:

- Menyinkronkan README dan dokumen teknis dengan route aktif, termasuk `/feedback/[id]`, Route Handler feedback submit, dan admin feedback requests.
- Menyinkronkan catatan service-role usage agar jelas hanya dipakai server-side untuk feedback.
- Menyinkronkan port Compose lokal `8002` dan Compose production `8003`.
- Menyinkronkan status CI/CD aktif: verify, build image, dan push GHCR; deploy SSH otomatis belum aktif.
- Mencatat gap yang belum langsung diperbaiki, seperti rate limit feedback publik, analytics nonaktif, dan deploy manual.

Files:

- `README.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/ROUTES_AND_PAGES.md`
- `docs/API_AND_INTEGRATIONS.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/SUPABASE_MIGRATION.md`
- `docs/DOCKER_AND_DEPLOYMENT.md`
- `docs/CI_CD_RECOMMENDATION.md`
- `docs/CI_CD_DEPLOYMENT.md`
- `docs/SETUP_LOCAL.md`
- `docs/TROUBLESHOOTING.md`
- `docs/COMPONENTS.md`
- `docs/MAINTENANCE_NOTES.md`
- `docs/ROADMAP.md`
- `docs/CHANGELOG_NOTES.md`

Notes:

- Tidak ada logic aplikasi utama yang diubah.
- Tidak ada schema database yang diubah.
- Tidak ada fitur order, payment, shipping, cart, checkout, atau customer account yang dibuat.
- Gap yang tidak langsung diperbaiki tetap dicatat sebagai risiko/needs confirmation pada dokumen terkait.

### 2026-07-03 - Documentation roadmap foundation

Type:

- Documentation

Impact:

- Low

Summary:

- Menambahkan roadmap pengembangan jangka pendek, menengah, dan panjang.
- Menambahkan aturan development dan panduan agent/Codex.
- Menambahkan rencana arsitektur modular monolith.
- Menambahkan checklist security/performance.
- Menambahkan dokumen persiapan commerce tanpa membangun fitur commerce.
- Menambahkan template QA/UX notes.

Files:

- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_RULES.md`
- `docs/AGENT_GUIDE.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/COMMERCE_PREPARATION.md`
- `docs/QA_UX_NOTES.md`
- `docs/CHANGELOG_NOTES.md`
- `README.md`

Notes:

- Tidak ada logic aplikasi utama yang diubah.
- Tidak ada schema database yang diubah.
- Tidak ada fitur order, payment, shipping, cart, atau checkout yang dibuat.
- Dokumentasi ini menjadi acuan untuk task pengembangan berikutnya.
