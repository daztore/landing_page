# Agent Guide

Dokumen ini wajib dibaca oleh agent/Codex sebelum mengerjakan task pada project ini.

Tujuan dokumen ini adalah mencegah perubahan melebar, menjaga keamanan/performa, dan memastikan agent mengikuti roadmap project.

## Mandatory Reading Order

Sebelum coding, agent wajib membaca:

1. `docs/ROADMAP.md`
2. `docs/DEVELOPMENT_RULES.md`
3. `docs/MODULE_ARCHITECTURE.md`
4. `docs/SECURITY_AND_PERFORMANCE.md`
5. `docs/QA_UX_NOTES.md` jika task berasal dari revisi QA/UX
6. `README.md` untuk konteks setup, script, dan dokumentasi existing
7. File terkait task

Untuk task Supabase, Docker, CI/CD, atau deployment, baca juga dokumen existing yang relevan:

- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/SUPABASE_MIGRATION.md`
- `docs/DOCKER_AND_DEPLOYMENT.md`
- `docs/CI_CD_RECOMMENDATION.md`
- `docs/CI_CD_DEPLOYMENT.md`
- `docs/MAINTENANCE_NOTES.md`

## Project Snapshot

- Project adalah Next.js App Router landing page + katalog + admin CMS.
- Supabase dipakai untuk konten publik, admin, feedback, Storage, Auth, dan RLS.
- Fitur commerce penuh belum dibuat.
- Order, payment, shipping, cart, checkout, customer account, dan tracking publik masih roadmap.
- npm adalah baseline operasional saat ini karena CI dan Docker memakai `npm ci`.
- Jangan menghapus `pnpm-lock.yaml` tanpa approval eksplisit owner project.

## Agent Working Rules

- Kerjakan hanya sesuai scope prompt.
- Jangan membuat fitur yang belum diminta.
- Jangan langsung membuat payment, order, shipping, cart, checkout, atau customer account jika task hanya dokumentasi/persiapan.
- Jangan mengubah UI/UX tanpa instruksi.
- Jangan menghapus fallback data tanpa analisis.
- Jangan mengubah route lama tanpa memastikan backward compatibility.
- Jangan hardcode secret/API key.
- Jangan menggunakan service-role key di Client Component.
- Jangan menambahkan package baru tanpa alasan jelas.
- Jangan mengubah package manager.
- Jangan melakukan refactor massal.
- Jangan mengubah schema database tanpa migration.
- Jangan mengubah Docker/CI/CD production flow tanpa membaca dokumen deployment.
- Setelah selesai, berikan summary file yang diubah dan alasan.

## Preflight Checklist

Sebelum edit:

- Cek `git status --short`.
- Inspect struktur project.
- Baca file yang akan diubah.
- Baca dokumentasi wajib sesuai task.
- Identifikasi apakah task menyentuh security, database, env, atau deployment.
- Pastikan tidak ada perubahan user yang tertimpa.
- Pastikan scope tidak melebihi prompt.

## Scope Control

Jika prompt tidak jelas:

- Agent boleh membuat asumsi kecil yang aman.
- Agent harus menulis asumsi di summary akhir.
- Jangan membuat fitur besar berdasarkan asumsi.
- Jika ada konflik antara prompt dan roadmap, ikuti prompt terbaru tetapi catat konfliknya.
- Jika menemukan bug unrelated, catat sebagai note/roadmap item kecuali security-critical.

Contoh scope aman:

- Task: "buat roadmap commerce" -> buat dokumentasi saja.
- Task: "siapkan payment preparation" -> tulis desain dan checklist, jangan integrasi gateway.
- Task: "fix admin upload bug" -> baca admin/upload code, perbaiki kecil, jangan ubah seluruh admin.
- Task: "tambahkan Xendit" -> tetap butuh desain provider, env, webhook security, migration, dan test plan.

## File Ownership Guidance

- `app/` berisi route, layout, Route Handler, dan orchestration.
- `components/` berisi UI existing.
- `lib/` berisi data access, service, utility, Supabase helper, dan security helper existing.
- `supabase/migrations/` berisi perubahan schema/policy.
- `docs/` berisi dokumentasi teknis dan roadmap.
- `.github/workflows/` berisi CI/CD dan security scanning.
- `docker-compose.production.yml` harus tetap production-oriented dan tidak memakai bind mount source.

## Security Rules For Agent

- Jangan membaca atau menyalin isi `.env.local` ke output.
- Jangan menulis value secret asli ke dokumentasi atau kode.
- Jangan menjadikan secret sebagai `NEXT_PUBLIC_*`.
- Jangan menaruh `SUPABASE_SERVICE_ROLE_KEY` di browser/client bundle.
- Jangan expose stack trace atau error internal ke user publik.
- Jangan bypass RLS dengan service-role kecuali route server-only memang membutuhkan.
- Jangan membuat webhook tanpa validasi signature/token.
- Jangan membuat endpoint publik write tanpa validasi dan rate-limit plan.

## Performance Rules For Agent

- Landing page harus tetap cepat.
- Hindari Client Component jika Server Component cukup.
- Jangan fetch data admin di halaman publik.
- Jangan menambah animasi/asset berat tanpa pengukuran.
- Tambahkan pagination untuk list besar.
- Hindari query berulang dan N+1.
- Jalankan build untuk perubahan besar.
- Audit bundle/performa sebelum fitur commerce besar.

## Documentation Update Matrix

Update dokumen berikut bila perubahan menyentuh area terkait:

| Area perubahan | Dokumen yang dicek/update |
| --- | --- |
| Roadmap/priority/scope | `docs/ROADMAP.md` |
| Aturan teknis | `docs/DEVELOPMENT_RULES.md` |
| Instruksi agent | `docs/AGENT_GUIDE.md` |
| Struktur folder/module | `docs/MODULE_ARCHITECTURE.md` |
| Security/performance | `docs/SECURITY_AND_PERFORMANCE.md` |
| Commerce/order/payment/shipping | `docs/COMMERCE_PREPARATION.md` |
| Revisi QA/UX | `docs/QA_UX_NOTES.md` |
| Perubahan penting internal | `docs/CHANGELOG_NOTES.md` |
| Env var | `docs/ENVIRONMENT_VARIABLES.md` dan README bila perlu |
| Supabase schema/RLS | `docs/SUPABASE_MIGRATION.md` |
| Docker/CI/CD | `docs/DOCKER_AND_DEPLOYMENT.md` dan `docs/CI_CD_*` |

## Agent Response Format

Gunakan format akhir berikut:

```markdown
## Summary
- ...

## Files Changed
- ...

## Notes
- ...

## Risk
- Low/Medium/High

## Test Recommendation
- ...
```

## Risk Classification

- `Low`: dokumentasi, copy kecil, atau perubahan terisolasi tanpa logic runtime.
- `Medium`: perubahan UI, data fetching, admin CRUD, env, Docker, atau route publik.
- `High`: database migration, auth/RLS, payment, webhook, order, shipping, file upload, atau deployment production.

## When To Stop And Ask

Agent harus bertanya sebelum lanjut jika:

- Task membutuhkan secret/credential yang tidak tersedia.
- Perubahan bisa menghapus data production.
- Perubahan membutuhkan keputusan package manager.
- Perubahan membutuhkan provider payment/shipping production.
- Prompt meminta action destruktif yang ambigu.
- Ada konflik serius antara prompt, roadmap, dan kondisi code.

Jika tidak ada blocker besar, agent harus membuat asumsi aman dan menyelesaikan pekerjaan.
