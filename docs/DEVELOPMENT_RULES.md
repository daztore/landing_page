# Development Rules

Dokumen ini berisi aturan kerja teknis untuk developer dan agent/Codex. Aturan ini wajib dibaca sebelum coding.

## Prinsip Utama

- Jangan merusak fitur lama yang sudah berjalan.
- Jangan melakukan refactor besar tanpa alasan kuat.
- Pengembangan baru harus additive dan reviewable.
- Fitur baru harus masuk modul yang sesuai.
- Jangan mencampur logic order, payment, shipping, lead, atau customer ke file landing page lama.
- Jangan membuat dependency antar modul tanpa alasan jelas.
- Jangan membuat perubahan schema database yang breaking tanpa migration dan catatan.
- Semua fitur transaksi harus memiliki status yang terdokumentasi.
- Semua perubahan status transaksi harus memiliki history/audit trail.
- Semua integrasi eksternal harus dibuat melalui service/provider layer.
- Semua data sensitif hanya boleh diproses server-side.
- Jangan membangun fitur di luar scope prompt walaupun terlihat berhubungan.

## Mandatory Reading Before Coding

Sebelum mengubah kode, baca:

1. `docs/ROADMAP.md`
2. `docs/DEVELOPMENT_RULES.md`
3. `docs/AGENT_GUIDE.md`
4. `docs/MODULE_ARCHITECTURE.md`
5. `docs/SECURITY_AND_PERFORMANCE.md`
6. `docs/QA_UX_NOTES.md` jika task berasal dari revisi QA/UX
7. File kode dan dokumentasi yang terkait langsung dengan task

## Scope Control

- Kerjakan hanya sesuai scope prompt.
- Jika prompt meminta dokumentasi, jangan membuat fitur.
- Jika prompt meminta bug fix kecil, jangan refactor modul besar.
- Jika menemukan issue unrelated, catat di `docs/CHANGELOG_NOTES.md` atau `docs/ROADMAP.md`.
- Issue unrelated hanya boleh langsung diperbaiki bila security-critical atau menyebabkan data loss.
- Jika ada konflik antara prompt dan roadmap, ikuti prompt terbaru tetapi catat konflik dan risikonya.
- Jika prompt ambigu, buat asumsi kecil yang aman dan tulis asumsi tersebut pada summary akhir.

## Workflow Enforcement

Untuk task roadmap, developer/agent wajib:

- identifikasi item roadmap dan status awal sebelum mengubah file;
- baca `AGENTS.md`, roadmap, rules, agent guide, dan dokumen terkait task;
- nyatakan scope dan asumsi bila prompt ambigu;
- buat perubahan kecil yang bisa direview;
- update dokumentasi bila menyentuh env, API, database, security, performance, deployment, atau flow bisnis;
- catat issue unrelated di dokumen terkait, jangan langsung diperbaiki kecuali security-critical atau berisiko data loss;
- update `docs/ROADMAP.md` jika status task berubah;
- update `docs/CHANGELOG_NOTES.md` untuk perubahan penting;
- gunakan format final response yang konsisten dan jangan mengklaim validasi yang tidak dijalankan.

## Aturan Coding

- Respect existing Next.js App Router structure.
- Gunakan pola yang sudah ada di project sebelum membuat abstraction baru.
- Jangan menambahkan dependency baru tanpa alasan jelas.
- Jangan mengubah package manager tanpa keputusan owner project.
- Jangan hardcode secret, token, SMTP password, API key, private URL, atau credential lain.
- Jangan memakai `SUPABASE_SERVICE_ROLE_KEY` di Client Component.
- Jangan mengubah route lama tanpa memastikan backward compatibility.
- Jangan menghapus fallback data tanpa analisis production.
- Jangan menghapus legacy file tanpa konfirmasi owner.
- Simpan reusable UI di area shared/design system yang disepakati.
- Simpan helper umum di shared/lib atau lokasi existing yang sesuai.
- Simpan logic domain di service/query layer, bukan langsung di component presentasional.

## Aturan Next.js

- Pertahankan App Router.
- Hindari Client Component bila tidak membutuhkan state, effect, browser API, atau interaksi.
- Gunakan Server Component untuk data fetching publik bila cocok.
- Perhatikan `revalidate`, caching, dan data freshness.
- Jangan fetch data admin dari halaman publik.
- Jangan memuat bundle admin di halaman publik.
- Jangan expose server-only error detail ke browser.
- Route Handler publik harus memvalidasi method, input, dan rate limit bila menerima write.

## Aturan Database

- Gunakan migration untuk perubahan schema.
- Jangan ubah data lama tanpa backup/migration plan.
- Jangan menjalankan `drop`, `truncate`, atau delete massal sebagai rollback aplikasi.
- Gunakan status enum/text yang terdokumentasi.
- Pastikan RLS policy dipikirkan untuk setiap tabel baru.
- Pastikan admin write dibatasi ke user authenticated yang masuk allowlist.
- Pastikan public read hanya untuk data yang memang aman dibaca publik.
- Untuk order item, simpan snapshot data produk.
- Untuk payment webhook, simpan raw event secara aman.
- Untuk perubahan status order/payment/shipment, simpan history.
- Untuk data sensitif customer, simpan hanya field yang dibutuhkan bisnis.

## Aturan Supabase

- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` boleh dipakai client karena bersifat public.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai server-side.
- File `lib/supabase/service-role.ts` harus tetap `server-only`.
- Browser/admin client harus menggunakan publishable key dan RLS, bukan service-role key.
- Storage upload harus memvalidasi MIME type, extension, ukuran file, dan path.
- Signed URL/private bucket harus dipakai untuk file yang tidak boleh public.

## Aturan Environment Variable

Jangan isi value asli di dokumentasi. Gunakan contoh dummy.

| Nama env | Digunakan untuk apa | Server/client | Wajib/opsional | Contoh dummy value |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, metadata, robots, sitemap | Client/public build-time dan runtime | Wajib production | `https://example.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase untuk public/admin client dan service server | Client/public build-time dan runtime | Wajib jika Supabase aktif | `https://project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key untuk query public dan auth | Client/public build-time dan runtime | Wajib jika Supabase aktif | `sb_publishable_dummy` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only operation untuk feedback/private operation tertentu | Server-only runtime | Wajib untuk fitur feedback server-side | `sb_secret_dummy` |
| `XENDIT_SECRET_KEY` | Secret server-side untuk Xendit | Server-only runtime | Opsional, Phase 4 | `xnd_development_dummy` |
| `XENDIT_WEBHOOK_TOKEN` | Validasi webhook Xendit | Server-only runtime | Opsional, Phase 4 | `xendit_webhook_dummy` |
| `MIDTRANS_SERVER_KEY` | Secret server-side untuk Midtrans | Server-only runtime | Opsional, Phase 4 | `midtrans_server_dummy` |
| `MIDTRANS_CLIENT_KEY` | Client key Midtrans sesuai kebutuhan provider | Client/public bila provider mewajibkan | Opsional, Phase 4 | `midtrans_client_dummy` |
| `MIDTRANS_IS_PRODUCTION` | Mode sandbox/production Midtrans | Server/runtime config | Opsional, Phase 4 | `false` |
| `RAJAONGKIR_API_KEY` | API key ongkir/tracking | Server-only runtime | Opsional, Phase 5 | `rajaongkir_dummy` |
| `KOMERCE_API_KEY` | API key ongkir/tracking jika memakai Komerce | Server-only runtime | Opsional, Phase 5 | `komerce_dummy` |

Aturan tambahan:

- Jangan masukkan `.env.local` ke Git.
- Jangan copy `.env` ke Docker image.
- Jangan mengirim secret sebagai Docker build argument.
- `NEXT_PUBLIC_*` dapat masuk client bundle, jadi jangan taruh secret di sana.
- Dokumentasikan env baru di README atau dokumen env terkait bila benar-benar digunakan.

## Aturan Integrasi Eksternal

- Semua provider payment harus lewat provider interface.
- Semua provider shipping harus lewat provider interface.
- Webhook harus validasi signature/token.
- Webhook harus idempotent.
- Jangan percaya data status/amount dari client.
- Simpan provider reference untuk audit.
- Jangan hardcode provider ke domain order/customer.
- Logging tidak boleh memuat secret, token, full credential, atau data pribadi berlebihan.

## Aturan Commerce

- Jangan membangun payment/order/shipping/cart/checkout pada task dokumentasi.
- Lead dan inquiry harus disiapkan sebelum order manual.
- Order manual harus stabil sebelum payment online.
- Payment online harus aman sebelum checkout publik.
- Order item harus menyimpan snapshot produk.
- Payment webhook harus disimpan sebagai event.
- Perubahan status order harus masuk history.
- Jangan mengandalkan data produk live untuk order lama.
- Jangan update order status langsung dari banyak tempat; gunakan order service.

## Aturan Docker dan CI/CD

- Production build dilakukan di CI/CD, bukan di server production.
- Server production hanya pull image siap jalan dan restart container.
- Image tag rollback harus immutable, idealnya commit SHA.
- Tag `production` atau `latest` boleh menjadi alias convenience, bukan dasar rollback.
- Runtime image harus minimal.
- `.env` tidak boleh masuk image.
- Docker Compose production tidak boleh memakai bind mount source aplikasi.
- Jalankan `npm run lint`, `npm run typecheck`, dan `npm run build` sebelum merge fitur besar.

## Aturan Dokumentasi

Update dokumentasi jika perubahan menyentuh:

- roadmap;
- environment variable;
- API/route;
- database schema;
- RLS/security policy;
- Docker/CI/CD;
- payment/shipping provider;
- flow order/lead/customer;
- behavior user-facing;
- QA/UX note yang diselesaikan.

Jika perubahan kecil tidak memerlukan dokumentasi, sebutkan alasannya di summary akhir.

## Definition of Done

Minimal selesai untuk perubahan production-facing:

- Scope sesuai prompt.
- File terkait sudah dibaca sebelum edit.
- Tidak ada secret baru.
- Tidak ada fitur di luar roadmap.
- Lint/typecheck/build dijalankan bila relevan.
- Perubahan database memiliki migration dan rollback note.
- Security/performance impact dipertimbangkan.
- Dokumentasi terkait diperbarui.
- Summary akhir mencantumkan file yang berubah, risiko, dan rekomendasi test.
