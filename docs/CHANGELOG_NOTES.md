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
- `pnpm-lock.yaml` tidak dihapus karena belum ada approval eksplisit untuk cleanup lockfile.
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
- Magic-byte/content validation upload, CSP/HSTS, dan advisory PostCSS internal Next.js tetap menjadi gap sebelum commerce publik.

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
